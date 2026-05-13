import { Router } from 'express';
import { query } from '../db.js';
import { TABLES } from '../config.js';
import { validarAsignacion } from '../middlewares/validarAsignacion.js';

const router = Router();
const asignaciones = TABLES.asignaciones;
const activos = TABLES.activos;
const empleados = TABLES.empleados;
const ubicaciones = TABLES.ubicaciones;

// POST /api/asignaciones - Crear asignación (asignar activo a empleado)
router.post('/', validarAsignacion, async (req, res) => {
  try {
    const { activo_fijo, cedula, id_ubicacion, fecha_entrega, fecha_ingreso, perfil, concepto } = req.body;

    if (!activo_fijo || !cedula) {
      return res.status(400).json({ error: 'activo_fijo y cedula son requeridos' });
    }

    // Validar que la persona no tenga otro equipo activo asignado
    const existingByCedula = await query(`
      SELECT a.activo_fijo, ac.nombre_equipo
      FROM \`${asignaciones}\` a
      LEFT JOIN \`${activos}\` ac ON a.activo_fijo = ac.activo_fijo
      WHERE a.cedula = ? AND a.fecha_devolucion IS NULL
      ORDER BY a.fecha_entrega DESC, a.id_asignacion DESC
      LIMIT 1
    `, [cedula]);

    if (existingByCedula && existingByCedula.length > 0) {
      const equipoAsignado = existingByCedula[0];
      return res.status(400).json({
        error: `La persona ya tiene un equipo activo asignado (${equipoAsignado.activo_fijo}${equipoAsignado.nombre_equipo ? ` - ${equipoAsignado.nombre_equipo}` : ''}). Debe desvincularlo primero.`
      });
    }

    // Validar que el activo no tenga una asignación activa (sin fecha de devolución)
    const existingAsignacion = await query(`
      SELECT * FROM \`${asignaciones}\` 
      WHERE activo_fijo = ? AND fecha_devolucion IS NULL
      ORDER BY fecha_entrega DESC, id_asignacion DESC 
      LIMIT 1
    `, [activo_fijo]);

    if (existingAsignacion && existingAsignacion.length > 0) {
      const lastAsignacion = existingAsignacion[0];
      return res.status(400).json({ 
        error: `El activo ya está asignado a ${lastAsignacion.cedula}. Debe desvincular primero.` 
      });
    }

    await query(
      `INSERT INTO \`${asignaciones}\` (activo_fijo, cedula, id_ubicacion, fecha_entrega, fecha_ingreso, perfil, concepto) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        activo_fijo,
        cedula,
        id_ubicacion || null,
        fecha_entrega || new Date().toISOString().slice(0, 10),
        fecha_ingreso || null,
        perfil || null,
        concepto || null,
      ]
    );

    const rows = await query(`
      SELECT a.*, ac.nombre_equipo, em.nombre_usuario, u.ubicacion
      FROM \`${asignaciones}\` a
      LEFT JOIN \`${activos}\` ac ON a.activo_fijo = ac.activo_fijo
      LEFT JOIN \`${empleados}\` em ON a.cedula = em.cedula
      LEFT JOIN \`${ubicaciones}\` u ON a.id_ubicacion = u.id_ubicacion
      WHERE a.activo_fijo = ? 
      ORDER BY a.fecha_entrega DESC, a.id_asignacion DESC LIMIT 1
    `, [activo_fijo]);

    res.status(201).json(rows?.[0] ?? { success: true });
  } catch (err) {
    console.error('Create asignacion error:', err);
    res.status(500).json({ error: err.message || 'Error al crear asignación' });
  }
});

// GET /api/asignaciones?activo_fijo=XXX
router.get('/', async (req, res) => {
  try {
    const { activo_fijo } = req.query;
    let sql = `
      SELECT a.*, ac.nombre_equipo, em.nombre_usuario, u.ubicacion
      FROM \`${asignaciones}\` a
      LEFT JOIN \`${activos}\` ac ON a.activo_fijo = ac.activo_fijo
      LEFT JOIN \`${empleados}\` em ON a.cedula = em.cedula
      LEFT JOIN \`${ubicaciones}\` u ON a.id_ubicacion = u.id_ubicacion
    `;
    const params = [];
    if (activo_fijo) {
      sql += ' WHERE a.activo_fijo = ?';
      params.push(activo_fijo);
    }
    sql += ' ORDER BY a.fecha_entrega DESC, a.id_asignacion DESC';

    const rows = await query(sql, params);
    res.json(rows || []);
  } catch (err) {
    console.error('Get asignaciones error:', err);
    res.status(500).json({ error: err.message || 'Error al obtener asignaciones' });
  }
});

// PUT /api/asignaciones/devolver/:activo_fijo - Marcar asignación como devuelta
router.put('/devolver/:activo_fijo', async (req, res) => {
  try {
    const { activo_fijo } = req.params;
    const fecha_devolucion = new Date().toISOString().slice(0, 10);

    // Obtener la asignación activa
    const asignacionActiva = await query(`
      SELECT * FROM \`${asignaciones}\` 
      WHERE activo_fijo = ? AND fecha_devolucion IS NULL
      ORDER BY fecha_entrega DESC, id_asignacion DESC 
      LIMIT 1
    `, [activo_fijo]);

    if (!asignacionActiva || asignacionActiva.length === 0) {
      return res.status(404).json({ error: 'Este equipo no tiene una asignación activa' });
    }

    // Marcar como devuelto
    await query(
      `UPDATE \`${asignaciones}\` SET fecha_devolucion = ? WHERE id_asignacion = ?`,
      [fecha_devolucion, asignacionActiva[0].id_asignacion]
    );

    res.json({ success: true, message: 'Equipo devuelto correctamente' });
  } catch (err) {
    console.error('Devolver asignacion error:', err);
    res.status(500).json({ error: err.message || 'Error al devolver asignación' });
  }
});

export default router;
