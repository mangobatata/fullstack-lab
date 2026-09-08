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
[ En curso ] Nivel 1 — Fundamentos (TypeScript, Modelo Cliente/Servidor, HTTP básico)
[          ] Nivel 2 — Cliente + Servidor (Formularios, APIs REST en memoria, JSON)
[          ] Nivel 3 — Persistencia de Datos (PostgreSQL, SQL relacional puro, migraciones)
[          ] Nivel 4 — Aplicación Fullstack (Nuxt, Nitro, TypeScript, Auth, Permisos)
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

### Bases de datos
- [`docs/databases/01-postgres-productos.md`](docs/databases/01-postgres-productos.md) — Preparación de PostgreSQL y persistencia del catálogo; pendiente identificar la instancia.

### Ejercicios
- [`exercises/01-modelado-productos/`](exercises/01-modelado-productos/) — Modelo y catálogo de productos en memoria.
- [`exercises/02-api-http-node/`](exercises/02-api-http-node/) — API HTTP con Bun como runtime y `node:http`.
- [`exercises/03-api-responses-y-validacion/`](exercises/03-api-responses-y-validacion/) — CRUD en memoria y validación HTTP.
- [`exercises/04-nitro-api/`](exercises/04-nitro-api/) — Mismo concepto con routing y handlers de Nitro.
- [`exercises/05-postgres-productos/`](exercises/05-postgres-productos/) — Preparación de Docker Compose y PostgreSQL; primer intento pendiente.

- [`exercises/06-nitro-api-postgres/`](exercises/06-nitro-api-postgres/) — Implementación anterior restaurada con comentarios sencillos; mejoras pendientes.

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
| **Nitro** | Practiced | 2026-09-05 | `GET /api/products`: handler retorna array, Nitro serializa a `200` + JSON |
| **Robustez del CRUD Nitro** | Learning | 2026-09-07 | UUID implementado; pendientes validación de entradas y razonamiento sobre reinicios |
| **IDs UUID en el catálogo** | Practiced | 2026-09-07 | `Product.id: string` y generación de UUID en datos iniciales y POST |
| **Memoria y persistencia** | Practiced | 2026-09-07 | Confirma que `usb-hub`, creado por POST, desaparece al reiniciar; los productos iniciales se reconstruyen |
| **Persistencia con PostgreSQL** | Learning | 2026-09-07 | Conexión confirmada; identifica unicidad del ID; pendiente razonar ID ausente y definir products |
| **Conexión con psql** | Practiced | 2026-09-07 | `\conninfo` confirma fullstack_lab como lab en 127.0.0.1:5433 |
| **Tablas, filas y columnas** | Learning | 2026-09-07 | Identifica dos filas como dos productos con IDs distintos; introducción guiada a tipos de columnas |
| **Tipos y restricciones de datos** | Learning | 2026-09-07 | Corrección guiada de CHECK (name <> ''); pendiente evaluar nombres formados solo por espacios |

| **CRUD Nitro con PostgreSQL** | Learning | 2026-09-07 | Implementación anterior restaurada a petición del alumno; comentarios sencillos; DELETE implementado; validaciones de POST/PATCH pendientes |

> **Escala de Dominio:**
> - `Learning`: Concepto introducido; guiado.
> - `Practiced`: Se resolvió con preguntas orientadoras.
> - `Comfortable`: Puede explicarlo y detectar errores con mínima ayuda.
> - `Independent`: Lo aplica de forma autónoma en nuevos contextos.
