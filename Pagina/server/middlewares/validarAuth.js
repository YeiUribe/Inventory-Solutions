export const validarEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validarAuth = (req, res, next) => {
  const { username, password, email } = req.body;

  if (!username || String(username).trim() === '') {
    return res.status(400).json({ error: 'El usuario es requerido y no puede estar vacío.' });
  }

  if (!password || String(password).trim() === '') {
    return res.status(400).json({ error: 'La contraseña es requerida y no puede estar vacía.' });
  }

  // Si se envía un email explícitamente o si el username parece un email (contiene @), validarlo
  const emailToValidate = email || (String(username).includes('@') ? username : null);
  if (emailToValidate && !validarEmail(emailToValidate)) {
    return res.status(400).json({ error: 'El formato del email no es válido.' });
  }

  next();
};
