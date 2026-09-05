# Ejercicio 03: Validación de datos y respuestas HTTP

## Objetivo

Validar que la cantidad de un producto nunca sea negativa y traducir datos inválidos a una respuesta HTTP apropiada.

## Regla del dominio

- `quantity === 0`: producto válido, sin stock.
- `quantity > 0`: producto válido, disponible.
- `quantity < 0`: dato inválido, debe rechazarse.

## Pregunta orientadora

¿Qué status HTTP usarías para rechazar una request cuyo body contiene una cantidad negativa?

## Cómo ejecutar

La implementación se agregará progresivamente.

El `POST /products` lee un body JSON, valida todos los campos del producto y responde `400` ante datos inválidos. Una entrada válida se responde con `201` como producto validado; todavía no se persiste en una base de datos.

## Rutas implementadas

| Método | Ruta | Resultado |
| :--- | :--- | :--- |
| `POST` | `/products` | `201` o `400`/`409` |
| `PATCH` | `/products/:id` | `200` o `400`/`404`/`409` |
| `DELETE` | `/products/:id` | `204` o `400`/`404` |

## Criterios de cierre

Cerraremos este ejercicio cuando podamos:

1. Leer y parsear un body JSON.
2. Validar los campos obligatorios del producto (`id`, `name`, `price`, `quantity`, `slug`).
3. Rechazar datos inválidos con `400 Bad Request`.
4. Rechazar `id` o `slug` duplicados con `409 Conflict`.
5. Aceptar una entrada válida con `201 Created`.
6. Explicar por qué cada status corresponde a ese resultado.

La persistencia real, autenticación, testing automatizado y refactorización avanzada quedan para ejercicios posteriores.

Este ejercicio pertenece a fundamentos HTTP. No pretende construir una aplicación completa en Node; prepara los conceptos que luego veremos aplicados con APIs, Nitro y Nuxt.

## Validación comprobada

```text
isValidQuantity(0)  → true
isValidQuantity(-1) → false
```

Prueba HTTP adicional:

```text
POST con quantity como string → 400 Bad Request
JSON mal formado             → 400 Bad Request
quantity ausente             → 400 Bad Request
slug duplicado               → 409 Conflict
slug ausente                 → 400 Bad Request
id duplicado                 → 409 Conflict

Pruebas CRUD realizadas:

```text
POST /products      → 201 Created
PATCH /products/4   → 200 OK
DELETE /products/4  → 204 No Content
DELETE /products/4  → 404 Not Found
```
```
