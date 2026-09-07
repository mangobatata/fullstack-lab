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
- [ ] `GET /api/products/:slug` → con `WHERE slug = $1`, `404` si `null`
- [ ] `POST /api/products` → `INSERT ... RETURNING`, `201` / `400` / `409`
- [ ] `PATCH /api/products/:slug` → `UPDATE ... WHERE ... RETURNING`, parcial
- [ ] `DELETE /api/products/:slug` → `204`, `404` si no existe

## Pregunta orientadora

Si dos reinicios del servidor ya no borran lo creado, ¿dónde vive ahora
el estado y qué proceso es su dueño?
