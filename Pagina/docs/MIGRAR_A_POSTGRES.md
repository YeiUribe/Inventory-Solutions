**Instructivo: Migrar usuarios a PostgreSQL (paso a paso)**

**Resumen:**
- Objetivo: que el endpoint `/api/usuarios` del backend use PostgreSQL (tabla `colaboradores`) en lugar de almacenamiento en memoria.
- Archivos clave: `backend/controllers/usuariosController.js`, `backend/db.js`, `database/schema.sql`, `database/migrate_add_email_col.sql`.

**Prerrequisitos**
- Tener PostgreSQL instalado y en ejecución.
- `psql` accesible en línea de comandos.
- Node.js y npm instalados.
- Proyecto clonado en `C:\Users\USER\Downloads\Pagina` (rutas usadas en este instructivo).
- Variables de conexión en `.env` (en la carpeta `Pagina` o `backend`) con al menos: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, y `PORT`.

-----------------------------------------------------------------
Paso 0 — Verificar PostgreSQL y credenciales

1. Verifica que PostgreSQL esté corriendo (Windows Service o `pg_ctl`).
2. Abre PowerShell y prueba conexión rápida con `psql`:

```powershell
# Reemplaza valores por los tuyos o exporta .env variables antes
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d <DB_NAME> -c "SELECT version();"
```

Si devuelve la versión, la conexión funciona.

-----------------------------------------------------------------
Paso 1 — Crear la base de datos (si no existe)

1. Si no existe la base de datos `inventory_solutions`, créala con `psql` (puedes hacerlo con el usuario `postgres`):

```powershell
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -c "CREATE DATABASE inventory_solutions;"
```

2. Alternativa: con sesión psql interactiva:

```powershell
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER>
# dentro de psql:
CREATE DATABASE inventory_solutions;
\c inventory_solutions
```

-----------------------------------------------------------------
Paso 2 — Ejecutar el esquema base (si aún no lo hiciste)

1. Ejecuta el archivo de esquema principal `database/schema.sql` (ya incluido en el repo). Este crea `colaboradores`, `equipos` y `asignaciones` y añade filas de ejemplo.

```powershell
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d inventory_solutions -f "c:/Users/USER/Downloads/Pagina/Pagina/database/schema.sql"
```

2. Verifica tablas:

```powershell
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d inventory_solutions -c "\dt"
```

-----------------------------------------------------------------
Paso 3 — Ejecutar migración para columna `email` (si aplica)

1. Ejecuta el script que añadimos: `database/migrate_add_email_col.sql` (añade columna `email` si falta y llena valores de ejemplo):

```powershell
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d inventory_solutions -f "c:/Users/USER/Downloads/Pagina/database/migrate_add_email_col.sql"
```

2. Verifica la columna:

```powershell
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d inventory_solutions -c "SELECT cedula, nombre_usuario, email, rol FROM colaboradores LIMIT 10;"
```

-----------------------------------------------------------------
Paso 4 — Configurar `.env` y variables para el backend

1. Abre (o crea) el archivo `.env` en `Pagina` o `backend` y define:

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=inventory_solutions
PORT=3001
```

2. Reinicia cualquier terminal que dependa de las variables, o exporta en PowerShell antes de arrancar el servidor:

```powershell
$env:DB_HOST = 'localhost'; $env:DB_PORT = '5432'; $env:DB_USER = 'postgres'; $env:DB_PASSWORD = 'tu_password'; $env:DB_NAME = 'inventory_solutions';
```

-----------------------------------------------------------------
Paso 5 — Instalar dependencias y arrancar servidor backend

1. Desde la raíz del proyecto donde está el `package.json` del backend (según tu estructura podría ser `Pagina` o `Pagina/backend`), instala dependencias si es necesario:

```powershell
cd "C:/Users/USER/Downloads/Pagina"
npm install
# o si el backend tiene su propio package.json en backend/
cd backend
npm install
```

2. Arranca el servidor (ejemplo):

```powershell
npm run server
# o si usas nodemon
npm run dev
```

3. Verifica que el backend levante sin errores y muestre el log de inicio (ej. `Servidor corriendo en puerto 3001`).

-----------------------------------------------------------------
Paso 6 — Probar endpoints de `usuarios`

Ejemplos con PowerShell `Invoke-RestMethod`:

```powershell
# Obtener usuarios
Invoke-RestMethod -Uri 'http://localhost:3001/api/usuarios' -Method Get

# Crear usuario (sin cedula: se genera timestamp como id). Devuelve el nuevo usuario
Invoke-RestMethod -Uri 'http://localhost:3001/api/usuarios' -Method Post -ContentType 'application/json' -Body '{"nombre":"Prueba","email":"prueba@example.com","rol":"Operador"}'

# Actualizar usuario (cedula como id)
Invoke-RestMethod -Uri 'http://localhost:3001/api/usuarios/1001' -Method Put -ContentType 'application/json' -Body '{"nombre":"Admin Mod","email":"admin@ejemplo.com"}'

# Eliminar usuario
Invoke-RestMethod -Uri 'http://localhost:3001/api/usuarios/1001' -Method Delete
```

Verifica también directamente en la base de datos:

```powershell
psql -h <DB_HOST> -p <DB_PORT> -U <DB_USER> -d inventory_solutions -c "SELECT cedula, nombre_usuario, email, rol FROM colaboradores ORDER BY nombre_usuario LIMIT 50;"
```

-----------------------------------------------------------------
Paso 7 — Ajustes en frontend

1. Asegúrate de que `VITE_API_URL` apunte al backend (por ejemplo `http://localhost:3001`) en el `.env` del frontend (o `import.meta.env`):

```
VITE_API_URL=http://localhost:3001
```

2. Reinicia Vite si estaba corriendo (necesita recargar variables):

```powershell
cd "C:/Users/USER/Downloads/Pagina/frontend"
npm install
npm run dev
```

3. Prueba la UI `Usuarios` y confirma que las llamadas GET/POST/PUT/DELETE funcionan y los datos se guardan en PostgreSQL.

-----------------------------------------------------------------
Paso 8 — Buenas prácticas y siguientes mejoras (recomendado)

- Hash de contraseñas: actualmente `colaboradores.password` contiene contraseñas en claro; usa `bcrypt` y modifica endpoints de auth para comparar hash.
- Validación: añade validaciones de entrada en `validarUsuario` o en el controlador.
- Control de errores: devolver mensajes consistentes y códigos HTTP.
- IDs: si prefieres IDs numéricos o UUID, crea una columna `id SERIAL` o `id UUID DEFAULT gen_random_uuid()` y adapta el controlador/rutas.
- Tests: agrega pruebas automáticas para los endpoints `usuarios`.

-----------------------------------------------------------------
Rollback / solución de problemas rápidos

- Si la migración falla, revirtiendo (si ejecutaste `schema.sql`/`migrate_add_email_col.sql`):
  - Eliminar la columna `email`: `ALTER TABLE colaboradores DROP COLUMN IF EXISTS email;`
  - Borrar filas de ejemplo: `DELETE FROM colaboradores WHERE cedula IN ('1001','1002','1003');`

- Si el backend lanza errores de conexión: revisa `.env`, reinicia el servidor y revisa que no haya bloqueos en PostgreSQL.

-----------------------------------------------------------------
Archivos útiles en el repo

- `backend/controllers/usuariosController.js` (modificado para usar `query()`)
- `backend/db.js` (Pool y helper `query()`)
- `Pagina/Pagina/database/schema.sql` (esquema base)
- `database/migrate_add_email_col.sql` (script añadido para `email`)
- `docs/MIGRAR_A_POSTGRES.md` (este instructivo)

-----------------------------------------------------------------
Si quieres, aplico la migración contra tu base de datos local (ejecutar el SQL) y luego arranco el servidor y pruebo endpoints desde aquí; confirma si doy permiso para ejecutar esos pasos en tu entorno.
