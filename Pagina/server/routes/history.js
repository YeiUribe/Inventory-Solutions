import { Router } from 'express';
import { obtenerHistorialCompleto, obtenerHistorialEquipo, obtenerHistorialUsuario } from '../services/audit.js';

const router = Router();

// GET /api/history - RF-09
// Historial completo de movimientos (creación, edición, eliminación, asignaciones, devoluciones)
router.get('/', async (req, res) => {
  try {
    const { tipo, tabla, id_registro, usuario } = req.query;

    const filtros = {};
    if (tipo) filtros.tipo_movimiento = tipo;
    if (tabla) filtros.tabla = tabla;
    if (id_registro) filtros.id_registro = id_registro;
    if (usuario) filtros.usuario = usuario;

    const historial = await obtenerHistorialCompleto(filtros);

    const formattedHistorial = historial.map((h) => ({
      id: h.id,
      date: h.fecha,
      action: h.action, // CREATE, UPDATE, DELETE, ASSIGN, RETURN
      tabla: h.tabla,
      id_registro: h.id_registro,
      user: h.user,
      details: h.detalles,
      estado_anterior: h.estado_anterior,
      estado_nuevo: h.estado_nuevo,
      resumen: generarResumen(h),
    }));

    res.json(formattedHistorial);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: err.message || 'Error al obtener historial' });
  }
});

// GET /api/history/equipo/:activo_fijo - Historial de un equipo específico
router.get('/equipo/:activo_fijo', async (req, res) => {
  try {
    const { activo_fijo } = req.params;
    const historial = await obtenerHistorialEquipo(activo_fijo);

    const formattedHistorial = historial.map((h) => ({
      id: h.id,
      date: h.fecha,
      action: h.action,
      tabla: h.tabla,
      user: h.user,
      details: h.detalles,
      estado_anterior: h.estado_anterior,
      estado_nuevo: h.estado_nuevo,
      resumen: generarResumen(h),
    }));

    res.json(formattedHistorial);
  } catch (err) {
    console.error('Get equipo history error:', err);
    res.status(500).json({ error: err.message || 'Error al obtener historial del equipo' });
  }
});

// GET /api/history/usuario/:cedula - Historial de asignaciones de un usuario
router.get('/usuario/:cedula', async (req, res) => {
  try {
    const { cedula } = req.params;
    const historial = await obtenerHistorialUsuario(cedula);

    const formattedHistorial = historial.map((h) => ({
      id: h.id,
      date: h.fecha,
      action: h.action,
      tabla: h.tabla,
      user: h.user,
      details: h.detalles,
      estado_anterior: h.estado_anterior,
      estado_nuevo: h.estado_nuevo,
      resumen: generarResumen(h),
    }));

    res.json(formattedHistorial);
  } catch (err) {
    console.error('Get usuario history error:', err);
    res.status(500).json({ error: err.message || 'Error al obtener historial del usuario' });
  }
});

/**
 * Genera un resumen legible del movimiento
 */
function generarResumen(movimiento) {
  const { action, detalles, estado_anterior, estado_nuevo, user } = movimiento;

  switch (action) {
    case 'CREATE':
      return `${user} creó el equipo ${detalles?.nombre_equipo || detalles?.activo_fijo}`;
    case 'UPDATE':
      const cambios = [];
      if (estado_anterior?.estado !== estado_nuevo?.estado) {
        cambios.push(`estado: ${estado_anterior?.estado} → ${estado_nuevo?.estado}`);
      }
      if (estado_anterior?.nombre_equipo !== estado_nuevo?.nombre_equipo) {
        cambios.push(`nombre: ${estado_anterior?.nombre_equipo} → ${estado_nuevo?.nombre_equipo}`);
      }
      if (estado_anterior?.marca !== estado_nuevo?.marca) {
        cambios.push(`marca: ${estado_anterior?.marca} → ${estado_nuevo?.marca}`);
      }
      return `${user} actualizó el equipo (${cambios.join(', ')})`;
    case 'DELETE':
      return `${user} eliminó el equipo ${detalles?.nombre_equipo || detalles?.activo_fijo}`;
    case 'ASSIGN':
      return `${user} asignó ${detalles?.nombre_equipo} a ${detalles?.nombre_usuario} el ${detalles?.fecha_entrega}`;
    case 'RETURN':
      return `${user} registró la devolución de ${detalles?.nombre_equipo} por ${detalles?.nombre_usuario}`;
    default:
      return `${user} realizó una acción: ${action}`;
  }
}

export default router;
