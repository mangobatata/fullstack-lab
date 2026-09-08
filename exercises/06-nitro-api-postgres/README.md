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

## Implementación restaurada — 2026-09-08

Estado: `Learning`. Recuperamos la implementación anterior con comentarios sencillos. Después se implementó DELETE a petición del alumno: lee el slug, ejecuta un borrado parametrizado y usa rowCount para responder 404 o 204 sin cuerpo. La validación compartida y las pruebas añadidas se retiraron del ejercicio.

Las limitaciones detectadas en la revisión vuelven a quedar pendientes: PATCH sin campos reconocidos, límites numéricos y cambio de slug al enviar name. Se trabajarán de uno en uno.

Verificación: `bun run typecheck`.

```text
petición --> handler --> SQL --> filas --> producto --> JSON
```

## Pregunta orientadora

Si dos reinicios del servidor ya no borran lo creado, ¿dónde vive ahora
el estado y qué proceso es su dueño?

## Siguiente práctica: persistencia real — 2026-09-08

Peticiones preparadas: [scripts/probar-productos.sh](scripts/probar-productos.sh).
Con Nitro y PostgreSQL encendidos, ejecutar `bash scripts/probar-productos.sh`.
Usa `http://localhost:3000` por defecto; se puede cambiar con `BASE_URL`.
Crea diez productos, guarda sus slugs, actualiza los dos primeros y elimina los
dos últimos. Cada ejecución crea un lote nuevo. Sintaxis Bash verificada;
las peticiones no se ejecutaron al preparar el script.

Objetivo: comprobar el CRUD contra PostgreSQL real. Estado: `Learning`.
Hasta ahora, la comprobación HTTP de DELETE usó una base simulada.

Primero crearemos un producto de prueba con POST y guardaremos su slug.
Después reiniciaremos solo Nitro y consultaremos ese mismo slug con GET.
Finalmente comprobaremos PATCH y DELETE sobre ese producto de prueba.

```text
POST --> PostgreSQL guarda el producto
                  |
          reiniciar solo Nitro
                  |
GET por slug --> recuperar el mismo producto
```

Antes de ejecutar: si creamos un producto y reiniciamos solo Nitro,
¿esperás que GET por su slug lo encuentre y por qué?

### Bitácora de Errores Reales

No hay un nuevo intento del alumno todavía. La práctica está propuesta,
no ejecutada; no se da por comprobada la persistencia real.
