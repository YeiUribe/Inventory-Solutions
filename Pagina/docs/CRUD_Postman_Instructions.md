# Instructivo para Realizar Requests de CRUD en Postman

Este instructivo te guiará paso a paso para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en Postman para interactuar con tu API.

---

## **A. Autenticación (login) — obtener role para headers**

1. **Método**: `POST`
2. **Endpoint**: `http://localhost:3001/api/auth/login`
3. **Body (JSON)**:
   ```json
   {
     "username": "yuribe",  
     "password": "123"
   }
   ```
4. **Respuesta**: el servidor responde con un JSON que incluye `role` y `name`. Copia `role` y usa su valor en la cabecera `x-user-role` para requests administrativas (por ejemplo `Administrador`).

---

## **B. Asignaciones (assign / devolver)**

1. **Crear asignación (POST)**
   - Método: `POST`
   - Endpoint: `http://localhost:3001/api/asignaciones`
   - Headers: `x-user-role: Administrador`, `x-user-name: TuNombre`
   - Body ejemplo:
     ```json
     {
       "activo_fijo": "EQ001234",
       "cedula": "10102020",
       "id_ubicacion": 1,
       "fecha_entrega": "2026-05-20",
       "perfil": "Analista",
       "concepto": "Asignación inicial"
     }
     ```

2. **Listar asignaciones (GET)**
   - Método: `GET`
   - Endpoint: `http://localhost:3001/api/asignaciones` (opcional `?activo_fijo=EQ001234`)

3. **Devolver activo (PUT)**
   - Método: `PUT`
   - Endpoint: `http://localhost:3001/api/asignaciones/devolver/EQ001234`
   - Headers: `x-user-role: Administrador`, `x-user-name: TuNombre`

---

## **1. Crear un Request para Crear Usuario (POST)**

1. **Seleccionar el Método HTTP**:
   - Haz clic en el menú desplegable y selecciona `POST`.

2. **Ingresar la URL del Endpoint**:
   - Escribe la URL del endpoint para crear un usuario, por ejemplo:
     ```
      http://localhost:3001/api/usuarios
     ```

3. **Configurar el Cuerpo de la Solicitud (Body)**:
   - Selecciona la pestaña `Body`.
   - Elige la opción `raw` y selecciona `JSON` en el menú desplegable.
   - Ingresa el cuerpo de la solicitud en formato JSON. Ejemplo:
     ```json
     {
       "cedula": "123456789",
       "usuario_login": "juanperez",
       "nombre": "Juan Perez",
       "email": "juan.perez@example.com",
       "password": "123456",
       "id_rol": 1
     }
     ```

4. **Enviar la Solicitud**:
   - Haz clic en el botón `Send`.
   - Verifica la respuesta en la sección inferior.

**Nota (permiso):** Las operaciones de creación/actualización/eliminación de usuarios requieren rol *Administrador*. Desde Postman añade en la pestaña `Headers` la cabecera:

```
x-user-role: Administrador
x-user-name: TuNombre
```
Si no incluyes esta cabecera, el servidor responderá `403 Acceso restringido`.

---

## **3. Leer Usuarios (GET)**

1. **Seleccionar el Método HTTP**:
   - Haz clic en el menú desplegable y selecciona `GET`.

2. **Ingresar la URL del Endpoint**:
    - Escribe la URL del endpoint para obtener los usuarios. Ejemplo:
       ```
       http://localhost:3001/api/usuarios
       ```

3. **Enviar la Solicitud**:
   - Nota: listar usuarios está protegido y requiere rol `Administrador`. Añade header `x-user-role: Administrador` en la pestaña `Headers`.
   - Haz clic en el botón `Send`.
   - Verifica la respuesta en la sección inferior.

---

## **4. Actualizar un Usuario (PUT)**

1. **Seleccionar el Método HTTP**:
   - Haz clic en el menú desplegable y selecciona `PUT`.

2. **Ingresar la URL del Endpoint**:
   - Escribe la URL del endpoint para actualizar un usuario, incluyendo el ID del usuario. Ejemplo:
     ```
     http://localhost:3001/api/usuarios/1
     ```

3. **Configurar el Cuerpo de la Solicitud (Body)**:
   - Selecciona la pestaña `Body`.
   - Elige la opción `raw` y selecciona `JSON` en el menú desplegable.
   - Ingresa el cuerpo de la solicitud en formato JSON. Ejemplo:
     ```json
     {
       "cedula": "123456789",
       "nombre": "Juan Perez Actualizado",
       "email": "juan.perez@example.com",
       "password": "654321",
       "usuario_login": "juanperez",
       "id_rol": 1
     }
     ```

4. **Enviar la Solicitud**:
   - Haz clic en el botón `Send`.
   - Verifica la respuesta en la sección inferior.

**Importante:** Esta acción requiere cabecera `x-user-role: Administrador`.

---

## **5. Eliminar un Usuario (DELETE)**

1. **Seleccionar el Método HTTP**:
   - Haz clic en el menú desplegable y selecciona `DELETE`.

2. **Ingresar la URL del Endpoint**:
   - Escribe la URL del endpoint para eliminar un usuario, incluyendo el ID del usuario. Ejemplo:
     ```
     http://localhost:3001/api/usuarios/1
     ```

3. **Enviar la Solicitud**:
   - Haz clic en el botón `Send`.
   - Verifica la respuesta en la sección inferior.

**Importante:** Esta acción requiere cabecera `x-user-role: Administrador`.

---

## **6. Crear un Request para Crear Activo (POST)**

1. **Seleccionar el Método HTTP**:
   - Haz clic en el menú desplegable y selecciona `POST`.

2. **Ingresar la URL del Endpoint**:
   - Escribe la URL del endpoint para crear un activo, por ejemplo:
     ```
      http://localhost:3001/api/inventory
     ```

3. **Configurar el Cuerpo de la Solicitud (Body)**:
   - Selecciona la pestaña `Body`.
   - Elige la opción `raw` y selecciona `JSON` en el menú desplegable.
   - Ingresa el cuerpo de la solicitud en formato JSON. Ejemplo:
     ```json
      {
         "activo_fijo": "EQ001234",
         "device": "Laptop Dell Inspiron",
         "nombre_equipo": "Laptop Dell",
         "marca": "Dell",
         "detalle_equipo": "Inspiron 15",
         "category": "Portatil",
         "status": "Disponible",
         "serial": "SN123456",
         "id_contrato": 123
      }
     ```

4. **Enviar la Solicitud**:
   - Haz clic en el botón `Send`.
   - Verifica la respuesta en la sección inferior.

**Importante:** Crear/actualizar/eliminar activos requiere rol `Administrador`. Añade el header `x-user-role: Administrador` y `x-user-name`.

---

## **7. Leer Activos (GET)**

1. **Seleccionar el Método HTTP**:
   - Haz clic en el menú desplegable y selecciona `GET`.

2. **Ingresar la URL del Endpoint**:
   - Escribe la URL del endpoint para obtener los activos. Ejemplo:
     ```
      http://localhost:3001/api/inventory
     ```

3. **Enviar la Solicitud**:
   - Haz clic en el botón `Send`.
   - Verifica la respuesta en la sección inferior.

---

## **8. Actualizar un Activo (PUT)**

1. **Seleccionar el Método HTTP**:
   - Haz clic en el menú desplegable y selecciona `PUT`.

2. **Ingresar la URL del Endpoint**:
   - Escribe la URL del endpoint para actualizar un activo, incluyendo el ID del activo. Ejemplo:
     ```
      http://localhost:3001/api/inventory/EQ001234
     ```

3. **Configurar el Cuerpo de la Solicitud (Body)**:
   - Selecciona la pestaña `Body`.
   - Elige la opción `raw` y selecciona `JSON` en el menú desplegable.
   - Ingresa el cuerpo de la solicitud en formato JSON. Ejemplo:
     ```json
      {
         "device": "Laptop Dell Inspiron",
         "nombre_equipo": "Laptop Dell Actualizada",
         "marca": "Dell",
         "detalle_equipo": "Inspiron 15 - Actualizada",
         "category": "Portatil",
         "status": "Disponible",
         "serial": "SN123456",
         "id_contrato": 123
      }
     ```

4. **Enviar la Solicitud**:
   - Haz clic en el botón `Send`.
   - Verifica la respuesta en la sección inferior.

---

## **9. Eliminar un Activo (DELETE)**

1. **Seleccionar el Método HTTP**:
   - Haz clic en el menú desplegable y selecciona `DELETE`.

2. **Ingresar la URL del Endpoint**:
   - Escribe la URL del endpoint para eliminar un activo, incluyendo el ID del activo. Ejemplo:
     ```
      http://localhost:3001/api/inventory/EQ001234
     ```

3. **Enviar la Solicitud**:
   - Haz clic en el botón `Send`.
   - Verifica la respuesta en la sección inferior.

---

## **10. Verificar Respuestas**

- **Códigos de Estado HTTP**:
  - `200 OK`: Operación exitosa.
  - `201 Created`: Recurso creado exitosamente.
  - `400 Bad Request`: Error en los datos enviados.
  - `404 Not Found`: Recurso no encontrado.
  - `500 Internal Server Error`: Error en el servidor.

- **Mensajes de Respuesta**:
  - Revisa los mensajes de respuesta para confirmar que la operación se realizó correctamente.

---

## **11. Guardar y Organizar Requests**

1. **Guardar Requests**:
   - Haz clic en `Save` para guardar cada request en la colección creada.

2. **Organizar Requests**:
   - Agrupa los requests en carpetas dentro de la colección si es necesario.

---

¡Listo! Ahora puedes realizar operaciones CRUD en tu API utilizando Postman. Si tienes problemas, verifica los endpoints y los datos enviados.