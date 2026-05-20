import { Router } from 'express';
import { query } from '../db.js';
import { TABLES } from '../config.js';
import { validarInventario } from '../middlewares/validarInventario.js';
import requireAdmin from '../middlewares/requireAdmin.js';
import { registrarMovimiento } from '../services/audit.js';

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
router.post('/', validarInventario, requireAdmin, async (req, res) => {
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

    // 📝 Registrar creación en auditoría
    await registrarMovimiento(
      'CREATE',
      activos,
      activo_fijo,
      user,
      {
        activo_fijo,
        nombre_equipo,
        tipo_equipo,
        marca,
        serial,
        estado,
        detalles: detalle_equipo,
      },
      null,
      newItem
    );

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Add inventory error:', err);
    res.status(500).json({ error: err.message || 'Error al agregar' });
  }
});

// PUT /api/inventory/:id - RF-03
router.put('/:id', validarInventario, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const user = req.headers['x-user-name'] || 'Sistema';
    const hasFechaDevolucion = await hasFechaDevolucionColumn();

    const rows = await query(`SELECT * FROM \`${activos}\` WHERE activo_fijo = ?`, [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const oldData = rows[0];
    const oldEstado = oldData.estado;
    const nombre_equipo = body.device ?? body.nombre_equipo ?? oldData.nombre_equipo;
    const marca = body.marca ?? body.marca_modelo ?? oldData.marca ?? '';
    const detalle_equipo = body.detalle_equipo ?? body.detalle ?? oldData.detalle_equipo ?? '';
    const tipo_equipo = body.category ?? body.tipo_equipo ?? oldData.tipo_equipo;
    const estado = body.status ?? body.estado ?? oldData.estado ?? 'Activo';
    const serial = body.serial ?? oldData.serial;
    const ocs = body.ocs ?? oldData.ocs ?? null;
    const techpulse = body.techpulse ?? oldData.techpulse ?? null;
    const sophos = body.sophos ?? oldData.sophos ?? null;
    const id_contrato = body.id_contrato ?? oldData.id_contrato ?? null;

    // Si cambias de estado (que no sea "Disponible") a "Disponible", devuelve el equipo
    if (hasFechaDevolucion && oldEstado !== 'Disponible' && estado === 'Disponible') {
      const asignActiva = await query(
        `SELECT * FROM \`${asignaciones}\` WHERE activo_fijo = ? AND fecha_devolucion IS NULL ORDER BY fecha_entrega DESC LIMIT 1`,
        [id]
      );
      if (asignActiva && asignActiva.length > 0) {
        await query(
          `UPDATE \`${asignaciones}\` SET fecha_devolucion = ? WHERE id_asignacion = ?`,
          [new Date().toISOString().slice(0, 10), asignActiva[0].id_asignacion]
        );
        
        // 📝 Registrar devolución
        await registrarMovimiento(
          'RETURN',
          asignaciones,
          asignActiva[0].id_asignacion,
          user,
          {
            activo_fijo: id,
            cedula: asignActiva[0].cedula,
            fecha_devolucion: new Date().toISOString().slice(0, 10),
          }
        );
      }
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

    const updatedItem = mapEquipoToFrontend(Array.isArray(updated) ? updated[0] : updated ?? {
      activo_fijo: id, nombre_equipo, marca, detalle_equipo, tipo_equipo, estado, serial, ocs, techpulse, sophos, id_contrato
    });

    // 📝 Registrar actualización en auditoría (solo si hay cambios)
    const estadoAnterior = {
      nombre_equipo: oldData.nombre_equipo,
      tipo_equipo: oldData.tipo_equipo,
      marca: oldData.marca,
      serial: oldData.serial,
      estado: oldEstado,
      detalles: oldData.detalle_equipo,
    };
    
    const estadoNuevo = {
      nombre_equipo,
      tipo_equipo,
      marca,
      serial,
      estado,
      detalles: detalle_equipo,
    };

    if (JSON.stringify(estadoAnterior) !== JSON.stringify(estadoNuevo)) {
      await registrarMovimiento(
        'UPDATE',
        activos,
        id,
        user,
        { activo_fijo: id },
        estadoAnterior,
        estadoNuevo
      );
    }

    res.json(updatedItem);
  } catch (err) {
    console.error('Update inventory error:', err);
    res.status(500).json({ error: err.message || 'Error al actualizar' });
  }
});

// DELETE /api/inventory/:id - RF-04
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const user = req.headers['x-user-name'] || 'Sistema';

    const rows = await query(`SELECT * FROM \`${activos}\` WHERE activo_fijo = ?`, [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Equipo no encontrado' });
    }

    const equipoData = rows[0];

    const asigs = await query(`SELECT * FROM \`${asignaciones}\` WHERE activo_fijo = ? AND fecha_devolucion IS NULL`, [id]);
    if (asigs && asigs.length > 0) {
      return res.status(400).json({
        error: 'No es posible eliminar el equipo porque tiene asignaciones activas.',
      });
    }

    await query(`DELETE FROM \`${activos}\` WHERE activo_fijo = ?`, [id]);

    // 📝 Registrar eliminación en auditoría
    await registrarMovimiento(
      'DELETE',
      activos,
      id,
      user,
      {
        activo_fijo: id,
        nombre_equipo: equipoData.nombre_equipo,
        tipo_equipo: equipoData.tipo_equipo,
        marca: equipoData.marca,
        serial: equipoData.serial,
      },
      mapEquipoToFrontend(equipoData),
      null
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Delete inventory error:', err);
    res.status(500).json({ error: err.message || 'Error al eliminar' });
  }
});

export default router;
