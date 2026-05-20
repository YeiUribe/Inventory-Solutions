export const validarInventario = (req, res, next) => {
  const { activo_fijo, id, device, nombre_equipo, category, tipo_equipo, status, estado } = req.body;
  const isPost = req.method === 'POST';

  const finalActivoFijo = activo_fijo || id;
  const finalNombreEquipo = device || nombre_equipo;
  const finalTipoEquipo = category || tipo_equipo;
  const finalEstado = status || estado;

  // Nota: el servidor puede autogenerar `activo_fijo` si no se envía.
  // No forzamos su presencia aquí para permitir clients que no lo proporcionen.

  if (finalNombreEquipo !== undefined && String(finalNombreEquipo).trim() === '') {
    return res.status(400).json({ error: 'El nombre del equipo no puede estar vacío.' });
  }

  if (finalTipoEquipo !== undefined && String(finalTipoEquipo).trim() === '') {
    return res.status(400).json({ error: 'El tipo de equipo no puede estar vacío.' });
  }

  if (finalEstado !== undefined && String(finalEstado).trim() === '') {
    return res.status(400).json({ error: 'El estado no puede estar vacío.' });
  }

  next();
};
