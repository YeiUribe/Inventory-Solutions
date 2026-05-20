# Sistema de Auditoría y Historial Completo

## 📋 Descripción General

Se ha implementado un sistema de auditoría centralizado que captura **todos los movimientos** del sistema (creación, edición, eliminación de equipos y cambios en asignaciones), no solo las asignaciones como estaba antes.

## 🎯 Movimientos Capturados

| Tipo | Descripción | Tabla |
|------|-------------|-------|
| **CREATE** | Creación de un nuevo equipo | `activos` |
| **UPDATE** | Edición de información del equipo | `activos` |
| **DELETE** | Eliminación de un equipo | `activos` |
| **ASSIGN** | Asignación de equipo a un usuario | `asignaciones` |
| **RETURN** | Devolución/desvinculación de equipo | `asignaciones` |

## 📁 Archivos Modificados/Creados

### Creados:
- `server/services/audit.js` - Servicio central de auditoría
- `scripts/create-audit-table.js` - Script de migración para crear la tabla

### Modificados:
- `server/routes/inventory.js` - Registra CREATE, UPDATE, DELETE de equipos
- `server/routes/asignaciones.js` - Registra ASSIGN y RETURN
- `server/routes/history.js` - Endpoint mejorado con múltiples vistas
- `server/index.js` - Inicialización automática de la tabla de auditoría

## 🔍 Endpoints de Historial

### 1. Historial General
```
GET /api/history
```
**Parámetros opcionales:**
- `?tipo=CREATE` - Filtrar por tipo de movimiento
- `?tabla=activos` - Filtrar por tabla afectada
- `?id_registro=EQ001` - Filtrar por ID del registro
- `?usuario=Juan` - Filtrar por usuario

**Respuesta:**
```json
[
  {
    "id": 1,
    "date": "2026-05-13T10:30:00Z",
    "action": "CREATE",
    "tabla": "activos",
    "id_registro": "EQ001",
    "user": "Admin",
    "details": {
      "nombre_equipo": "Laptop HP",
      "tipo_equipo": "Portátil",
      "marca": "HP",
      "serial": "ABC123"
    },
    "resumen": "Admin creó el equipo Laptop HP"
  }
]
```

### 2. Historial de Equipo Específico
```
GET /api/history/equipo/:activo_fijo
```
**Ejemplo:**
```
GET /api/history/equipo/EQ001
```

Devuelve todo el historial de un equipo:
- Creación
- Ediciones
- Asignaciones
- Devoluciones
- Eliminación

### 3. Historial de Usuario
```
GET /api/history/usuario/:cedula
```
**Ejemplo:**
```
GET /api/history/usuario/1234567890
```

Devuelve el historial de asignaciones de un usuario:
- Equipos asignados
- Fechas de asignación
- Equipos devueltos

## 💾 Estructura de la Base de Datos

**Tabla: `audit_log`**
```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  tipo_movimiento VARCHAR(50),          -- CREATE, UPDATE, DELETE, ASSIGN, RETURN
  tabla VARCHAR(100),                    -- activos, asignaciones, etc.
  id_registro VARCHAR(100),              -- ID del registro afectado
  usuario VARCHAR(255),                  -- Usuario que realizó la acción
  fecha_hora TIMESTAMP,                  -- Cuándo sucedió
  detalles JSONB,                        -- Información adicional en formato JSON
  estado_anterior JSONB,                 -- Estado antes del cambio (para UPDATE)
  estado_nuevo JSONB,                    -- Estado después del cambio (para UPDATE)
  created_at TIMESTAMP                   -- Cuándo se registró
);
```

**Índices creados para optimizar búsquedas:**
- `idx_audit_tabla` - Búsquedas por tabla
- `idx_audit_id_registro` - Búsquedas por ID de registro
- `idx_audit_usuario` - Búsquedas por usuario
- `idx_audit_fecha_hora` - Búsquedas por fecha (descendente)
- `idx_audit_tipo` - Búsquedas por tipo de movimiento

## 🚀 Uso

### En el Frontend

El usuario puede ver el historial completo en la vista de "Historial" que mostrará:
1. **Todos los cambios** de equipos (creación, edición, eliminación)
2. **Todas las asignaciones** y devoluciones
3. **Quién** realizó cada acción
4. **Cuándo** sucedió
5. **Qué cambió** (para ediciones)

### En el Backend

Al hacer peticiones, el sistema captura automáticamente:
- El usuario que realiza la acción (desde header `x-user-name`)
- La fecha y hora del movimiento
- Los detalles del cambio
- El estado anterior y nuevo

## ⚙️ Configuración

### Variable de Entorno (Opcional)
El usuario que realiza la acción se obtiene del header `x-user-name`:
```javascript
const user = req.headers['x-user-name'] || 'Sistema';
```

Si no se envía, se registra como "Sistema".

## 📊 Ejemplos de Registros

### Ejemplo 1: Creación de Equipo
```json
{
  "tipo_movimiento": "CREATE",
  "tabla": "activos",
  "id_registro": "EQ001",
  "usuario": "Admin",
  "fecha_hora": "2026-05-13T09:00:00Z",
  "detalles": {
    "activo_fijo": "EQ001",
    "nombre_equipo": "Laptop HP",
    "tipo_equipo": "Portátil",
    "marca": "HP",
    "serial": "ABC123",
    "estado": "Disponible"
  }
}
```

### Ejemplo 2: Edición de Equipo
```json
{
  "tipo_movimiento": "UPDATE",
  "tabla": "activos",
  "id_registro": "EQ001",
  "usuario": "Admin",
  "fecha_hora": "2026-05-13T10:00:00Z",
  "detalles": { "activo_fijo": "EQ001" },
  "estado_anterior": {
    "estado": "Disponible",
    "nombre_equipo": "Laptop HP"
  },
  "estado_nuevo": {
    "estado": "Mantenimiento",
    "nombre_equipo": "Laptop HP"
  }
}
```

### Ejemplo 3: Asignación
```json
{
  "tipo_movimiento": "ASSIGN",
  "tabla": "asignaciones",
  "id_registro": "1",
  "usuario": "Admin",
  "fecha_hora": "2026-05-13T11:00:00Z",
  "detalles": {
    "activo_fijo": "EQ001",
    "nombre_equipo": "Laptop HP",
    "cedula": "1234567890",
    "nombre_usuario": "Juan García",
    "fecha_entrega": "2026-05-13",
    "perfil": "Vendedor"
  }
}
```

### Ejemplo 4: Devolución
```json
{
  "tipo_movimiento": "RETURN",
  "tabla": "asignaciones",
  "id_registro": "1",
  "usuario": "Admin",
  "fecha_hora": "2026-05-13T15:00:00Z",
  "detalles": {
    "activo_fijo": "EQ001",
    "nombre_equipo": "Laptop HP",
    "cedula": "1234567890",
    "nombre_usuario": "Juan García",
    "fecha_devolucion": "2026-05-13"
  }
}
```

## 🔒 Ventajas

✅ **Trazabilidad Completa** - Cada movimiento queda registrado con usuario y fecha
✅ **Auditoría** - Cumple con requisitos de auditoría y complianza
✅ **Seguimiento** - Puedes ver el historial completo de cualquier equipo
✅ **Búsquedas Eficientes** - Índices optimizados en BD para búsquedas rápidas
✅ **Información Detallada** - Captura cambios específicos (qué cambió exactamente)
✅ **Automático** - No requiere configuración manual, funciona con los endpoints existentes

## 📌 Próximos Pasos

1. Reiniciar el servidor para que cree la tabla de auditoría automáticamente
2. Comenzar a usar el sistema - los registros se crearán automáticamente
3. Ver el historial en `/api/history`
4. Opcional: Crear un dashboard en el frontend para visualizar los cambios
