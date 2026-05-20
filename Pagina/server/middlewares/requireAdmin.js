export const requireAdmin = (req, res, next) => {
  const roleHeader = req.headers['x-user-role'] || req.headers['x-user'] || '';
  const role = String(roleHeader || '').trim();

  if (role && role.toLowerCase() === 'administrador') {
    return next();
  }

  return res.status(403).json({ error: 'Acceso restringido: se requiere rol Administrador' });
};

export default requireAdmin;
