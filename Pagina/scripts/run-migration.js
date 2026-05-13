import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

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
    console.log('🔄 Ejecutando migración: fecha_devolucion...');
    
    // Leer el archivo de migración
    const migrationPath = path.join(path.dirname(process.argv[1]), '../database/migration_add_fecha_devolucion.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // Ejecutar cada comando SQL
    const commands = sql.split(';').filter(cmd => cmd.trim() && !cmd.trim().startsWith('--'));
    
    for (const cmd of commands) {
      if (cmd.trim()) {
        console.log(`\n📝 Ejecutando: ${cmd.slice(0, 50).trim()}...`);
        await pool.query(cmd);
        console.log('✅ OK');
      }
    }
    
    // Verificar que la columna fue agregada
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'asignaciones' AND column_name = 'fecha_devolucion'
    `);
    
    if (result.rows.length > 0) {
      console.log('\n✅ ¡Migración completada exitosamente!');
      console.log('✅ Columna fecha_devolucion agregada a asignaciones');
    } else {
      console.error('❌ La columna fecha_devolucion no se agregó correctamente');
      process.exit(1);
    }
    
    await pool.end();
  } catch (err) {
    console.error('❌ Error ejecutando migración:', err.message);
    process.exit(1);
  }
}

runMigration();
