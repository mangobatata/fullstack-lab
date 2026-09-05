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

- [Nitro oficial](https://nitro.build/)
- [Repositorio de aprendizaje](../../README.md)
