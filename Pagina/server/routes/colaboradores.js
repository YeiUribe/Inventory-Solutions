import { Router } from 'express';
import { query } from '../db.js';
import { TABLES } from '../config.js';

const router = Router();
const table = TABLES.empleados;

// GET /api/colaboradores - Lista para selects (responsable, etc.)
router.get('/', async (req, res) => {
  try {
    const rows = await query(
      `SELECT cedula, nombre_usuario, cargo FROM \`${table}\` ORDER BY nombre_usuario`
    );
    res.json(rows || []);
  } catch (err) {
    console.error('Get colaboradores error:', err);
    res.status(500).json({ error: err.message || 'Error al obtener colaboradores' });
  }
});

export default router;
