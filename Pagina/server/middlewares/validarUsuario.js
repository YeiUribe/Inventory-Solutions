import { validarEmail } from './validarAuth.js';

const validarUsuario = (req, res, next) => {
  const body = req.body || {};
  const cedula = String(body.cedula || body.id || '').trim();
  const usuarioLogin = String(body.usuario_login || body.username || '').trim();
  const passwordHash = String(body.password_hash || body.password || '').trim();
  const idRol = body.id_rol || body.role_id;
  const email = String(body.email || body.correo || '').trim();

  // Validar que no estén vacíos
  if (!cedula) return res.status(400).json({ error: 'La cédula es obligatoria y no puede estar vacía.' });
  if (!usuarioLogin) return res.status(400).json({ error: 'El usuario es obligatorio y no puede estar vacío.' });
  if (!passwordHash) return res.status(400).json({ error: 'La contraseña es obligatoria y no puede estar vacía.' });
  if (idRol === undefined || idRol === null || String(idRol).trim() === '') {
    return res.status(400).json({ error: 'El rol es obligatorio.' });
  }

  // Validar email si se proporciona en un campo específico
  if (email && !validarEmail(email)) {
    return res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
  }

  // Si usuarioLogin parece un email, validarlo también
  if (usuarioLogin.includes('@') && !validarEmail(usuarioLogin)) {
    return res.status(400).json({ error: 'El usuario parece un correo electrónico pero no tiene un formato válido.' });
  }

  return next();
};

export default validarUsuario;
