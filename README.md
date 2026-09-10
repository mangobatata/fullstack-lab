# Fullstack Lab

Laboratorio de aprendizaje práctico de Ingeniería de Software y Desarrollo Fullstack.

Este repositorio documenta el razonamiento, experimentos, código, errores y evolución técnica desde fundamentos básicos hasta sistemas web en producción.

---

## Filosofía de Trabajo

1. **Razonar antes de codificar:** Comprender qué entra, qué sale, quién inicia y qué puede fallar antes de escribir una sola línea.
2. **Fundamento antes que framework:** Entender el protocolo HTTP, procesos del SO y bases de datos antes de usar abstracciones de alto nivel.
3. **Aprender de los errores:** Cada error real de concepto se documenta junto a su corrección y aprendizaje.
4. **Construcción incremental:** De programas mínimos a sistemas con persistencia, autenticación y despliegue.

---

## Hoja de Ruta (Roadmap)

```text
[ Completado ] Nivel 1 — Fundamentos (TypeScript, Modelo Cliente/Servidor, HTTP básico)
[ Completado ] Nivel 2 — Cliente + Servidor (APIs REST en memoria y Nitro, JSON, validación)
[ Completado ] Nivel 3 — Persistencia de Datos (PostgreSQL, SQL relacional, pg parametrizado)
[ En curso   ] Nivel 4 — Aplicación Fullstack (Nuxt + Drizzle + Task Manager, Auth, Permisos)
[          ] Nivel 5 — Sistemas y Robustez (Testing, Seguridad, Caching, Realtime, Go para networking)
[          ] Nivel 6 — Producto & Producción (Docker, Linux, Deploy, Monitoreo)
```

### Progresión de herramientas

```text
Fundamentos HTTP con node:http
            │
            ▼
APIs con Bun/Node y persistencia
            │
            ▼
Nuxt + Nitro + Vue abstraen routing, handlers y respuestas HTTP
            │
            ▼
PostgreSQL, autenticación, testing y producción
```

`node:http` se usa aquí como una lupa para comprender la base del protocolo. No es el destino tecnológico final del laboratorio.

---

## Índice de Documentación (`docs/`)

### HTTP & Networking
- [`docs/http/01-modelo-cliente-servidor.md`](docs/http/01-modelo-cliente-servidor.md) — Modelo Cliente-Servidor, ciclo Request/Response y componentes HTTP básicos.

### Backend & Arquitectura
- [`docs/backend/01-modelado-y-colecciones-en-memoria.md`](docs/backend/01-modelado-y-colecciones-en-memoria.md) — Modelado de contratos (`interface`), estado en memoria y entrega de colecciones.
- [`docs/backend/02-nitro-handlers-y-serializacion.md`](docs/backend/02-nitro-handlers-y-serializacion.md) — Handler retorna valor JS, Nitro serializa a HTTP.
- [`docs/backend/03-nitro-revision-crud.md`](docs/backend/03-nitro-revision-crud.md) — Revisión del CRUD: identidad, validación y chequeo de tipos.

- [`docs/backend/04-nitro-postgres-revision.md`](docs/backend/04-nitro-postgres-revision.md) — Revisión de validación y CRUD persistente; `Learning`.
- [`docs/backend/05-task-manager-auth.md`](docs/backend/05-task-manager-auth.md) — Auth paso a paso: registro, login, cookie, usuario actual y logout; `Learning`.

### Bases de datos
- [`docs/databases/01-postgres-productos.md`](docs/databases/01-postgres-productos.md) — PostgreSQL en Docker, tabla `products` con restricciones, CRUD SQL, SQL injection vs parametrizadas, cliente `pg`.

### Ejercicios
- [`exercises/01-modelado-productos/`](exercises/01-modelado-productos/) — Modelo y catálogo de productos en memoria.
- [`exercises/02-api-http-node/`](exercises/02-api-http-node/) — API HTTP con Bun como runtime y `node:http`.
- [`exercises/03-api-responses-y-validacion/`](exercises/03-api-responses-y-validacion/) — CRUD en memoria y validación HTTP.
- [`exercises/04-nitro-api/`](exercises/04-nitro-api/) — CRUD en memoria con routing y handlers de Nitro.
- [`exercises/05-postgres-productos/`](exercises/05-postgres-productos/) — PostgreSQL en Docker, `schema.sql`, `seed.sql`, SQL CRUD y módulo Node con `pg` tipado.
- [`exercises/06-nitro-api-postgres/`](exercises/06-nitro-api-postgres/) — CRUD Nitro persistente en PostgreSQL, slugs autogenerados, script `probar-productos.sh`.
- [`exercises/07-task-manager/`](exercises/07-task-manager/) — En curso: Task Manager (Nuxt + Drizzle) con `users`, `projects`, `tasks`.

---

## Registro de Estado de Aprendizaje

| Concepto / Habilidad | Nivel de Dominio | Fecha de Inicio | Contextos Aplicados |
| :--- | :--- | :--- | :--- |
| **Modelo Cliente-Servidor** | Practiced | 2026-09-05 | Petición de catálogo en navegador |
| **Ciclo Request / Response** | Practiced | 2026-09-05 | Identificación de `GET /productos` y `Status Code + Body` |
| **Tipado en TypeScript** | Practiced | 2026-09-05 | Interfaz `Product` y colecciones en memoria |
| **Flujo de Ejecución & Retornos** | Practiced | 2026-09-05 | Análisis de retornos tempranos y bucles en `getProducts` |
| **API HTTP con `node:http`** | Practiced | 2026-09-05 | Rutas `GET`, respuestas JSON, `404` y `405` |
| **Validación y CRUD en memoria** | Practiced | 2026-09-05 | `POST`, `PATCH`, `DELETE`, `400`, `409`, `201`, `204` |
| **Nitro** | Practiced | 2026-09-05 | CRUD en memoria y persistente (`200`, `201`, `204`, `400`, `404`, `409`) |
| **SQL y restricciones** | Practiced | 2026-09-07 | `CREATE TABLE`, `CHECK`, `UNIQUE`, `SERIAL PK`, `WHERE` como freno de mano |
| **Consultas parametrizadas** | Practiced | 2026-09-07 | Inyección demostrada (`count 4`) vs `$1` (`count 0`) |
| **Cliente `pg` en Node** | Practiced | 2026-09-07 | `Pool`, `DATABASE_URL` en `.env`, mapeo `NUMERIC→number`, `null→404` |
| **CRUD Nitro + Postgres** | Practiced | 2026-09-08 | 06 verificado punta a punta con `probar-productos.sh`, slugs autogenerados |
| **Task Manager (Nuxt + Drizzle)** | Learning | 2026-09-08 | Esquema implementado; endpoints de auth y proyectos presentes; guía de auth disponible; comprensión y cierre pendientes |

> **Escala de Dominio:**
> - `Learning`: Concepto introducido; guiado.
> - `Practiced`: Se resolvió con preguntas orientadoras.
> - `Comfortable`: Puede explicarlo y detectar errores con mínima ayuda.
> - `Independent`: Lo aplica de forma autónoma en nuevos contextos.
