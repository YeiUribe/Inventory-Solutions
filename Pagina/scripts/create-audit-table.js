/**
 * Script de migración: Crear tabla de auditoría (audit_log)
 * Captura todos los movimientos del sistema
 * 
 * Ejecutar con: node scripts/create-audit-table.js
 */
import 'dotenv/config';
import pool from '../server/db.js';

const createAuditTable = async () => {
  try {
    console.log('🔄 Creando tabla audit_log si no existe...');

    const createTableSQL = `
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
      );
    `;

    await pool.query(createTableSQL);
    console.log('✅ Tabla audit_log creada correctamente');

    // Crear índices para optimizar búsquedas
    const createIndicesSQL = `
      CREATE INDEX IF NOT EXISTS idx_audit_tabla ON audit_log(tabla);
      CREATE INDEX IF NOT EXISTS idx_audit_id_registro ON audit_log(id_registro);
      CREATE INDEX IF NOT EXISTS idx_audit_usuario ON audit_log(usuario);
      CREATE INDEX IF NOT EXISTS idx_audit_fecha_hora ON audit_log(fecha_hora DESC);
      CREATE INDEX IF NOT EXISTS idx_audit_tipo ON audit_log(tipo_movimiento);
    `;

    const indexStatements = createIndicesSQL.split(';').filter(s => s.trim());
    for (const indexSQL of indexStatements) {
      if (indexSQL.trim()) {
        await pool.query(indexSQL);
      }
    }
    console.log('✅ Índices creados correctamente');

    console.log('✨ Migración completada exitosamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error en la migración:', err.message);
    process.exit(1);
  }
};

createAuditTable();
