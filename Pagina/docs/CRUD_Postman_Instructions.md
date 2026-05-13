# Instructivo para Realizar Requests de CRUD en Postman

Este instructivo te guiará paso a paso para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) en Postman para interactuar con tu API.

---

## **1. Configuración Inicial**

1. **Descargar e Instalar Postman**:
   - Si no tienes Postman instalado, descárgalo desde [https://www.postman.com/downloads/](https://www.postman.com/downloads/).

2. **Abrir Postman**:
   - Inicia la aplicación Postman en tu computadora.

3. **Crear una Nueva Colección**:
   - Haz clic en el botón `+` o en `New Collection`.
   - Asigna un nombre a tu colección, por ejemplo: `CRUD API`.

---

## **2. Crear un Request para Crear Usuario (POST)**

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

---

## **6. Crear un Request para Crear Activo (POST)**

1. **Seleccionar el Método HTTP**:
   - Haz clic en el menú desplegable y selecciona `POST`.

2. **Ingresar la URL del Endpoint**:
   - Escribe la URL del endpoint para crear un activo, por ejemplo:
     ```
     http://localhost:3001/api/activos
     ```

3. **Configurar el Cuerpo de la Solicitud (Body)**:
   - Selecciona la pestaña `Body`.
   - Elige la opción `raw` y selecciona `JSON` en el menú desplegable.
   - Ingresa el cuerpo de la solicitud en formato JSON. Ejemplo:
     ```json
     {
       "nombre": "Laptop",
       "descripcion": "Laptop Dell Inspiron",
       "contrato_id": 123
     }
     ```

4. **Enviar la Solicitud**:
   - Haz clic en el botón `Send`.
   - Verifica la respuesta en la sección inferior.

---

## **7. Leer Activos (GET)**

1. **Seleccionar el Método HTTP**:
   - Haz clic en el menú desplegable y selecciona `GET`.

2. **Ingresar la URL del Endpoint**:
   - Escribe la URL del endpoint para obtener los activos. Ejemplo:
     ```
     http://localhost:3001/api/activos
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
     http://localhost:3001/api/activos/1
     ```

3. **Configurar el Cuerpo de la Solicitud (Body)**:
   - Selecciona la pestaña `Body`.
   - Elige la opción `raw` y selecciona `JSON` en el menú desplegable.
   - Ingresa el cuerpo de la solicitud en formato JSON. Ejemplo:
     ```json
     {
       "nombre": "Laptop Actualizada",
       "descripcion": "Laptop Dell Inspiron Actualizada",
       "contrato_id": 123
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
     http://localhost:3001/api/activos/1
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