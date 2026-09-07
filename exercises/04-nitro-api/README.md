# Ejercicio 04: Repetir la API con Nitro

## Objetivo

Repetir una parte de la API de productos usando routing por archivos de Nitro y comparar cada abstracción con el servidor manual de `node:http`.

## Qué cambia

```text
node:http: createServer + pathname + writeHead + end
Nitro:    archivo de ruta + handler(event) + retorno de datos
```

## Alcance inicial

Comenzaremos únicamente con `GET /api/products`. No construiremos todo el CRUD de una vez.

## Pregunta orientadora

Si Nitro registra una ruta a partir del nombre de un archivo, ¿qué nombre tendría el archivo para representar `GET /api/products`?

## Documentación

## Retoma — 2026-09-07

El handler está implementado en `server/api/products/index.get.ts` e importa
la colección desde `data/api.ts`. La rama está en estado `Learning` para Nitro.
El build se comprobó en la sesión anterior; falta registrar una prueba HTTP del endpoint.

Próximo paso: ejecutar el servidor desde este ejercicio con `bun run dev` y
consultar `GET /api/products` en el puerto que indique la terminal.
Antes de probar, anticipar qué status y body debería recibir el cliente.

No se registraron nuevos errores del alumno en esta retoma.

## Prueba HTTP — 2026-09-07

```bash
curl -i http://localhost:3000/api/products
```

Respuesta: `HTTP/1.1 200` + `content-type: application/json` + array de 3 productos.
Confirma la hipótesis: el handler retorna `Product[]` y Nitro serializa a HTTP.


- [Nitro oficial](https://nitro.build/)
- [Repositorio de aprendizaje](../../README.md)
