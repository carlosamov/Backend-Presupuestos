import {checkToken} from '../utils/JWT.js';
import Rol from '../utils/Rol.js';

import {Auditorias} from '../models/index.js';
import {Presupuesto} from '../models/index.js';
import {Detalle} from '../models/index.js';
import {Producto} from '../models/index.js';

//Para las auditorias
import Entidad from '../utils/EntidadAuditoria.js';
import Accion from '../utils/AccionAuditoria.js';

import Response from '../utils/Response.js';
import sequelize from '../config/sequelize.js';

//Configuracion de Socket.io
export default (io) => {
  //middleware de validacion
  io.use(async (socket, next) => {
    console.log('Handshake iniciado:', socket.id);
    const presupuestoID = socket?.handshake?.query?.presupuestoID || null;
    const cookies = socket?.handshake?.headers?.cookie || null;
    if (!presupuestoID) {
      console.log('PresupuestoID no proporcionado');
      return next(new Error('PresupuestoID no proporcionado'));
    }
    if (!cookies) {
      console.log('Cookies no proporcionadas');
      return next(new Error('Cookies no proporcionadas'));
    }

    const presupuesto = await Presupuesto.findByPk(presupuestoID);
    if (!presupuesto) {
      console.log('Presupuesto no encontrado');
      return next(new Error('Presupuesto no encontrado'));
    }
    const rawCookie = cookies.split('; ').find((row) => row.startsWith('token='));
    const cookie = rawCookie ? rawCookie.split('=')[1] : null;
    console.log('Token obtenido en el websocket:', cookie);

    if (!cookie) {
      console.log('Token no encontrado en las cookies');
      return next(new Error('Token no encontrado'));
    }
    if (!checkToken(cookie)) {
      console.log('Token inválido');
      return next(new Error('Token inválido'));
    }

    try {
      const decodedToken = checkToken(cookie); // Asume que checkToken devuelve el token decodificado
      const usuarioRol = decodedToken.rol;
      const presupuestoRol = presupuesto.rol;
      if (usuarioRol == Rol.USER && (presupuestoRol == Rol.ADMIN || presupuestoRol == Rol.SUPERADMIN)) {
        console.log('Acceso denegado: el usuario no tiene permiso para acceder a este presupuesto');
        return next(new Error('Acceso denegado: el usuario no tiene permiso para acceder a este presupuesto'));
      }
      console.log('Token y rol verificados correctamente');
      socket.usuario = decodedToken;
      return next();
    } catch (err) {
      console.error('Error al verificar el rol del usuario:', err);
      return next(new Error('Error al verificar el rol del usuario'));
    }
  });

  //FUNCIONES QUE INTERACTUAN CON EL SOCKET
  io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    //Evento 1 > Entrar Sala
    socket.on('usuario:entrarSala', async (presupuestoID) => {
      //Validación de datos
      if (!validarID(presupuestoID)) {
        console.log('ID de presupuesto inválido:', presupuestoID);
        socket.emit('mensaje:error', Response.error(400, 'ID de presupuesto inválido'));
        return;
      }

      console.log(`Cliente ${socket.id} quiere entrar a la sala: ${presupuestoID}`);
      try {
        const response = await obtenerPresupuesto(presupuestoID);
        if (response.success) {
          console.log('Presupuesto obtenido');
          socket.join('Presupuesto-' + presupuestoID);
          socket.emit('presupuesto:sincronizar', response);
        } else {
          console.log('No se pudo obtener el presupuesto:', response.message);
          socket.emit('mensaje:error', response);
        }
      } catch (err) {
        console.error('Error de webSocket:', err);
        socket.emit('mensaje:error', Response.error(500, 'Error al obtener el presupuesto', err));
      }
    });

    //Evento 2 > Modificar Presupuesto
    socket.on('presupuesto:modificar', async (presupuesto) => {
      console.log(`Cliente ${socket.id} quiere modificar el presupuesto: ${presupuesto.nombrePresupuesto}`);
      try {
        const response = await modificarPresupuesto(presupuesto, socket.usuario);
        if (response.success) {
          console.log(`Presupuesto modificado correctamente: ${presupuesto.presupuestoID}`);
          presupuesto = response.data;
          io.to('Presupuesto-' + presupuesto.presupuestoID).emit('presupuesto:sincronizar:modificar', response);
        } else {
          socket.emit('mensaje:error', response);
          return;
        }
      } catch (err) {
        console.error('Error de webSocket:', err);
        socket.emit('mensaje:error', Response.error(500, 'Error al modificar el presupuesto', err));
        return;
      }
    });

    //Evento 3 > Agregar Detalle
    socket.on('detalle:agregar', async (productoID, presupuestoID) => {
      console.log(`Cliente ${socket.id} quiere agregar un detalle al presupuesto: ${presupuestoID}`);
      try {
        const response = await agregarDetalle(productoID, presupuestoID, socket.usuario);
        if (response.success) {
          console.log('Detalle agregado correctamente');
          io.to('Presupuesto-' + presupuestoID).emit('detalle:sincronizar:agregar', response);
        } else {
          socket.emit('mensaje:error', response);
        }
      } catch (err) {
        console.error('Error de webSocket:', err);
        socket.emit('mensaje:error', Response.error(500, 'Error al agregar el detalle', err));
        return;
      }
    });

    //Evento 4 > Modificar Detalle
    socket.on('detalle:modificar', async (detalle) => {
      //Validación de datos
      if (!validarObjeto(detalle)) {
        console.log('Detalle inválido:', detalle);
        socket.emit('mensaje:error', Response.error(400, 'Detalle inválido'));
        return;
      }

      const {presupuestoID} = detalle;
      console.log(`Cliente ${socket.id} quiere modificar el detalle: ${detalle.detalleID} del presupuesto: ${presupuestoID}`);

      try {
        const response = await modificarDetalle(detalle, socket.usuario);
        if (response.success) {
          console.log('Detalle modificado correctamente');
          io.to('Presupuesto-' + presupuestoID).emit('detalle:sincronizar:modificar', response);
          return;
        } else {
          socket.emit('mensaje:error', response);
        }
      } catch (err) {
        console.error('Error de webSocket:', err);
        socket.emit('mensaje:error', Response.error(500, 'Error al modificar el detalle', err));
        return;
      }
    });

    //Evento 5 > Eliminar Detalle
    socket.on('detalle:eliminar', async (detalleID, presupuestoID) => {
      //Validación de datos
      if (!validarID(detalleID)) {
        console.log('ID de detalle inválido:', detalleID);
        socket.emit('mensaje:error', Response.error(400, 'ID de detalle inválido'));
        return;
      }

      console.log(`Cliente ${socket.id} quiere eliminar el detalle: ${detalleID}`);
      try {
        const response = await eliminarDetalle(detalleID, presupuestoID, socket.usuario);
        console.log(response);
        if (response.success) {
          console.log('Detalle eliminado correctamente:');
          io.to('Presupuesto-' + presupuestoID).emit('detalle:sincronizar:eliminar', response);
        } else {
          socket.emit('mensaje:error', response);
          return;
        }
      } catch (err) {
        console.error('Error de webSocket:', err);
        socket.emit('mensaje:error', Response.error(500, 'Error al eliminar el detalle', err));
        return;
      }
    });
  });
};

function validarID(id) {
  return id && typeof id === 'number' && id > 0;
}

function validarObjeto(obj) {
  return obj && typeof obj === 'object' && Object.keys(obj).length > 0;
}

//FUNCIONES QUE INTERACTUAN CON LA BASE DE DATOS
async function obtenerPresupuesto(presupuestoID) {
  try {
    const presupuesto = await Presupuesto.findByPk(presupuestoID, {attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']}});
    if (!presupuesto) {
      console.log(`Presupuesto con ID ${presupuestoID} no encontrado.`);
      return Response.error(404, 'Presupuesto no encontrado');
    }

    const detalles = await presupuesto.getDetalles({
      attributes: {exclude: ['createdAt', 'updatedAt', 'deletedAt']},
      include: [{model: Producto, as: 'Producto', attributes: ['productoID', 'nombre', 'enlace']}],
    });

    return Response.success(200, 'Presupuesto obtenido', {
      presupuesto: formatearPresupuesto(presupuesto),
      detalles: detalles.map((d) => formatearDetalle(d)),
    });
  } catch (err) {
    console.error('Error en obtenerPresupuesto:', err);
    return Response.error(500, 'Error al obtener el presupuesto', err);
  }
}

async function modificarPresupuesto(presupuesto, usuario) {
  const t = await sequelize.transaction();
  try {
    const presupuestoDB = await Presupuesto.findByPk(presupuesto.presupuestoID);
    if (!presupuestoDB) {
      console.log(`Presupuesto con ID ${presupuesto.presupuestoID} no encontrado.`);
      return Response.error(404, 'Presupuesto no encontrado');
    }

    await presupuestoDB.update(presupuesto, {transaction: t});
    await presupuestoDB.reload({transaction: t});
    await Auditorias.create(
      {
        usuarioID: usuario.usuarioID,
        entidad: Entidad.PRESUPUESTO,
        entidadID: presupuestoDB.presupuestoID,
        accion: Accion.MODIFICAR,
        estadoAnterior: JSON.stringify(presupuestoDB._previousDataValues),
        estadoNuevo: JSON.stringify(presupuestoDB.dataValues),
        descripcion: `El usuario ${usuario.nombre} modificó el presupuesto ${presupuestoDB.nombrePresupuesto}.`,
      },
      {transaction: t}
    );
    await t.commit();
    return Response.success(200, 'Presupuesto modificado', formatearPresupuesto(presupuestoDB));
  } catch (error) {
    await t.rollback();
    console.error('Error al modificar el presupuesto:', error);
    return Response.error(500, 'Error al modificar el presupuesto', error);
  }
}

async function agregarDetalle(productoID, presupuestoID, usuario) {
  const t = await sequelize.transaction();
  try {
    const presupuestoDB = await Presupuesto.findByPk(presupuestoID);
    if (!presupuestoDB) {
      return Response.error(404, 'Presupuesto no encontrado');
    }
    const productoDB = await Producto.findByPk(productoID);
    if (!productoDB) {
      return Response.error(404, 'Producto no encontrado');
    }

    let detallePredeterminado = {
      cantidad: 1,
      costoUnitario: Number(productoDB.precio || 0),
      traidaUnitariaPorcentaje: 0.4,
      gananciaUnitariaPorcentaje: 0.4,
      productoID: productoDB.productoID,
      presupuestoID: presupuestoDB.presupuestoID,
    };

    const detalleDB = await Detalle.create(detallePredeterminado, {transaction: t});
    const detalle = await Detalle.findByPk(detalleDB.detalleID, {transaction: t, include: [{model: Producto, as: 'Producto', attributes: ['productoID', 'nombre', 'enlace']}]});

    await detalle.setPresupuesto(presupuestoDB, {transaction: t});
    await Auditorias.create(
      {
        usuarioID: usuario.usuarioID,
        entidad: Entidad.DETALLE,
        entidadID: detalle.detalleID,
        accion: Accion.CREAR,
        estadoAnterior: null,
        estadoNuevo: JSON.stringify(detalle.dataValues),
        descripcion: `El usuario ${usuario.nombre} agregó un detalle con ${productoDB.nombre} al presupuesto ${presupuestoDB.nombrePresupuesto}.`,
      },
      {transaction: t}
    );
    await t.commit();
    return Response.success(201, 'Detalle agregado', formatearDetalle(detalle));
  } catch (error) {
    await t.rollback();
    console.error('Error al agregar detalle:', error);
    return Response.error(500, 'Error al agregar detalle', error);
  }
}

async function modificarDetalle(detalle, usuario) {
  const t = await sequelize.transaction();
  try {
    const detalleDB = await Detalle.findByPk(detalle.detalleID);
    if (!detalleDB) {
      return Response.error(404, 'Detalle no encontrado');
    }
    const presupuesto = await Presupuesto.findByPk(detalleDB.presupuestoID);
    if (!presupuesto) {
      return Response.error(404, 'Presupuesto no encontrado');
    }
    if (detalleDB.presupuestoID !== detalle.presupuestoID) {
      return Response.error(400, 'El detalle no pertenece al presupuesto proporcionado');
    }

    const {cantidad, costoUnitario, traidaUnitariaPorcentaje, gananciaUnitariaPorcentaje} = detalle;
    await detalleDB.update({cantidad, costoUnitario, traidaUnitariaPorcentaje, gananciaUnitariaPorcentaje}, {transaction: t});
    const detalleActualizado = await Detalle.findByPk(detalleDB.detalleID, {transaction: t, include: [{model: Producto, as: 'Producto', attributes: ['productoID', 'nombre', 'enlace']}]});
    await Auditorias.create(
      {
        usuarioID: usuario.usuarioID,
        entidad: Entidad.DETALLE,
        entidadID: detalleActualizado.detalleID,
        accion: Accion.MODIFICAR,
        estadoAnterior: JSON.stringify(detalleDB._previousDataValues),
        estadoNuevo: JSON.stringify(detalleActualizado.dataValues),
        descripcion: `El usuario ${usuario.nombre} modificó el detalle ${detalleActualizado.Producto.nombre} del presupuesto ${presupuesto.nombrePresupuesto}.`,
      },
      {transaction: t}
    );
    await t.commit();
    console.log('Detalle modificado:');
    return Response.success(200, 'Detalle modificado', formatearDetalle(detalleActualizado));
  } catch (err) {
    await t.rollback();
    return Response.error(500, 'Error al modificar el detalle', err);
  }
}

async function eliminarDetalle(detalleID, presupuestoID, usuario) {
  const t = await sequelize.transaction();
  try {
    const detalleDB = await Detalle.findByPk(detalleID, {include: [{model: Producto, as: 'Producto', attributes: ['nombre']}]});
    if (!detalleDB) {
      return Response.error(404, 'Detalle no encontrado');
    }
    const presupuesto = await Presupuesto.findByPk(detalleDB.presupuestoID);
    if (!presupuesto) {
      return Response.error(404, 'Presupuesto no encontrado');
    }
    if (detalleDB.presupuestoID !== presupuestoID) {
      return Response.error(400, 'El detalle no pertenece al presupuesto proporcionado');
    }

    await detalleDB.destroy({transaction: t});
    await Auditorias.create(
      {
        usuarioID: usuario.usuarioID,
        entidad: Entidad.DETALLE,
        entidadID: detalleDB.detalleID,
        accion: Accion.ELIMINAR,
        estadoAnterior: JSON.stringify(detalleDB.dataValues),
        estadoNuevo: null,
        descripcion: `El usuario ${usuario.nombre} eliminó el detalle con el producto ${detalleDB.Producto.nombre} del presupuesto ${presupuesto.nombrePresupuesto}.`,
      },
      {transaction: t}
    );
    await t.commit();
    return Response.success(200, 'Detalle eliminado', {detalleID, presupuestoID});
  } catch (err) {
    await t.rollback();
    return Response.error(500, 'Error al eliminar detalle', err);
  }
}

//Funciones de formateo
function formatearDetalle(detalle) {
  if (!(detalle instanceof Detalle)) return null;
  return {
    detalleID: detalle.detalleID,
    presupuestoID: detalle.presupuestoID,

    cantidad: detalle.cantidad,
    costoUnitario: Number(detalle.costoUnitario),
    traidaUnitariaPorcentaje: Number(detalle.traidaUnitariaPorcentaje),
    gananciaUnitariaPorcentaje: Number(detalle.gananciaUnitariaPorcentaje),
    Producto: {
      productoID: detalle.Producto?.productoID ?? null,
      nombre: detalle.Producto?.nombre ?? null,
      enlace: detalle.Producto?.enlace ?? null,
    },
    calculos: detalle.RealizarCalculos(),
  };
}
function formatearPresupuesto(presupuesto) {
  if (!(presupuesto instanceof Presupuesto)) return null;
  return {
    presupuestoID: presupuesto.presupuestoID,
    //Informacion del cliente
    nombrePresupuesto: presupuesto.nombrePresupuesto,
    nombreEmpresa: presupuesto.nombreEmpresa,
    direccionEmpresa: presupuesto.direccionEmpresa,
    ciudadEmpresa: presupuesto.ciudadEmpresa,
    representanteEmpresa: presupuesto.representanteEmpresa,
    //Informacion del presupuesto
    fecha: presupuesto.fecha,
    asunto: presupuesto.asunto,
    solucion: presupuesto.solucion,
    version: presupuesto.version,
    presupuesto: presupuesto.presupuesto,
    //Pie de pagina
    notasTiempoEntrega: presupuesto.notasTiempoEntrega,
    notasGarantias: presupuesto.notasGarantias,
    notas: presupuesto.notas,
    incoterm: presupuesto.incoterm,
    formaPago: presupuesto.formaPago,
    anticipo: presupuesto.anticipo,
    tiempoInstalacion: presupuesto.tiempoInstalacion,
    tiempoEntrega: presupuesto.tiempoEntrega,
    lugarEntrega: presupuesto.lugarEntrega,
  };
}
