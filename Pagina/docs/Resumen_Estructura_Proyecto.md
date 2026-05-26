# Resumen de la estructura del proyecto

## Visión general
Proyecto con frontend en React (Vite) y backend Node/Express integrados dentro de la carpeta `Pagina/`.

---

## Estructura principal y archivos relevantes

- **Entrada servidor**: [Pagina/server/index.js](Pagina/server/index.js) — Inicializa Express y registra rutas.
- **Conexión BD / Config**: [Pagina/server/db.js](Pagina/server/db.js), [Pagina/server/config.js](Pagina/server/config.js).
- **Rutas API**: [Pagina/server/routes/](Pagina/server/routes/) — archivos clave:
  - [Pagina/server/routes/inventory.js](Pagina/server/routes/inventory.js)
  - [Pagina/server/routes/auth.js](Pagina/server/routes/auth.js)
  - [Pagina/server/routes/asignaciones.js](Pagina/server/routes/asignaciones.js)
  - [Pagina/server/routes/usuarios.js](Pagina/server/routes/usuarios.js)
  - [Pagina/server/routes/history.js](Pagina/server/routes/history.js)
  - [Pagina/server/routes/colaboradores.js](Pagina/server/routes/colaboradores.js)
- **Controladores y servicios (lógica del servidor)**:
  - [Pagina/server/controllers/usuariosController.js](Pagina/server/controllers/usuariosController.js)
  - [Pagina/server/services/audit.js](Pagina/server/services/audit.js)
- **Middlewares**: validaciones y permisos en [Pagina/server/middlewares/](Pagina/server/middlewares/) (ej.: `validarAuth.js`, `requireAdmin.js`, `validarInventario.js`, `validarUsuario.js`, `validarAsignacion.js`).

---

## Frontend (React)
- **Entry y App**: [Pagina/src/main.jsx](Pagina/src/main.jsx), [Pagina/src/App.jsx](Pagina/src/App.jsx).
- **Páginas / Vistas**: [Pagina/src/pages/]
  - `Login.jsx`, `Landing.jsx`, `InventoryDashboard.jsx`, `AddItemPage.jsx`, `HistoryView.jsx`, `ReportsView.jsx`, `Usuarios.jsx`.
- **Componentes reutilizables**: [Pagina/src/components/common/]
  - `DataTable.jsx`, `Modal.jsx`, `Input.jsx`, `Button.jsx`, `Card.jsx`, `DonutChart.jsx`, `Lista.jsx`.
- **Componentes del dashboard**: [Pagina/src/components/dashboard/]
  - `InventoryList.jsx`, `InventoryStats.jsx`, `ItemDetails.jsx`, `AddItemModal.jsx`, `EditItemModal.jsx`, `AssignmentModal.jsx`, `HistorialAuditoria.jsx`.
- **Layout / Navegación**: [Pagina/src/components/layout/]
  - `DashboardLayout.jsx`, `Navbar.jsx`, `Sidebar.jsx`, `Footer.jsx`, `PublicLayout.jsx`.
- **Estado y hooks**: [Pagina/src/hooks/useAuth.js](Pagina/src/hooks/useAuth.js), [Pagina/src/hooks/useInventory.js](Pagina/src/hooks/useInventory.js).
- **Comunicación con backend**: [Pagina/src/services/api.js](Pagina/src/services/api.js) — funciones para llamadas HTTP; [Pagina/src/services/localStore.js](Pagina/src/services/localStore.js) — almacenamiento local.

---

## Scripts, migraciones y utilidades
- Carpeta de scripts: [Pagina/scripts/]
  - Migraciones y utilidades: `migrate.mjs`, `run-migration.mjs`, `exec-migration.mjs`, `apply_sql.js`, `create-audit-table.js`.
  - Pruebas/API: `api_test.mjs`.
- **Auditoría**: scripts y servicio de auditoría (`create-audit-table.js`, `server/services/audit.js`).

---

## Postman, documentación y QA
- **Colecciones Postman**: [Pagina/postman_collection_inventory.json](Pagina/postman_collection_inventory.json), [Pagina/postman_collection_inventory_autotest.json](Pagina/postman_collection_inventory_autotest.json).
- **Entorno Postman**: [Pagina/postman_environment_inventory.json](Pagina/postman_environment_inventory.json).
- **Docs / Guías**: [Pagina/docs/]
  - `CRUD_Postman_Instructions.md`, `INSTRUCTIVO_INICIO_SERVICIOS.md`, `SISTEMA_AUDITORIA.md`, `SISTEMA_AUDITORIA_RESUMEN.md`, `tutorial/GUIA_FUNCIONAMIENTO_PASO_A_PASO.md`.

---

## Configuración y build
- **Vite (frontend)**: [Pagina/vite.config.js](Pagina/vite.config.js). 
- **Dependencias y scripts**: revisar `Pagina/package.json` para comandos `dev`, `build`, `start`.

---

## Puntos críticos a revisar (prioritarios)
- Seguridad de endpoints (middlewares de `validarAuth.js` y `requireAdmin.js`).
- Esquema y migraciones de la base de datos (`Pagina/server/db.js` y scripts en `Pagina/scripts/`).
- Consistencia entre rutas del backend y llamadas desde `Pagina/src/services/api.js`.
- Tests automatizados o Postman autómatizado (`postman_collection_inventory_autotest.json` y `Pagina/scripts/api_test.mjs`).

---

## Próximos pasos sugeridos
- Generar diagrama de rutas API y mapa de entidades DB.
- Resumir en detalle `inventory.js` (endpoints CRUD) y `useInventory.js` (estado frontend) — puedo hacerlo ahora si lo deseas.

---

Documento generado automáticamente: resumen de la estructura del proyecto. Si deseas que lo traduzca a otro formato (MD + diagrama, JSON, o un README), indícalo.
