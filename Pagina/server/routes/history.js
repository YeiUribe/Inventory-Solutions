import { Router } from 'express';
import { query } from '../db.js';
import { TABLES } from '../config.js';

const router = Router();
const asignaciones = TABLES.asignaciones;
const activos = TABLES.activos;
const empleados = TABLES.empleados;

// GET /api/history - RF-09
// Historial derivado de asignaciones (quién recibió qué y cuándo)
router.get('/', async (req, res) => {
  try {
    const rows = await query(`
      SELECT 
        a.id_asignacion AS id,
        a.fecha_entrega AS date,
        'Asignación' AS action,
        e.nombre_usuario AS user,
        CONCAT('Activo ', ac.nombre_equipo, ' asignado a ', e.nombre_usuario) AS details
      FROM \`${asignaciones}\` a
      LEFT JOIN \`${activos}\` ac ON a.activo_fijo = ac.activo_fijo
      LEFT JOIN \`${empleados}\` e ON a.cedula = e.cedula
      ORDER BY a.fecha_entrega DESC
      LIMIT 200
    `);

    const list = (rows || []).map((r) => ({
      id: r.id,
      date: r.date,
      action: r.action,
      user: r.user ?? '',
      details: r.details ?? '',
    }));

    res.json(list);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: err.message || 'Error al obtener historial' });
  }
});

export default router;
