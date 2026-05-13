import { Router } from 'express';
import { query } from '../db.js';
import { TABLES } from '../config.js';
import { validarInventario } from '../middlewares/validarInventario.js';

const router = Router();
const activos = TABLES.activos;
const contratos = TABLES.contratos;
const asignaciones = TABLES.asignaciones;
const empleados = TABLES.empleados;
const ubicaciones = TABLES.ubicaciones;
let hasFechaDevolucionCache;

const hasFechaDevolucionColumn = async () => {
  if (typeof hasFechaDevolucionCache === 'boolean') {
    return hasFechaDevolucionCache;
  }

  try {
    const rows = await query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_name = ? AND column_name = ?
       LIMIT 1`,
      [asignaciones, 'fecha_devolucion']
    );
    hasFechaDevolucionCache = Array.isArray(rows) && rows.length > 0;
  } catch {
    hasFechaDevolucionCache = false;
  }

  return hasFechaDevolucionCache;
};

// Mapea fila BD (activos + asignaciones + empleados + ubicaciones + contratos) -> formato frontend
const mapEquipoToFrontend = (row) => {
  if (!row) return null;
  const estado = row.estado || row.status || 'Disponible';

  return {
    id: String(row.activo_fijo ?? row.id ?? ''),
    activo_fijo: row.activo_fijo ?? row.id ?? '',
    device: row.nombre_equipo ?? row.device ?? '',
    nombre_equipo: row.nombre_equipo ?? row.device ?? '',
    category: row.tipo_equipo ?? row.category ?? '',
    tipo_equipo: row.tipo_equipo ?? row.category ?? '',
    status: estado,
    stock: 1,
    date: row.fecha_entrega ? String(row.fecha_entrega).slice(0, 10) : '',
    responsible: row.responsable ?? row.nombre_responsable ?? '',
    serial: row.serial,
    marca: row.marca ?? row.marca_modelo ?? '',
    marca_modelo: row.marca ?? row.marca_modelo ?? '',
    detalle_equipo: row.detalle_equipo ?? row.detalle ?? '',
    ocs: row.ocs ?? '',
    techpulse: row.techpulse ?? '',
    sophos: row.sophos ?? '',
    id_contrato: row.id_contrato ?? '',
    proveedor: row.proveedor ?? '',
    tipo_contrato: row.tipo_contrato ?? '',
    tarifa: row.tarifa ?? null,
    cedula: row.cedula_empleado ?? row.cedula ?? '',
    id_ubicacion: row.id_ubicacion ?? '',
    ciudad_entrega: row.ciudad_entrega ?? '',
    sede: row.sede ?? '',
    ubicacion: row.ubicacion ?? row.ubicacion_fisica ?? '',
    fecha_ingreso: row.fecha_ingreso ? String(row.fecha_ingreso).slice(0, 10) : '',
    perfil: row.perfil ?? '',
    concepto: row.concepto ?? '',
  };
};

// GET /api/inventory - RF-02
// Activos con responsable actual (última asignación ACTIVA - sin fecha_devolucion)
router.get('/', async (req, res) => {
  try {
    const hasFechaDevolucion = await hasFechaDevolucionColumn();
    const activeFilter = hasFechaDevolucion ? 'AND ax.fecha_devolucion IS NULL' : '';
    const fechaDevolucionSelect = hasFechaDevolucion
      ? 'asg.fecha_devolucion,'
      : 'NULL::date AS fecha_devolucion,';

    const rows = await query(`
      SELECT 
        a.activo_fijo, a.serial, a.nombre_equipo, a.marca, a.detalle_equipo, a.tipo_equipo, a.estado,
        a.ocs, a.techpulse, a.sophos, a.id_contrato,
        c.proveedor, c.tipo_contrato, c.tarifa,
        asg.fecha_entrega, asg.fecha_ingreso, asg.perfil, asg.concepto, ${fechaDevolucionSelect}
        e.cedula AS cedula_empleado, e.nombre_usuario AS responsable,
        u.id_ubicacion, u.ciudad_entrega, u.sede, u.ubicacion
      FROM \`${activos}\` a
      LEFT JOIN \`${contratos}\` c ON a.id_contrato = c.id_contrato
      LEFT JOIN LATERAL (
        SELECT ax.*
        FROM \`${asignaciones}\` ax
        WHERE ax.activo_fijo = a.activo_fijo ${activeFilter}
        ORDER BY ax.fecha_entrega DESC, ax.id_asignacion DESC
        LIMIT 1
      ) asg ON TRUE
      LEFT JOIN \`${empleados}\` e ON asg.cedula = e.cedula
      LEFT JOIN \`${ubicaciones}\` u ON asg.id_ubicacion = u.id_ubicacion
      ORDER BY a.activo_fijo
    `);

    const list = (rows || []).map(mapEquipoToFrontend);
    res.json(list);
  } catch (err) {
    console.error('Get inventory error:', err);
    res.status(500).json({ error: err.message || 'Error al obtener inventario' });
  }
});

// POST /api/inventory - RF-01
router.post('/', validarInventario, async (req, res) => {
  try {
    const body = req.body;
    const user = req.headers['x-user-name'] || 'Sistema';

    const activo_fijo = body.activo_fijo || body.id || `EQ${Date.now().toString().slice(-6)}`;
    const serial = body.serial || null;
    const nombre_equipo = body.device || body.nombre_equipo || '';
    const marca = body.marca || body.marca_modelo || '';
    const detalle_equipo = body.detalle_equipo || body.detalle || '';
    const tipo_equipo = body.category || body.tipo_equipo || 'Portatil';
    const estado = body.status || body.estado || 'Disponible';
    const ocs = body.ocs || null;
    const techpulse = body.techpulse || null;
    const sophos = body.sophos || null;
    const id_contrato = body.id_contrato || null;

    await query(
      `INSERT INTO \`${activos}\` (activo_fijo, serial, nombre_equipo, marca, detalle_equipo, tipo_equipo, estado, ocs, techpulse, sophos, id_contrato) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [activo_fijo, serial, nombre_equipo, marca, detalle_equipo, tipo_equipo, estado, ocs, techpulse, sophos, id_contrato]
    );

    const inserted = await query(`SELECT * FROM \`${activos}\` WHERE activo_fijo = ?`, [activo_fijo]);
    const newItem = mapEquipoToFrontend(Array.isArray(inserted) ? inserted[0] : inserted ?? {
      activo_fijo, serial, nombre_equipo, marca, detalle_equipo, tipo_equipo, estado, ocs, techpulse, sophos, id_contrato
    });

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Add inventory error:', err);
    res.status(500).json({ error: err.message || 'Error al agregar' });
  }
});

// PUT /api/inventory/:id - RF-03
router.put('/:id', validarInventario, async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const hasFechaDevolucion = await hasFechaDevolucionColumn();

    const rows = await query(`SELECT * FROM \`${activos}\` WHERE activo_fijo = ?`, [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const oldEstado = rows[0].estado;
    const nombre_equipo = body.device ?? body.nombre_equipo ?? rows[0].nombre_equipo;
    const marca = body.marca ?? body.marca_modelo ?? rows[0].marca ?? '';
    const detalle_equipo = body.detalle_equipo ?? body.detalle ?? rows[0].detalle_equipo ?? '';
    const tipo_equipo = body.category ?? body.tipo_equipo ?? rows[0].tipo_equipo;
    const estado = body.status ?? body.estado ?? rows[0].estado ?? 'Activo';
    const serial = body.serial ?? rows[0].serial;
    const ocs = body.ocs ?? rows[0].ocs ?? null;
    const techpulse = body.techpulse ?? rows[0].techpulse ?? null;
    const sophos = body.sophos ?? rows[0].sophos ?? null;
    const id_contrato = body.id_contrato ?? rows[0].id_contrato ?? null;

    // Si cambias de estado (que no sea "Disponible") a "Disponible", devuelve el equipo
    if (hasFechaDevolucion && oldEstado !== 'Disponible' && estado === 'Disponible') {
      await query(
        `UPDATE \`${asignaciones}\` SET fecha_devolucion = ? WHERE activo_fijo = ? AND fecha_devolucion IS NULL`,
        [new Date().toISOString().slice(0, 10), id]
      );
    }

    const activeFilter = hasFechaDevolucion ? 'AND ax.fecha_devolucion IS NULL' : '';
    const fechaDevolucionSelect = hasFechaDevolucion
      ? 'asg.fecha_devolucion,'
      : 'NULL::date AS fecha_devolucion,';

    await query(
      `UPDATE \`${activos}\` SET nombre_equipo = ?, marca = ?, detalle_equipo = ?, tipo_equipo = ?, estado = ?, serial = ?, ocs = ?, techpulse = ?, sophos = ?, id_contrato = ?
       WHERE activo_fijo = ?`,
      [nombre_equipo, marca, detalle_equipo, tipo_equipo, estado, serial, ocs, techpulse, sophos, id_contrato, id]
    );

    const updated = await query(`
      SELECT a.*, c.proveedor, asg.fecha_entrega, asg.fecha_ingreso, asg.perfil, asg.concepto, ${fechaDevolucionSelect} e.nombre_usuario AS responsable, u.ubicacion
      FROM \`${activos}\` a
      LEFT JOIN \`${contratos}\` c ON a.id_contrato = c.id_contrato
      LEFT JOIN LATERAL (
        SELECT ax.*
        FROM \`${asignaciones}\` ax
        WHERE ax.activo_fijo = a.activo_fijo ${activeFilter}
        ORDER BY ax.fecha_entrega DESC, ax.id_asignacion DESC
        LIMIT 1
      ) asg ON TRUE
      LEFT JOIN \`${empleados}\` e ON asg.cedula = e.cedula
      LEFT JOIN \`${ubicaciones}\` u ON asg.id_ubicacion = u.id_ubicacion
      WHERE a.activo_fijo = ?
    `, [id]);

    res.json(mapEquipoToFrontend(Array.isArray(updated) ? updated[0] : updated ?? { activo_fijo: id, nombre_equipo, marca, detalle_equipo, tipo_equipo, estado, serial, ocs, techpulse, sophos, id_contrato }));
  } catch (err) {
    console.error('Update inventory error:', err);
    res.status(500).json({ error: err.message || 'Error al actualizar' });
  }
});

// DELETE /api/inventory/:id - RF-04
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const rows = await query(`SELECT * FROM \`${activos}\` WHERE activo_fijo = ?`, [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const asigs = await query(`SELECT * FROM \`${asignaciones}\` WHERE activo_fijo = ?`, [id]);
    if (asigs && asigs.length > 0) {
      return res.status(400).json({
        error: 'No es posible eliminar el equipo porque tiene asignaciones activas.',
      });
    }

    await query(`DELETE FROM \`${activos}\` WHERE activo_fijo = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Delete inventory error:', err);
    res.status(500).json({ error: err.message || 'Error al eliminar' });
  }
});

export default router;
