export const validarAsignacion = (req, res, next) => {
  const { activo_fijo, cedula, fecha_entrega } = req.body;

  if (!activo_fijo || String(activo_fijo).trim() === '') {
    return res.status(400).json({ error: 'El activo_fijo es requerido y no puede estar vacío.' });
  }

  if (!cedula || String(cedula).trim() === '') {
    return res.status(400).json({ error: 'La cédula es requerida y no puede estar vacía.' });
  }

  if (fecha_entrega && String(fecha_entrega).trim() === '') {
    return res.status(400).json({ error: 'La fecha de entrega no puede estar vacía.' });
  }

  next();
};
