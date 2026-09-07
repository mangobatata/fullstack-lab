# Ejercicio 06: Nitro + PostgreSQL

## Objetivo

La misma API del ejercicio 04, pero persistente: los handlers leen y escriben
en PostgreSQL (ejercicio 05) en lugar de un array en memoria.

```text
handler → pool.query($1, $2...) → Postgres → filas → toProduct → JSON
```

## Requisito: `.env` (lo creás vos, no se commitea)

```bash
DATABASE_URL="postgres://lab:<tu-password>@127.0.0.1:5433/fullstack_lab"
```

Postgres debe estar corriendo (ver `../05-postgres-productos/docker-compose.yml`).

## Rutas

- [x] `GET /api/products` → `server/api/products/index.get.ts`
- [x] `GET /api/products/:slug` → con `WHERE slug = $1`, `404` si `null`
- [x] `POST /api/products` → `INSERT ... RETURNING`, `201` / `400` / `409`
- [x] `PATCH /api/products/:slug` → `UPDATE ... WHERE ... RETURNING`, parcial
- [x] `DELETE /api/products/:slug` → `204`, `404` si no existe

## Correcciones implementadas — 2026-09-07

Estado de aprendizaje: `Learning`. Las cinco rutas están implementadas.

- POST exige name, price y quantity; PATCH exige al menos uno. Ambos rechazan campos desconocidos, arrays y valores que no sean objetos.
- name se guarda sin espacios exteriores; quantity admite enteros de 0 a 2147483647.
- price admite valores finitos de 0 a 99999999.99 con hasta dos decimales; los decimales adicionales se rechazan, no se redondean.
- El slug usa un UUID completo, se genera solo al crear y se conserva incluso al renombrar. Los slugs existentes siguen siendo válidos.
- DELETE devuelve 204 sin cuerpo, o 404 si no existe.
- Los comentarios en handlers, validación, tipos y utilidades explican el flujo.

Verificación: `bun run typecheck`, `bun run test` y `bun run build`.
Las pruebas usan HTTP en proceso y PostgreSQL simulado; no verifican una instancia real.

Registro: [revisión de persistencia](../../docs/backend/04-nitro-postgres-revision.md).

## Pregunta orientadora

Si dos reinicios del servidor ya no borran lo creado, ¿dónde vive ahora
el estado y qué proceso es su dueño?
