import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import {dirname} from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
import reqID from '../middleware/verifyId.js';

import {Presupuesto, Producto} from '../models/index.js';
import Rol from '../utils/Rol.js';
import Response from '../utils/Response.js';

import ExcelJS from 'exceljs';

//Middleware
import {isSuperAdmin, isAdmin, isUser} from '../middleware/verifyToken.js';

//Funciones Genericas
const clonarPlantilla = (plantilla, destino, offset = 0) => {
  //Copiar bloque de plantilla
  plantilla.eachRow({includeEmpty: true}, (row, rowNumber) => {
    const nuevaFila = destino.getRow(rowNumber + offset);
    row.eachCell({includeEmpty: true}, (cell, colNumber) => {
      if (colNumber > 22) return; //Solo copiar hasta la columna V
      const nuevaCelda = nuevaFila.getCell(colNumber);
      nuevaCelda.value = cell.value;
      nuevaCelda.style = JSON.parse(JSON.stringify(cell.style));
      nuevaCelda.style.borders = cell.style.borders;
    });
    nuevaFila.height = row.height;
  });
  plantilla.columns.forEach((col, index) => {
    const destinoCol = destino.getColumn(index + 1);
    destinoCol.width = col.width;
    destinoCol.hidden = col.hidden;
    destinoCol.outlineLevel = col.outlineLevel;
    destinoCol.key = col.key;
  });
  return true;
};

const copiarMerges = (origen, destino, offset = 0) => {
  try {
    const merges = Object.values(origen._merges);

    merges.forEach(({model}) => {
      const {top, left, bottom, right} = model;
      destino.mergeCells(top + offset, left, bottom + offset, right);
    });
    return true;
  } catch (err) {
    console.error('Error al copiar los merges de las celdas:', err);
    return false;
  }
};

// Ruta para marcas
router.get('/xlsx/:id', isUser, reqID, async (req, res) => {
  // Lógica para crear el PDF
  console.log('Haciendo el XLSX...');

  const presupuesto = await Presupuesto.findByPk(req.params.id);
  if (!presupuesto) {
    return Response.error(404, 'Presupuesto no encontrado');
  }
  const detalles = await presupuesto.getDetalles({
    include: [
      {
        model: Producto,
        as: 'Producto',
        attributes: ['descripcion'],
      },
    ],
  });
  if (detalles.length === 0) {
    return Response.error(404, 'No hay detalles para este presupuesto');
  }

  //Primero cargar la plantilla de Excel
  const workbookPlantilla = new ExcelJS.Workbook();
  const templatePath = path.resolve(__dirname, '../templates/FormatoPresupuesto.xlsx');
  await workbookPlantilla.xlsx.readFile(templatePath);
  const hojaPlantilla = workbookPlantilla.getWorksheet('presupuesto');
  const finalHoja = workbookPlantilla.getWorksheet('final');
  if (!hojaPlantilla || !finalHoja) {
    return Response.error(500, 'La plantilla de Excel no contiene las hojas necesarias.');
  }

  const itemPorPagina = 22; //Cada pagina tiene 22 items
  const totalPaginas = Math.ceil(detalles.length / itemPorPagina); //Total de paginas necesarias (sin contar la final)
  const filaInicio = 19; //Fila donde empiezan los items
  const tamañoPaginaItems = 40; //Tamaño de cada pagina en filas
  const workbook = new ExcelJS.Workbook();
  const hoja = await workbook.addWorksheet('presupuesto');

  //Creacion del las paginas de items
  for (let i = 0; i < totalPaginas; i++) {
    const offset = i * tamañoPaginaItems;
    hoja.addImage(imgID, {
      tl: {col: 0.2, row: 0.2 + offset},
      br: {col: 4.2, row: 4.2 + offset},
    });

    //Clonar el estilo de la plantilla
    clonarPlantilla(hojaPlantilla, hoja, offset);

    //Copiar el merge de la plantilla
    copiarMerges(hojaPlantilla, hoja, offset);

    //Insertar la cabecera
    let cell = null;
    cell = hoja.getCell(`C${9 + offset}`);
    cell.value = presupuesto.nombreEmpresa;
    cell = hoja.getCell(`C${10 + offset}`);
    cell.value = presupuesto.direccionEmpresa;
    cell = hoja.getCell(`C${12 + offset}`);
    cell.value = presupuesto.ciudadEmpresa;
    cell = hoja.getCell(`C${13 + offset}`);
    cell.value = presupuesto.representanteEmpresa;

    cell = hoja.getCell(`J${9 + offset}`);
    cell.value = new Date(presupuesto.fecha);
    cell = hoja.getCell(`J${10 + offset}`);
    cell.value = presupuesto.asunto;
    cell = hoja.getCell(`J${11 + offset}`);
    cell.value = presupuesto.solucion;
    cell = hoja.getCell(`J${12 + offset}`);
    cell.value = presupuesto.version;
    cell = hoja.getCell(`J${13 + offset}`);
    cell.value = presupuesto.presupuesto;

    //Insertar los items
    for (let j = 0; j < itemPorPagina; j++) {
      const index = i * itemPorPagina + j;
      if (index >= detalles.length) break;
      const detalle = detalles[index];

      const fila = filaInicio + offset + j;
      const calculos = detalle.RealizarCalculos();
      hoja.getCell(`B${fila}`).value = detalle.cantidad;
      hoja.getCell(`C${fila}`).value = detalle.Producto.descripcion;
      hoja.getCell(`J${fila}`).value = calculos.precioUnitario;
      hoja.getCell(`K${fila}`).value = calculos.totalDetalle;

      //Adicionado del Sr. Jose (Mostrar tooodo los datos de la fila)
      hoja.getCell(`N${fila}`).value = calculos.costoUnitario;
      hoja.getCell(`O${fila}`).value = Number(detalle.traidaUnitariaPorcentaje);
      hoja.getCell(`P${fila}`).value = calculos.traidaUnitaria;
      hoja.getCell(`Q${fila}`).value = Number(detalle.gananciaUnitariaPorcentaje);
      hoja.getCell(`R${fila}`).value = calculos.gananciaUnitaria;

      hoja.getCell(`S${fila}`).value = calculos.costoCantidad;
      hoja.getCell(`T${fila}`).value = calculos.traidaCantidad;
      hoja.getCell(`U${fila}`).value = calculos.gananciaCantidad;
    }
  }

  //Creacion de la pagina final
  //Clonando el estilo de la plantilla
  const offsetFinal = totalPaginas * tamañoPaginaItems;
  clonarPlantilla(finalHoja, hoja, offsetFinal);
  //Ajustar los merge de las celdas
  copiarMerges(finalHoja, hoja, offsetFinal);

  //Insertando cabecera
  //Insertar la cabecera
  const offset = totalPaginas * tamañoPaginaItems;
  let cell = null;
  cell = hoja.getCell(`C${9 + offset}`);
  cell.value = presupuesto.nombreEmpresa;
  cell = hoja.getCell(`C${10 + offset}`);
  cell.value = presupuesto.direccionEmpresa;
  cell = hoja.getCell(`C${12 + offset}`);
  cell.value = presupuesto.ciudadEmpresa;
  cell = hoja.getCell(`C${13 + offset}`);
  cell.value = presupuesto.representanteEmpresa;

  cell = hoja.getCell(`J${9 + offset}`);
  cell.value = presupuesto.fecha;
  cell = hoja.getCell(`J${10 + offset}`);
  cell.value = presupuesto.asunto;
  cell = hoja.getCell(`J${11 + offset}`);
  cell.value = presupuesto.solucion;
  cell = hoja.getCell(`J${12 + offset}`);
  cell.value = presupuesto.version;
  cell = hoja.getCell(`J${13 + offset}`);
  cell.value = presupuesto.presupuesto;

  //Insertando valores
  cell = hoja.getCell(`B${28 + offsetFinal}`);
  cell.value = presupuesto.notasTiempoEntrega ?? '';
  cell = hoja.getCell(`B${33 + offsetFinal}`);
  cell.value = presupuesto.notasGarantias ?? '';
  cell = hoja.getCell(`B${37 + offsetFinal}`);
  cell.value = presupuesto.notas ?? '';

  cell = hoja.getCell(`C${50 + offsetFinal}`);
  cell.value = presupuesto.incoterm ?? '';
  cell = hoja.getCell(`C${51 + offsetFinal}`);
  cell.value = presupuesto.formaPago ?? '';
  cell = hoja.getCell(`C${52 + offsetFinal}`);
  cell.value = presupuesto.anticipo ?? '';

  cell = hoja.getCell(`C${53 + offsetFinal}`);
  cell.value = presupuesto.tiempoInstalacion ?? '';
  cell = hoja.getCell(`C${54 + offsetFinal}`);
  cell.value = presupuesto.tiempoEntrega ?? '';
  cell = hoja.getCell(`C${55 + offsetFinal}`);
  cell.value = presupuesto.lugarEntrega ?? '';

  const calculos = await presupuesto.ObtenerCalculos();
  cell = hoja.getCell(`K${22 + offsetFinal}`);
  cell.value = calculos.totalPresupuesto.toNumber();

  cell = hoja.getCell(`N${22 + offsetFinal}`);
  cell.value = calculos.costoCantidad.toNumber();
  cell = hoja.getCell(`O${22 + offsetFinal}`);
  cell.value = calculos.costoTraida.toNumber();
  cell = hoja.getCell(`P${22 + offsetFinal}`);
  cell.value = calculos.gananciaTotal.toNumber();

  //Ajustar el area de impresion
  hoja.pageSetup = {
    ...hoja.pageSetup,
    paperSize: 9, // A4
    orientation: 'landscape', // horizontal
    fitToPage: true, // ajustar a una sola página
    fitToWidth: 1, // 1 página de ancho
    fitToHeight: 0, // altura ilimitada
    printArea: `A1:M${totalPaginas * tamañoPaginaItems + 57}`, // área de impresión
    horizontalCentered: true, // centrar horizontalmente
    verticalCentered: false,
  };
  hoja.pageSetup.printArea = `A1:M${60 + offsetFinal}`;

  //Enviar el archivo al front
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=Presupuesto_${presupuesto.id}.xlsx`);
  const buffer = await workbook.xlsx.writeBuffer();
  console.log('Fin del XLSX...');
  return res.send(buffer);
});

export default router;
