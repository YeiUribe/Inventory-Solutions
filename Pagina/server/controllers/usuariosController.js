import { query } from '../db.js';
import { TABLES } from '../config.js';

const usuariosApp = TABLES.usuariosApp;
const empleados = TABLES.empleados;
const roles = TABLES.roles;

const mapUsuario = (row) => ({
  id: row.id_usuario,
  cedula: row.cedula,
  nombre: row.nombre_usuario,
  usuario_login: row.usuario_login,
  password_hash: row.password_hash,
  id_rol: row.id_rol,
  rol: row.nombre_rol,
  estado: row.estado,
  cargo: row.cargo,
  usuario_empleado: row.usuario_empleado,
});

const upsertEmpleado = async (payload) => {
  const cedula = String(payload.cedula || '').trim();
  const usuario = String(payload.usuario_login || payload.username || '').trim();
  const nombre = String(payload.nombre || payload.nombre_usuario || usuario || cedula).trim();
  const cargo = payload.cargo ? String(payload.cargo).trim() : null;
  const idCeco = payload.id_ceco ? String(payload.id_ceco).trim() : null;

  if (!cedula) {
    return;
  }

  await query(
    `INSERT INTO \`${empleados}\` (cedula, usuario, nombre_usuario, cargo, id_ceco)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (cedula) DO UPDATE
     SET usuario = EXCLUDED.usuario,
         nombre_usuario = EXCLUDED.nombre_usuario,
         cargo = COALESCE(EXCLUDED.cargo, \`${empleados}\`.cargo),
         id_ceco = COALESCE(EXCLUDED.id_ceco, \`${empleados}\`.id_ceco)`,
    [cedula, usuario, nombre, cargo, idCeco]
  );
};

const buildUserPayload = (body) => ({
  cedula: String(body.cedula || body.id || '').trim(),
  usuario_login: String(body.usuario_login || body.username || '').trim(),
  password_hash: String(body.password_hash || body.password || '').trim(),
  id_rol: Number(body.id_rol || body.role_id || 0),
  estado: body.estado === false || body.estado === 'false' || body.estado === 0 || body.estado === '0' ? false : true,
  nombre: body.nombre || body.nombre_usuario || '',
  cargo: body.cargo || '',
  id_ceco: body.id_ceco || null,
});

export const obtenerUsuarios = async (req, res) => {
  try {
    const rows = await query(
      `SELECT ua.id_usuario, ua.cedula, ua.usuario_login, ua.password_hash, ua.id_rol, ua.estado,
              e.nombre_usuario, e.usuario AS usuario_empleado, e.cargo,
              r.nombre_rol
       FROM \`${usuariosApp}\` ua
       LEFT JOIN \`${empleados}\` e ON ua.cedula = e.cedula
       LEFT JOIN \`${roles}\` r ON ua.id_rol = r.id_rol
       ORDER BY ua.id_usuario`
    );

    res.status(200).json((rows || []).map(mapUsuario));
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: error.message || 'Error al obtener usuarios' });
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const payload = buildUserPayload(req.body || {});

    if (!payload.cedula || !payload.usuario_login || !payload.password_hash || !payload.id_rol) {
      console.log('Datos faltantes:', payload);
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    // Normalizar datos para evitar inconsistencias
    const cedulaNormalizada = payload.cedula.trim().toLowerCase();
    const usuarioLoginNormalizado = payload.usuario_login.trim().toLowerCase();

    console.log('Verificando duplicados para cedula:', cedulaNormalizada, 'y usuario_login:', usuarioLoginNormalizado);
    const usuarioExistente = await query(
      `SELECT id_usuario FROM \`${usuariosApp}\` WHERE LOWER(TRIM(cedula)) = ? OR LOWER(TRIM(usuario_login)) = ?`,
      [cedulaNormalizada, usuarioLoginNormalizado]
    );

    console.log('Resultado de la verificación de duplicados:', usuarioExistente);
    if (usuarioExistente.length > 0) {
      return res.status(409).json({ error: 'El usuario ya existe con esta cédula o nombre de usuario.' });
    }

    await upsertEmpleado(payload);

    const rows = await query(
      `INSERT INTO \`${usuariosApp}\` (cedula, usuario_login, password_hash, id_rol, estado)
       VALUES (?, ?, ?, ?, ?)
       RETURNING id_usuario`,
      [cedulaNormalizada, usuarioLoginNormalizado, payload.password_hash, payload.id_rol, payload.estado]
    );

    console.log('Usuario creado con éxito:', rows);
    const inserted = await query(
      `SELECT ua.id_usuario, ua.cedula, ua.usuario_login, ua.password_hash, ua.id_rol, ua.estado,
              e.nombre_usuario, e.usuario AS usuario_empleado, e.cargo,
              r.nombre_rol
       FROM \`${usuariosApp}\` ua
       LEFT JOIN \`${empleados}\` e ON ua.cedula = e.cedula
       LEFT JOIN \`${roles}\` r ON ua.id_rol = r.id_rol
       WHERE ua.id_usuario = ?`,
      [rows?.[0]?.id_usuario]
    );

    return res.status(201).json(mapUsuario(inserted?.[0] || rows?.[0] || payload));
  } catch (error) {
    console.error('Error al crear usuario:', error);
    return res.status(500).json({ error: error.message || 'Error al crear usuario' });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = buildUserPayload(req.body || {});

    const existingRows = await query(
      `SELECT id_usuario, cedula, usuario_login, password_hash, id_rol, estado
       FROM \`${usuariosApp}\`
       WHERE id_usuario = ?`,
      [id]
    );

    if (!existingRows || existingRows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const current = existingRows[0];
    const cedula = payload.cedula || current.cedula;
    const usuarioLogin = payload.usuario_login || current.usuario_login;
    const passwordHash = payload.password_hash || current.password_hash;
    const idRol = payload.id_rol || current.id_rol;
    const estado = payload.estado;

    await upsertEmpleado({
      cedula,
      usuario_login: usuarioLogin,
      nombre_usuario: payload.nombre || usuarioLogin,
      cargo: payload.cargo,
      id_ceco: payload.id_ceco,
    });

    await query(
      `UPDATE \`${usuariosApp}\`
       SET cedula = ?, usuario_login = ?, password_hash = ?, id_rol = ?, estado = ?
       WHERE id_usuario = ?`,
      [cedula, usuarioLogin, passwordHash, idRol, estado, id]
    );

    const updated = await query(
      `SELECT ua.id_usuario, ua.cedula, ua.usuario_login, ua.password_hash, ua.id_rol, ua.estado,
              e.nombre_usuario, e.usuario AS usuario_empleado, e.cargo,
              r.nombre_rol
       FROM \`${usuariosApp}\` ua
       LEFT JOIN \`${empleados}\` e ON ua.cedula = e.cedula
       LEFT JOIN \`${roles}\` r ON ua.id_rol = r.id_rol
       WHERE ua.id_usuario = ?`,
      [id]
    );

    return res.json({ mensaje: 'Usuario actualizado', usuario: mapUsuario(updated?.[0]) });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return res.status(500).json({ error: error.message || 'Error al actualizar usuario' });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM \`${usuariosApp}\` WHERE id_usuario = ?`, [id]);
    res.json({ mensaje: `Usuario con id ${id} eliminado correctamente` });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: error.message || 'Error al eliminar usuario' });
  }
};
