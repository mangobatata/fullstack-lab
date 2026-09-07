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

- [Revisión del CRUD y primera pregunta](../../docs/backend/03-nitro-revision-crud.md).

## Estado actual de la tutoría — revisión 2026-09-07

El alcance inicial de GET ya fue superado: existen GET de colección y por slug, POST, PATCH y DELETE. Las notas siguientes conservan el historial de la primera retoma.

Retomamos en `Learning` la robustez del CRUD en la rama `exercise/04-nitro-api-review`. Primer caso: partir de IDs `1, 2, 3`, borrar el producto `2` y crear otro con slug nuevo. Antes de editar el código, anticipar el ID calculado por `products.length + 1` y su efecto en el catálogo.

Requisito trabajado: conservar IDs únicos entre los productos existentes, sin derivarlos de la longitud del array.

El alumno implementó `Product.id: string` y `crypto.randomUUID()` tanto en los productos iniciales como en POST. El chequeo local de tipos pasa tras el cambio. Explicó correctamente que al reiniciar se regeneran los UUID de los productos iniciales e identificó la expresión responsable. Siguiente paso: anticipar qué ocurre con un cuarto producto creado por POST tras reiniciar.

Verificación de esta revisión: el chequeo local de Nitro pasa con `bun x --no-install tsc --noEmit`; `bun run typecheck` desde la raíz falla con TS5097 por imports `.ts`. No se hicieron nuevas pruebas HTTP.

## Retoma — 2026-09-07

El handler está implementado en `server/api/products/index.get.ts` e importa
la colección desde `data/api.ts`. La rama está en estado `Learning` para Nitro.
El build se comprobó en la sesión anterior; falta registrar una prueba HTTP del endpoint.

Próximo paso: ejecutar el servidor desde este ejercicio con `bun run dev` y
consultar `GET /api/products` en el puerto que indique la terminal.
Antes de probar, anticipar qué status y body debería recibir el cliente.

No se registraron nuevos errores del alumno en esta retoma.

## Prueba HTTP — 2026-09-07

### Crear un cuarto producto para probar el reinicio

Con el servidor ejecutándose (`bun run dev` desde este ejercicio), usa otra terminal. Si el servidor indica un puerto diferente, sustituye `3000`.

```bash
curl -i http://localhost:3000/api/products \
  -H 'Content-Type: application/json' \
  --data '{"name":"USB Hub","price":24.99,"quantity":5,"slug":"usb-hub"}'
```

`--data` hace que curl envíe POST. Resultado esperado: `201` y el producto con su UUID generado por el servidor. Si el slug ya existe, el handler responde `409`. Comando preparado para el alumno; aún no se ha registrado su resultado ni el de reiniciar el servidor.

El alumno reportó la creación y que los UUID anteriores se conservan mientras el servidor sigue activo. Tras reiniciar, reportó UUID nuevos. Falta comprobar específicamente si `usb-hub` sigue en la colección:

```bash
curl -i http://localhost:3000/api/products
```

El código reconstruye los tres productos iniciales al iniciar; el producto añadido por POST solo existía en memoria. El alumno confirmó que `usb-hub` ya no aparece después del reinicio. Práctica de memoria y persistencia registrada como `Practiced`.

El alumno propone PostgreSQL para guardar los productos. Antes de integrar la base de datos, queda por razonar cómo GET recuperará esos productos en lugar de devolver únicamente el array inicial. No hay integración implementada todavía.

### Consulta de colección registrada previamente

```bash
curl -i http://localhost:3000/api/products
```

Respuesta: `HTTP/1.1 200` + `content-type: application/json` + array de 3 productos.
Confirma la hipótesis: el handler retorna `Product[]` y Nitro serializa a HTTP.


- [Nitro oficial](https://nitro.build/)
- [Repositorio de aprendizaje](../../README.md)
