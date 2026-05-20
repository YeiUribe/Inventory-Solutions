import { query } from '../db.js';
import { TABLES } from '../config.js';

const AUDIT_TABLE = 'audit_log';

/**
 * Parse JSONB de forma segura (puede venir como string o como objeto)
 */
const parseJsonB = (data) => {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }
  return data;
};

/**
 * Registra un evento en el log de auditoría
 * @param {string} tipo_movimiento - CREATE, UPDATE, DELETE, ASSIGN, UNASSIGN, RETURN
 * @param {string} tabla - Nombre de la tabla afectada
 * @param {string|number} id_registro - ID del registro afectado
 * @param {string} usuario - Usuario que realizó la acción
 * @param {object} detalles - Información adicional del movimiento
 * @param {object} estado_anterior - Estado anterior (para UPDATE)
 * @param {object} estado_nuevo - Estado nuevo (para UPDATE)
 */
export const registrarMovimiento = async (
  tipo_movimiento,
  tabla,
  id_registro,
  usuario = 'Sistema',
  detalles = {},
  estado_anterior = null,
  estado_nuevo = null
) => {
  try {
    const now = new Date().toISOString();
    
    // Log para debugging
    console.log(`📝 Registrando auditoría: ${tipo_movimiento} en ${tabla} (${id_registro}) por ${usuario}`);
    
    await query(
      `INSERT INTO audit_log 
       (tipo_movimiento, tabla, id_registro, usuario, fecha_hora, detalles, estado_anterior, estado_nuevo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tipo_movimiento,
        tabla,
        String(id_registro),
        usuario,
        now,
        JSON.stringify(detalles),
        estado_anterior ? JSON.stringify(estado_anterior) : null,
        estado_nuevo ? JSON.stringify(estado_nuevo) : null,
      ]
    );
    
    console.log(`✅ Auditoría registrada exitosamente`);
  } catch (err) {
    console.error('❌ Error registrando movimiento en auditoría:', err.message);
    console.error('Stack:', err.stack);
  }
};

/**
 * Obtiene el historial completo de movimientos
 * @param {object} filtros - Filtros opcionales
 * @returns {array} Lista de movimientos ordenados por fecha descendente
 */
export const obtenerHistorialCompleto = async (filtros = {}) => {
  try {
    let sql = `
      SELECT 
        id,
        tipo_movimiento,
        tabla,
        id_registro,
        usuario,
        fecha_hora,
        detalles,
        estado_anterior,
        estado_nuevo
      FROM audit_log
      WHERE 1=1
    `;
    const params = [];

    // Filtros opcionales
    if (filtros.tabla) {
      sql += ' AND tabla = ?';
      params.push(filtros.tabla);
    }

    if (filtros.id_registro) {
      sql += ' AND id_registro = ?';
      params.push(String(filtros.id_registro));
    }

    if (filtros.usuario) {
      sql += ' AND usuario = ?';
      params.push(filtros.usuario);
    }

    if (filtros.tipo_movimiento) {
      sql += ' AND tipo_movimiento = ?';
      params.push(filtros.tipo_movimiento);
    }

    if (filtros.fecha_desde) {
      sql += ' AND fecha_hora >= ?';
      params.push(filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      sql += ' AND fecha_hora <= ?';
      params.push(filtros.fecha_hasta);
    }

    sql += ' ORDER BY fecha_hora DESC LIMIT 500';

    console.log(`🔍 Consultando historial con filtros:`, filtros);
    const rows = await query(sql, params);
    console.log(`📊 Encontrados ${rows?.length || 0} registros`);
    
    return (rows || []).map((row) => ({
      id: row.id,
      fecha: row.fecha_hora,
      action: row.tipo_movimiento,
      tabla: row.tabla,
      id_registro: row.id_registro,
      user: row.usuario,
      detalles: parseJsonB(row.detalles) || {},
      estado_anterior: parseJsonB(row.estado_anterior),
      estado_nuevo: parseJsonB(row.estado_nuevo),
    }));
  } catch (err) {
    console.error('❌ Error obteniendo historial:', err);
    return [];
  }
};

/**
 * Obtiene el historial de un equipo específico
 * @param {string} activo_fijo - ID del equipo
 * @returns {array} Historial del equipo
 */
export const obtenerHistorialEquipo = async (activo_fijo) => {
  try {
    const rows = await query(`
      SELECT 
        id,
        tipo_movimiento,
        tabla,
        usuario,
        fecha_hora,
        detalles,
        estado_anterior,
        estado_nuevo
      FROM audit_log
      WHERE (tabla = ? AND id_registro = ?) 
         OR (tabla = ? AND detalles::text LIKE ?)
      ORDER BY fecha_hora DESC
    `, [
      'activos',
      activo_fijo,
      'asignaciones',
      `%${activo_fijo}%`,
    ]);

    console.log(`🔍 Historial del equipo ${activo_fijo}: ${rows?.length || 0} registros`);

    return (rows || []).map((row) => ({
      id: row.id,
      fecha: row.fecha_hora,
      action: row.tipo_movimiento,
      tabla: row.tabla,
      user: row.usuario,
      detalles: parseJsonB(row.detalles) || {},
      estado_anterior: parseJsonB(row.estado_anterior),
      estado_nuevo: parseJsonB(row.estado_nuevo),
    }));
  } catch (err) {
    console.error('❌ Error obteniendo historial del equipo:', err);
    return [];
  }
};

/**
 * Obtiene el historial de un usuario (asignaciones)
 * @param {string} cedula - Cédula del usuario
 * @returns {array} Historial del usuario
 */
export const obtenerHistorialUsuario = async (cedula) => {
  try {
    const rows = await query(`
      SELECT 
        id,
        tipo_movimiento,
        tabla,
        usuario,
        fecha_hora,
        detalles,
        estado_anterior,
        estado_nuevo
      FROM audit_log
      WHERE tabla = ? AND (detalles::text LIKE ? OR detalles::text LIKE ?)
      ORDER BY fecha_hora DESC
    `, [
      'asignaciones',
      `%"cedula":"${cedula}"%`,
      `%"cedula": "${cedula}"%`,
    ]);

    console.log(`🔍 Historial del usuario ${cedula}: ${rows?.length || 0} registros`);

    return (rows || []).map((row) => ({
      id: row.id,
      fecha: row.fecha_hora,
      action: row.tipo_movimiento,
      tabla: row.tabla,
      user: row.usuario,
      detalles: parseJsonB(row.detalles) || {},
      estado_anterior: parseJsonB(row.estado_anterior),
      estado_nuevo: parseJsonB(row.estado_nuevo),
    }));
  } catch (err) {
    console.error('❌ Error obteniendo historial del usuario:', err);
    return [];
  }
};

export default {
  registrarMovimiento,
  obtenerHistorialCompleto,
  obtenerHistorialEquipo,
  obtenerHistorialUsuario,
};
