import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import pool from './db.js';
import authRoutes from './routes/auth.js';
import inventoryRoutes from './routes/inventory.js';
import historyRoutes from './routes/history.js';
import colaboradoresRoutes from './routes/colaboradores.js';
import asignacionesRoutes from './routes/asignaciones.js';
import usuariosRoutes from './routes/usuarios.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/colaboradores', colaboradoresRoutes);
app.use('/api/asignaciones', asignacionesRoutes);
app.use('/api/usuarios', usuariosRoutes);

app.get('/api/health', (_, res) => {
  res.json({ ok: true, message: 'Inventory API' });
});

const startServer = async () => {
  try {
    // Compatibilidad: algunas instalaciones antiguas no tienen esta columna.
    await pool.query('ALTER TABLE asignaciones ADD COLUMN IF NOT EXISTS fecha_devolucion DATE');
  } catch (err) {
    console.error('No se pudo validar schema de asignaciones:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Servidor API en http://localhost:${PORT}`);
    // Mensaje solicitado en la verificación final
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
};

startServer();
