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
    console.log('🔄 Ejecutando migración: fecha_devolucion...');
    
    // Leer el archivo de migración
    const migrationPath = path.join(__dirname, '../database/migration_add_fecha_devolucion.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    console.log('📂 Ruta del archivo:', migrationPath);
    console.log('📄 Contenido leído:', sql.length, 'caracteres\n');
    
    // Ejecutar cada comando SQL
    const commands = sql.split(';').filter(cmd => cmd.trim() && !cmd.trim().startsWith('--'));
    console.log('🔢 Total de comandos:', commands.length, '\n');
    
    let executed = 0;
    for (const cmd of commands) {
      if (cmd.trim()) {
        const cmdPreview = cmd.trim().slice(0, 50);
        console.log(`📝 [${executed + 1}] ${cmdPreview}...`);
        try {
          const result = await pool.query(cmd);
          console.log('   ✅ Ejecutado - Filas afectadas:', result.rowCount);
          executed++;
        } catch (err) {
          console.error('   ❌ Error:', err.message);
        }
      }
    }
    
    // Verificar que la columna fue agregada
    console.log('\n🔍 Verificando columna...');
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'asignaciones' AND column_name = 'fecha_devolucion'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ ¡Migración completada exitosamente!');
      console.log('✅ Columna encontrada:', result.rows[0]);
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
