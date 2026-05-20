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

// Handle invalid JSON payloads gracefully
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.error('Invalid JSON payload on', req.method, req.path, err.message);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  // Default handler
  next(err);
});

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

    // Crear tabla de auditoría si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_log (
        id SERIAL PRIMARY KEY,
        tipo_movimiento VARCHAR(50) NOT NULL,
        tabla VARCHAR(100) NOT NULL,
        id_registro VARCHAR(100) NOT NULL,
        usuario VARCHAR(255) DEFAULT 'Sistema',
        fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        detalles JSONB,
        estado_anterior JSONB,
        estado_nuevo JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear índices para auditoría
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_tabla ON audit_log(tabla)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_id_registro ON audit_log(id_registro)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_fecha_hora ON audit_log(fecha_hora DESC)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_tipo ON audit_log(tipo_movimiento)
    `);

  } catch (err) {
    console.error('No se pudo validar schema de asignaciones o auditoría:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`Servidor API en http://localhost:${PORT}`);
    // Mensaje solicitado en la verificación final
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
};

startServer();
