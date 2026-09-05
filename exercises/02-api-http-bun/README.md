# Ejercicio 02: API HTTP mínima con Bun

## Objetivo

Crear un servidor HTTP mínimo que exponga el catálogo de productos en memoria.

El runtime será Bun, pero la API HTTP utilizada será `node:http`.

## Contrato inicial

```http
GET /products
```

Respuesta esperada: `200 OK` con la lista de productos serializada como JSON.

## Pregunta orientadora

¿Qué información debe inspeccionar el servidor de cada request para decidir si corresponde a `GET /products`?

## Cómo ejecutar

```bash
bun run ex02
```
