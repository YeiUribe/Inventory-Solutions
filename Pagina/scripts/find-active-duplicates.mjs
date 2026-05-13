import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123456',
  database: 'Inventory_Solutions',
});

async function main() {
  const dupes = await pool.query(`
    SELECT cedula, COUNT(*) AS active_count, STRING_AGG(activo_fijo, ', ' ORDER BY activo_fijo) AS activos
    FROM asignaciones
    WHERE fecha_devolucion IS NULL
    GROUP BY cedula
    HAVING COUNT(*) > 1
    ORDER BY active_count DESC, cedula
  `);

  console.log('Duplicados activos:', dupes.rows);

  const actives = await pool.query(`
    SELECT cedula, activo_fijo, fecha_entrega
    FROM asignaciones
    WHERE fecha_devolucion IS NULL
    ORDER BY cedula, fecha_entrega DESC
  `);

  console.log('Activos vigentes:', actives.rows);
  await pool.end();
}

main().catch(async (err) => {
  console.error(err);
  await pool.end();
  process.exit(1);
});
