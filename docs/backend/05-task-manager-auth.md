# Auth del Task Manager, paso a paso

Estado: `Learning`.

## Objetivo

Entender el código actual de [server/api/auth](../../exercises/07-task-manager/server/api/auth): crear una cuenta, iniciar sesión, reconocer al usuario y cerrar sesión.

## La idea general

Registrarse guarda una cuenta. Hacer login comprueba sus credenciales y entrega una cookie para reconocerla en peticiones posteriores.

```text
Navegador                         Servidor                    PostgreSQL
    |                                |                            |
    |-- registro: nombre/email/pass ->|-- guardar usuario + hash -->|
    |<-- 201: nombre y email ---------|                            |
    |                                |                            |
    |-- login: email/password ------->|-- buscar usuario ---------->|
    |                                |<-- usuario y hash ----------|
    |                                | verificar contraseña        |
    |<-- usuario + cookie de sesión --|                            |
    |                                |                            |
    |-- /me + cookie ---------------->|-- buscar por id ----------->|
    |<-- usuario actual -------------|<-- datos públicos -----------|
    |                                |                            |
    |-- logout ---------------------->|                            |
    |<-- instrucción: vaciar cookie --|                            |
```

La implementación usa `nuxt-auth-utils`: los datos de sesión van en una cookie cifrada y sellada llamada `nuxt-session`. El esquema actual no tiene una tabla de sesiones. PostgreSQL almacena las cuentas.

## 1. Registro: «quiero crear una cuenta»

Archivo: [register.post.ts](../../exercises/07-task-manager/server/api/auth/register.post.ts). Ruta: `POST /api/auth/register`.

```text
Leer nombre, email y contraseña del body.
Validar con Zod:
  - nombre: quitar espacios de los extremos; mínimo 2 caracteres;
  - email: quitar espacios de los extremos, pasar a minúsculas y validar formato;
  - contraseña: mínimo 8 caracteres, sin recortar espacios.
Si los datos no cumplen -> responder 400.

Buscar una cuenta con ese email.
Si existe -> responder 409.

Generar el hash de la contraseña con Argon2id.
Guardar nombre, email y passwordHash en users.
Si PostgreSQL detecta un duplicado al insertar -> responder 409.
Si ocurre otro error de inserción -> propagarlo.
Si se guardó -> responder 201 con nombre y email.
```

**Por qué:** el hash permite verificar una contraseña sin guardar su texto original. No se descifra: durante el login se usa una función de verificación.

La consulta previa del email permite detectar el duplicado antes de insertar. La restricción `UNIQUE` de la base también lo impide si llegan dos registros simultáneos. El helper `getPostgresErrorCode` identifica el código `23505`, incluso dentro de la causa del error.

**Registrar no inicia sesión:** este endpoint no llama a `setUserSession`.

## 2. Login: «quiero entrar con mi cuenta»

Archivo: [login.post.ts](../../exercises/07-task-manager/server/api/auth/login.post.ts). Ruta: `POST /api/auth/login`.

```text
Leer email y contraseña.
Normalizar el email y validar ambos campos con Zod.
Si el body es inválido -> responder 400.

Buscar el usuario por email.
Si no existe -> responder 401: "Invalid credentials."

Verificar la contraseña recibida contra passwordHash usando Argon2.
Si no coincide -> responder el mismo 401.

Preparar usuario público: id, name, email.
Llamar a setUserSession con ese usuario.
La librería envía la cookie mediante Set-Cookie.
Responder 200 con mensaje y usuario público.
```

**Por qué:** validar el formato no demuestra que la cuenta exista ni que la contraseña sea correcta. Son comprobaciones distintas. La contraseña y su hash no se incluyen en la sesión ni en la respuesta.

El navegador guarda la cookie y la envía en las siguientes peticiones cuando corresponda. Así no hace falta mandar la contraseña en cada petición.

## 3. Me: «¿quién soy en esta sesión?»

Archivo: [me.get.ts](../../exercises/07-task-manager/server/api/auth/me.get.ts). Ruta: `GET /api/auth/me`.

```text
Pedir una sesión autenticada con requireUserSession.
Si no hay una sesión válida con usuario -> responder 401.

Tomar session.user.id.
Buscar ese id en users, seleccionando solo id, name y email.
Si el usuario ya no existe:
  limpiar la sesión;
  responder 401.

Responder 200 con { user: datos actuales de la base }.
```

**Por qué:** una cookie puede seguir existiendo después de borrar la cuenta. Consultar la base comprueba que el usuario sigue existiendo y devuelve sus datos actuales.

## 4. Logout: «quiero salir»

Archivo: [logout.post.ts](../../exercises/07-task-manager/server/api/auth/logout.post.ts). Ruta: `POST /api/auth/logout`.

```text
Llamar a clearUserSession.
Enviar al navegador la instrucción para vaciar la cookie.
Responder 200 con "Logout successful".
```

También funciona si no había una sesión. No borra la cuenta. Este código no implementa revocación en el servidor de una copia anterior de la cookie; el test comprueba que el navegador utiliza la cookie vaciada.

## Piezas que conectan todo

| Pieza | Responsabilidad |
| --- | --- |
| [schema.ts](../../exercises/07-task-manager/server/db/schema.ts) | Define `users`: id, nombre, email único y hash. |
| [password.ts](../../exercises/07-task-manager/server/api/utils/password.ts) | Genera hashes Argon2id y verifica contraseñas. |
| [db-error.ts](../../exercises/07-task-manager/server/api/utils/db-error.ts) | Extrae el código del error de PostgreSQL. |
| [auth.d.ts](../../exercises/07-task-manager/server/types/auth.d.ts) | Define la forma del usuario público para TypeScript; no valida peticiones. |
| [nuxt.config.ts](../../exercises/07-task-manager/nuxt.config.ts) | Activa `nuxt-auth-utils`, que proporciona los helpers de sesión por autoimportación. |

Leer el body obtiene datos; Zod comprueba esos datos en ejecución. El tipo TypeScript por sí solo no valida lo que envía el cliente.

## Bitácora de Errores Reales

Casos ya registrados en el [README del ejercicio](../../exercises/07-task-manager/README.md):

- Un login devolvía 401 y la cuenta no existía en la base consultada. Corrección conceptual: registro y login deben usar la misma instancia y base; ese resultado no demuestra una contraseña incorrecta.
- Un test esperaba `connect.sid` y el texto `clear`. Corrección: esta implementación utiliza `nuxt-session`, y el logout devuelve la cookie con valor vacío.
- Un test eliminaba el usuario necesario para el login. Corrección: cada caso prepara sus datos y limpia únicamente los propios.

## Cómo comprobar el flujo

Con Nuxt y PostgreSQL iniciados y usando la misma base, desde `exercises/07-task-manager`:

```bash
bun run typecheck
bun run test tests/integration/auth.test.ts
```

Las pruebas cubren registro, normalización, duplicados, validación, login correcto e incorrecto, cookies, usuario eliminado y logout. `TEST_BASE_URL` permite cambiar el destino predeterminado `http://localhost:3000`.
