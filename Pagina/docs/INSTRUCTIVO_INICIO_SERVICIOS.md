# Comandos Inicio de Servicios

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=Inventory_Solutions
PORT=3001
VITE_API_URL=http://localhost:3001
```

```powershell
npm install
```

```powershell
node --input-type=module -e "import 'dotenv/config'; import fs from 'node:fs/promises'; import pg from 'pg'; const { Pool } = pg; const sql = await fs.readFile('./database/schema.sql','utf8'); const pool = new Pool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME }); await pool.query(sql); await pool.end(); console.log('Schema PostgreSQL aplicado correctamente.');"
```

```powershell
npm run server
```

```powershell
npm run dev
```

```powershell
Invoke-RestMethod "http://localhost:3001/api/health"
```

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:3001/api/auth/login" -ContentType "application/json" -Body '{"username":"admin","password":"123"}'
```
