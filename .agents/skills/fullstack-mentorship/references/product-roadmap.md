# Ruta de Productos Fullstack

Progresión orientativa de capacidades. Adaptable a intereses del alumno,
pero conservando el orden de dependencias técnicas.

## Etapa 1 — Fundamentos (completada)

* TypeScript aplicado: tipos, interfaces, colecciones en memoria.
* HTTP con `node:http`: rutas, métodos, status, JSON, validación.
* Nitro en memoria: handlers, routing por archivos, errores.
* PostgreSQL en Docker: tablas, restricciones, SQL CRUD, consultas parametrizadas.
* Nitro + PostgreSQL con `pg`: CRUD persistente verificado punta a punta.

## Etapa 2 — Task Manager fullstack (en curso)

* Drizzle ORM relacionado con su SQL.
* Nuxt + Vue: componentes, formularios, estados, sesión.
* Tablas `users`, `projects`, `tasks` con ownership.
* Auth: registro, hash, login/logout, sesiones en cookie `httpOnly`.
* Autorización por propiedad + tests por caso sin permiso.

## Etapa 3 — Seguridad de cuentas

* Verificación de email, tokens de un solo uso con expiración.
* Reset de contraseña, rate limiting, enumeración de cuentas.

## Etapa 4 — E-commerce pequeño

* Productos, variantes, stock, carrito, órdenes, estados.
* Dinero en enteros, transacciones, idempotencia, panel admin.

## Etapa 5 — Realtime y sistemas

* Chat con WebSockets, reservas o notificaciones.
* Redis solo ante necesidad real (rate limiting, caché, colas).

## Etapa 6 — Go (segunda etapa, no antes)

Solo tras dominar el stack TypeScript. Sin microservicios artificiales:

1. Servidor HTTP mínimo con `net/http`.
2. Mini e-commerce Go (Postgres, auth, JWT para CLI).
3. Chat CLI (TCP, goroutines, concurrencia).
4. Mini Slack web (WebSockets, presencia).

## Etapa 7 — Producción

* Docker, deploy, HTTPS, observabilidad, backups.
* SaaS multi-tenant como proyecto de cierre.
