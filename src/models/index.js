//Auditorias
import Auditorias from './Auditorias/Auditorias.js';

//Enums
import Entidad from '../utils/EntidadAuditoria.js';
import Accion from '../utils/AccionAuditoria.js';

//Tablas
import Presupuesto from './Presupuesto.js';
import Detalle from './Detalle.js';
import Producto from './Producto.js';
import Marca from './Marca.js';
import Categoria from './Categoria.js';

const HooksAuditProductos = () => {
  Producto.afterCreate(async (producto, options) => {
    if (!options.user) return;
    await Auditorias.create(
      {
        usuarioID: options.user.usuarioID,
        entidad: Entidad.PRODUCTO,
        entidadID: producto.productoID,
        accion: Accion.CREAR,
        estadoAnterior: null,
        estadoNuevo: JSON.stringify(producto.dataValues),
        descripcion: `El usuario ${options.user.nombre} creó el producto ${producto.nombre}.`,
      },
      {transaction: options.transaction}
    );
  });

  Producto.afterUpdate(async (producto, options) => {
    if (!options.user) return;
    await Auditorias.create(
      {
        usuarioID: options.user.usuarioID,
        entidad: Entidad.PRODUCTO,
        entidadID: producto.productoID,
        accion: Accion.MODIFICAR,
        estadoAnterior: JSON.stringify(producto._previousDataValues),
        estadoNuevo: JSON.stringify(producto.dataValues),
        descripcion: `El usuario ${options.user.nombre} modificó el producto ${producto.nombre}.`,
      },
      {transaction: options.transaction}
    );
  });

  Producto.afterDestroy(async (producto, options) => {
    if (!options.user) return;
    await Auditorias.create(
      {
        usuarioID: options.user.usuarioID,
        entidad: Entidad.PRODUCTO,
        entidadID: producto.productoID,
        accion: Accion.ELIMINAR,
        estadoAnterior: null,
        estadoNuevo: null,
        descripcion: `El usuario ${options.user.nombre} eliminó el producto ${producto.nombre}.`,
      },
      {transaction: options.transaction}
    );
  });

  Producto.beforeDestroy(async (producto, options) => {
    //Eliminar detalles asociados
    await Detalle.destroy({where: {productoID: producto.productoID}, transaction: options.transaction});
  });
};
const HooksAuditDetalles = () => {
  Detalle.afterCreate(async (detalle, options) => {
    if (!options.user) return;
    const presupuesto = await detalle.getPresupuesto();
    const producto = await detalle.getProducto();
    await Auditorias.create(
      {
        usuarioID: options.user.usuarioID,
        entidad: Entidad.DETALLE,
        entidadID: detalle.detalleID,
        accion: Accion.CREAR,
        estadoAnterior: null,
        estadoNuevo: JSON.stringify(detalle.dataValues),
        descripcion: `El usuario ${options.user.nombre} agregó: ${producto.nombre} x${detalle.cantidad} al presupuesto ${presupuesto.nombrePresupuesto}.`,
      },
      {transaction: options.transaction}
    );
  });

  Detalle.afterUpdate(async (detalle, options) => {
    if (!options.user) return;
    const presupuesto = await detalle.getPresupuesto();
    const producto = await detalle.getProducto();
    await Auditorias.create(
      {
        usuarioID: options.user.usuarioID,
        entidad: Entidad.DETALLE,
        entidadID: detalle.detalleID,
        accion: Accion.MODIFICAR,
        estadoAnterior: JSON.stringify(detalle._previousDataValues),
        estadoNuevo: JSON.stringify(detalle.dataValues),
        descripcion: `El usuario ${options.user.nombre} modificó el detalle del producto ${producto.nombre} en el presupuesto ${presupuesto.nombrePresupuesto}.`,
      },
      {transaction: options.transaction}
    );
  });

  Detalle.afterDestroy(async (detalle, options) => {
    if (!options.user) return;
    const presupuesto = await detalle.getPresupuesto();
    await Auditorias.create(
      {
        usuarioID: options.user.usuarioID,
        entidad: Entidad.DETALLE,
        entidadID: detalle.detalleID,
        accion: Accion.ELIMINAR,
        estadoAnterior: null,
        estadoNuevo: null,
        descripcion: `El usuario ${options.user.nombre} eliminó el detalle ${detalle.cabeceraID} del presupuesto ${presupuesto.nombrePresupuesto}.`,
      },
      {transaction: options.transaction}
    );
  });
};
const HooksAuditPresupuestos = () => {
  Presupuesto.afterCreate(async (presupuesto, options) => {
    if (!options.user) return;
    await Auditorias.create(
      {
        usuarioID: options.user.usuarioID,
        entidad: Entidad.PRESUPUESTO,
        entidadID: presupuesto.presupuestoID,
        accion: Accion.CREAR,
        estadoAnterior: null,
        estadoNuevo: JSON.stringify(presupuesto.dataValues),
        descripcion: `El usuario ${options.user.nombre} creó el presupuesto ${presupuesto.nombrePresupuesto}.`,
      },
      {transaction: options.transaction}
    );
  });

  Presupuesto.afterUpdate(async (presupuesto, options) => {
    if (!options.user) return;
    await Auditorias.create(
      {
        usuarioID: options.user.usuarioID,
        entidad: Entidad.PRESUPUESTO,
        entidadID: presupuesto.presupuestoID,
        accion: Accion.MODIFICAR,
        estadoAnterior: JSON.stringify(presupuesto._previousDataValues),
        estadoNuevo: JSON.stringify(presupuesto.dataValues),
        descripcion: `El usuario ${options.user.nombre} modificó el presupuesto ${presupuesto.nombrePresupuesto}.`,
      },
      {transaction: options.transaction}
    );
  });

  Presupuesto.afterDestroy(async (presupuesto, options) => {
    if (!options.user) return;
    await Auditorias.create(
      {
        usuarioID: options.user.usuarioID,
        entidad: Entidad.PRESUPUESTO,
        entidadID: presupuesto.presupuestoID,
        accion: Accion.ELIMINAR,
        estadoAnterior: null,
        estadoNuevo: null,
        descripcion: `El usuario ${options.user.nombre} eliminó el presupuesto ${presupuesto.nombrePresupuesto}.`,
      },
      {transaction: options.transaction}
    );
  });

  Presupuesto.beforeDestroy(async (presupuesto, options) => {
    //Eliminar detalles asociados
    await Detalle.destroy({where: {presupuestoID: presupuesto.presupuestoID}, transaction: options.transaction});
  });
};

const SetupDB = () => {
  //Relacion Tablas
  // Relacion Detalle - Presupuesto
  Detalle.belongsTo(Presupuesto, {foreignKey: 'presupuestoID', onDelete: 'CASCADE', as: 'Presupuesto'});
  Presupuesto.hasMany(Detalle, {foreignKey: 'presupuestoID', as: 'Detalles'});

  // Relación Detalle - Producto
  Detalle.belongsTo(Producto, {foreignKey: 'productoID', onDelete: 'CASCADE', as: 'Producto'});
  Producto.hasMany(Detalle, {foreignKey: 'productoID', as: 'Detalles'});

  // Relacion Producto - Marca
  Producto.belongsTo(Marca, {foreignKey: 'marcaID', onDelete: 'SET NULL', as: 'Marca'});
  Marca.hasMany(Producto, {foreignKey: 'marcaID', as: 'Productos'});

  //Relacion Producto - Categoria
  Producto.belongsTo(Categoria, {foreignKey: 'categoriaID', onDelete: 'SET NULL', as: 'Categoria'});
  Categoria.hasMany(Producto, {foreignKey: 'categoriaID', as: 'Productos'});

  //Hooks Auditorias
  HooksAuditPresupuestos();
  HooksAuditDetalles();
  HooksAuditProductos();
};

export {Presupuesto, Detalle, Producto, Marca, Categoria, Auditorias};
export default SetupDB;
