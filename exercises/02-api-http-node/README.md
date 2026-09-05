# Ejercicio 02: API HTTP mínima con Bun

## Objetivo

Crear un servidor HTTP mínimo que exponga el catálogo de productos en memoria.

El runtime será Bun, pero la API HTTP utilizada será `node:http`.

## Contrato inicial

```http
GET /products
```

Respuesta esperada: `200 OK` con la lista de productos serializada como JSON.

## Rutas implementadas

| Método | Ruta | Resultado |
| :--- | :--- | :--- |
| `GET` | `/products` | `200` + lista JSON |
| `GET` | `/products/:slug` | `200` + producto JSON |
| `GET` | `/products/:slug` inexistente | `404` + error JSON |
| otro método | `/products...` | `405` + error JSON |
| cualquier otra ruta | — | `404` + error JSON |

La implementación y el razonamiento de la sesión están registrados en [`docs/http/01-modelo-cliente-servidor.md`](../../docs/http/01-modelo-cliente-servidor.md).

## Pregunta orientadora

¿Qué información debe inspeccionar el servidor de cada request para decidir si corresponde a `GET /products`?

## Cómo ejecutar

```bash
bun run ex02
```
