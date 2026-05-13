import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { query } from '../db.js';

const runFile = async (filePath) => {
  const abs = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', '..', filePath);
  const sql = fs.readFileSync(abs, { encoding: 'utf8' });
  // Split statements by semicolon to run individually
  const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    try {
      console.log('Executing statement:', stmt.slice(0, 120).replace(/\n/g, ' '));
      await query(stmt);
    } catch (err) {
      console.error('Failed statement:', err.message || err);
      throw err;
    }
  }
};

const main = async () => {
  const arg = process.argv[2] || 'c:/Users/USER/Downloads/Pagina/database/migrate_add_email_col.sql';
  try {
    await runFile(arg);
    console.log('Migration applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(2);
  }
};

main();
