import express from 'express';
const router = express.Router();

import AuditModel from '../models/Auditorias/Auditorias.js';
import UsuarioModel from '../models/Usuario.js';
import Response from '../utils/Response.js';

//Middleware
import {isSuperAdmin, isAdmin, isUser} from '../middleware/verifyToken.js';

//Controlador

// Ruta para auditorías
router.get('/audits', isUser, getAllAudits);

async function getAllAudits(req, res) {
  try {
    const audits = await AuditModel.findAll({order: [['createdAt', 'DESC']]});

    const auditoriasFormat = await Promise.all(
      audits.map(async (a) => {
        const user = await UsuarioModel.findByPk(a.usuarioID);
        return {
          auditoriaID: a.auditoriaID,
          fecha: new Date(a.createdAt).toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
          usuario: user ? user.nombre : 'Desconocido',
          accion: a.accion.charAt(0).toUpperCase() + a.accion.slice(1).toLowerCase(),
          entidad: a.entidad.charAt(0).toUpperCase() + a.entidad.slice(1).toLowerCase(),
          descripcion: a.descripcion,
        };
      })
    );
    const groupedAudits = groupByUserAndDate(auditoriasFormat);

    console.log('Auditorías obtenidas exitosamente');
    res.status(200).json(Response.success(200, 'Auditorías obtenidas exitosamente', groupedAudits));
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log('Conflicto de datos únicos:', err);
      return res.status(409).json(Response.error(409, 'Conflicto de datos únicos', err.errors));
    } else if (err.name === 'SequelizeValidationError') {
      console.log('Error de validación:', err);
      return res.status(422).json(Response.error(422, 'Error de validación', err.errors));
    }
    console.log('Error al obtener las auditorías:', err);
    return res.status(500).json(Response.error(500, `Error al obtener las auditorías: ${err.message}`, err));
  }
}

function groupByUserAndDate(items) {
  const grouped = [];
  let currentGroup = [];

  for (const item of items) {
    const itemDate = item.fecha.split(',')[0]; // Extrae solo la parte de la fecha (dd/mm/yyyy)
    const lastItem = currentGroup[currentGroup.length - 1];
    const lastDate = lastItem ? lastItem.fecha.split(',')[0] : null;

    if (currentGroup.length === 0 || (lastItem.usuario === item.usuario && lastDate === itemDate)) {
      currentGroup.push(item);
    } else {
      grouped.push(currentGroup);
      currentGroup = [item];
    }
  }

  if (currentGroup.length > 0) {
    grouped.push(currentGroup);
  }

  return grouped;
}

export default router;
