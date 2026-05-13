import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'Inventory_Solutions',
});

async function runMigration() {
  try {
    console.log('🔄 Ejecutando migración: fecha_devolucion...\n');
    
    // Comando 1: Agregar columna
    console.log('📝 [1] Agregando columna fecha_devolucion...');
    try {
      await pool.query(`ALTER TABLE asignaciones ADD COLUMN IF NOT EXISTS fecha_devolucion DATE`);
      console.log('   ✅ Columna agregada\n');
    } catch (err) {
      console.error('   ❌ Error:', err.message, '\n');
    }

    // Comando 2: Crear índice
    console.log('📝 [2] Creando índice idx_asignaciones_activa...');
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_asignaciones_activa ON asignaciones(activo_fijo, fecha_devolucion)`);
      console.log('   ✅ Índice creado\n');
    } catch (err) {
      console.error('   ❌ Error:', err.message, '\n');
    }

    // Comando 3: Evitar múltiples equipos activos para la misma persona
    console.log('📝 [3] Creando índice único por cédula activa...');
    try {
      await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_asignaciones_unica_activa_por_persona ON asignaciones(cedula) WHERE fecha_devolucion IS NULL`);
      console.log('   ✅ Restricción única creada\n');
    } catch (err) {
      console.error('   ❌ Error:', err.message, '\n');
    }
    
    // Verificar que la columna fue agregada
    console.log('🔍 Verificando columna...\n');
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'asignaciones' AND column_name = 'fecha_devolucion'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ ¡Migración completada exitosamente!');
      console.log('✅ Columna encontrada:', result.rows[0]);
      console.log('\n✨ Ya puedes usar la función de desasignación');
    } else {
      // Mostrar todas las columnas para debug
      const allCols = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'asignaciones' 
        ORDER BY ordinal_position
      `);
      console.log('❌ Columna fecha_devolucion NO encontrada');
      console.log('📋 Columnas existentes en asignaciones:');
      allCols.rows.forEach(row => {
        console.log(`   - ${row.column_name} (${row.data_type})`);
      });
      process.exit(1);
    }
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error ejecutando migración:', err.message);
    console.error(err);
    process.exit(1);
  }
}

runMigration();
