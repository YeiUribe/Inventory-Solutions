/**
 * Conexión a PostgreSQL - Inventory Solutions
 * Configura las credenciales en .env
 */
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: String(process.env.DB_HOST || 'localhost'),
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: String(process.env.DB_USER || 'postgres'),
  password: String(process.env.DB_PASSWORD ?? ''),
  database: String(process.env.DB_NAME || 'inventory_solutions'),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const normalizeSql = (sql) => {
  let paramIndex = 0;
  return sql
    .replace(/`([^`]+)`/g, '"$1"')
    .replace(/\bCURDATE\(\)/gi, 'CURRENT_DATE')
    .replace(/\?/g, () => `$${++paramIndex}`);
};

export const query = async (sql, params = []) => {
  const normalizedSql = normalizeSql(sql);
  const result = await pool.query(normalizedSql, params);
  return result.rows;
};

export const getConnection = () => pool.connect();

export default pool;
