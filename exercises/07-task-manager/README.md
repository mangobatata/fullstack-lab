# Ejercicio 07 — Task Manager colaborativo

Primer producto fullstack completo: cada usuario organiza su trabajo en
proyectos, y cada proyecto se parte en tareas con estado (`todo/doing/done`).

## El producto

* **Usuario objetivo:** persona que gestiona trabajo personal o en equipo.
* **Flujo principal:** registro → creo proyecto → agrego tareas → las marco hechas → filtro por estado.
* **MVP:** `users`, `projects`, `tasks` con dueño; registro/login con sesiones;
  autorización por propiedad; frontend Nuxt al final.
* **Reglas:** una tarea pertenece a un proyecto; un proyecto tiene un dueño;
  nadie ve ni toca lo ajeno; estados cerrados.

## Stack

Nuxt + Nitro + Drizzle ORM + PostgreSQL (Docker local, puerto 5433).
Sin servicios externos: nada de Supabase/Neon en esta etapa.

## Base de datos

```bash
cd exercises/07-task-manager
docker compose up -d
docker compose exec db pg_isready -U lab -d fullstack_lab
```

Variables en `.env` (no se commitea; `dotenv` no expande `${...}`, usar valores literales):

```bash
POSTGRES_DB="..."
POSTGRES_USER="..."
POSTGRES_PASSWORD="..."
DATABASE_URL="postgres://USER:PASS@127.0.0.1:5433/DB"
```

## Drizzle: esquema → migración → tablas

```bash
# 1. Editar el esquema
#    server/db/schema.ts

# 2. Generar la migración SQL (revisar el archivo antes de aplicar)
bunx drizzle-kit generate

# 3. Aplicarla a la base
bunx drizzle-kit migrate --config=drizzle.config.ts

# 4. Verificar
docker compose exec db psql -U lab -d fullstack_lab -c "\dt public.*"
```

El esquema genera SQL en `server/db/migrations/`. Drizzle es solo el
mensajero tipado: cada operación equivale a un SQL que ya conoces
(`FOREIGN KEY`, `UNIQUE`, `CHECK` vía restricciones).

## Estado

Rama `exercise/07-task-manager`. Esquema `users`/`projects`/`tasks` migrado.
Siguiente: primer endpoint (crear usuario, proyecto o tarea).

## Pruebas de autenticación — Learning

Objetivo: verificar por HTTP registro, login, consulta del usuario y logout,
con PostgreSQL real. Cada caso crea sus propios usuarios; la limpieza elimina
únicamente los emails generados por esta ejecución.

```text
Test -> registro -> PostgreSQL
     -> login -> Set-Cookie
     -> /me + Cookie -> usuario público
     -> logout -> cookie vacía -> /me devuelve 401
```

Con PostgreSQL y `bun run dev` levantados, y la misma `DATABASE_URL` para
servidor y tests:

```bash
bun run test tests/integration/auth.test.ts
bun run typecheck
```

`TEST_BASE_URL` permite cambiar `http://localhost:3000`. Las pruebas usan Vitest,
el runner de `package.json`. El typecheck comprueba los contextos Node (incluidos
los tests) y servidor de Nuxt; requiere los archivos generados por `nuxt prepare`
y TypeScript instalado en el workspace.

Cobertura: éxito, validación, email duplicado, credenciales incorrectas,
cookies ausentes o inválidas, usuario eliminado y logout. El logout comprueba
el reemplazo de la cookie por el navegador; no demuestra revocación de una
copia anterior de la cookie en el servidor.

### Bitácora de Errores Reales

- El test original eliminaba todos los usuarios, incluyendo el que necesitaba
  para login. Corrección: preparar datos por caso y limpiar solo los propios.
- Importaba `bun:test` aunque el script ejecutaba Vitest. Se unificó el runner.
- Esperaba `connect.sid` y el texto `clear`: el proyecto utiliza `nuxt-session`
  y logout devuelve su valor vacío.

Pregunta de revisión: ¿por qué cada caso de login crea su propio usuario?

## Diseño de POST /api/projects — Learning

Objetivo: crear proyectos cuyo propietario sea el usuario autenticado.
El alumno identificó que el `userId` debe obtenerse de la sesión.
El servidor utiliza `session.user.id` para asignar el propietario; un `userId`
enviado en el body no debe decidir a quién pertenece el proyecto.

```text
Cookie -> validar sesión -> session.user.id -> propietario del proyecto
Body   -> validar datos  -> datos del proyecto
```

El endpoint exige sesión válida (401 si falta), valida el body (400) y crea
el proyecto con 201. El body solo admite `projectName`; el propietario se toma
de la sesión. El nombre puede repetirse: el slug incorpora seis caracteres de un UUID y la base
de datos exige su unicidad. Por decisión del alumno se conserva
`const baseSlug = slugify(projectName);`, sin truncamiento ni valor alternativo.

Verificación: `bun run test tests/integration` ejecuta autenticación y proyectos.
Los tests de proyectos comprueban persistencia, propietario, ausencia de sesión,
body inválido, intento de enviar `userId`, nombres repetidos y límites del slug.
Pendiente: explicación del alumno antes de cerrar la unidad.

### Bitácora de Errores Reales

- El endpoint importaba `requireUserSession` desde `../utils/session`, pero ese
  archivo no existe. Se eliminó el import: `nuxt-auth-utils` proporciona esta
  función mediante autoimportación, como en `server/api/auth/me.get.ts`.
- Se utilizaba `name` aunque la propiedad del esquema es `projectName`; luego
  se asignó el objeto columna como valor. El insert requiere el texto validado
  `projectName`; la selección utiliza `projectsTable.projectName`.
- `uuidv4(6, 0)` no corresponde a la firma de la función. `uuidv4()` genera
  el identificador completo sin argumentos.
- `const [project] = ...values(project)` ocultaba la variable de entrada antes
  de inicializarse. La fila devuelta ahora se llama `createdProject`.
- Faltaba importar `getPostgresErrorCode` desde el helper existente.
- La consulta de duplicados buscaba el slug base, pero se insertaba UUID + slug.
  Se eliminó esa comprobación incoherente; la restricción UNIQUE protege el slug
  definitivo y su conflicto se transforma en 409.
- Al acortar el prefijo a seis caracteres se perdió el límite del sufijo y su
  valor alternativo. Los tests detectaron un 500 para nombres de 255 caracteres
  y un sufijo vacío para nombres no latinos. El alumno eligió conservar la
  generación simple; ambos casos quedan pendientes. Estado de esta versión:
  29 pruebas pasan y 2 fallan; la unidad no está cerrada.

### Diagnóstico de login con 401

Objetivo: distinguir validación del body de verificación de credenciales.

```text
Body inválido -> 400
Body válido  -> buscar usuario -> ausente: 401
                              -> presente: verificar hash -> no coincide: 401
```

En el caso reportado se consultó la base configurada para este ejercicio y
no se encontró la cuenta indicada. No se guardaron credenciales en el registro.
La petición reportada apuntaba al puerto 3001; aún debe confirmarse que esa
instancia utiliza la misma base. Registrar la cuenta y hacer login debe ocurrir
contra la misma instancia y base de datos.

Bitácora de Errores Reales: se observó un login rechazado con 401 y una cuenta
inexistente en la base consultada; no se verificó una contraseña incorrecta.
