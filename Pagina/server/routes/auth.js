import { Router } from 'express';
import { query } from '../db.js';
import { TABLES } from '../config.js';
import { validarAuth } from '../middlewares/validarAuth.js';

const router = Router();
const usuariosApp = TABLES.usuariosApp;
const empleados = TABLES.empleados;
const roles = TABLES.roles;

// POST /api/auth/login - RF-07
// Login por usuario_login o cedula (con password_hash)
router.post('/login', validarAuth, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    const rows = await query(
      `SELECT ua.id_usuario, ua.cedula, ua.usuario_login, ua.password_hash, ua.estado,
              e.nombre_usuario, e.usuario AS usuario_empleado,
              r.id_rol, r.nombre_rol
       FROM \`${usuariosApp}\` ua
       LEFT JOIN \`${empleados}\` e ON ua.cedula = e.cedula
       LEFT JOIN \`${roles}\` r ON ua.id_rol = r.id_rol
       WHERE (ua.cedula::text = ? OR ua.usuario_login = ?) AND ua.password_hash = ? AND ua.estado IS TRUE`,
      [username, username, password]
    );

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const u = rows[0];
    res.json({
      id: u.id_usuario,
      cedula: u.cedula,
      username: u.usuario_login,
      role: u.nombre_rol || 'Operador',
      name: u.nombre_usuario || u.usuario_empleado || u.usuario_login,
      estado: u.estado,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message || 'Error al iniciar sesión' });
  }
});

export default router;
