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
