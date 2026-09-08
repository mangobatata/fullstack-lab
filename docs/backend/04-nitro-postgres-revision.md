# Revisión de Nitro + PostgreSQL — 2026-09-07

## Objetivo

Revisar el ejercicio 06 y priorizar correcciones sin resolver el CRUD por el alumno. Estado: `Learning`.

## Razonamiento

La estructura separa handlers, pool y conversión de filas. Los valores SQL están parametrizados, incluso en PATCH: las columnas dinámicas proceden de una lista fija del código. GET individual distingue ausencia con 404; POST usa RETURNING y 201; POST/PATCH traducen conflictos de unicidad a 409.

```text
JSON --> validar forma y campos --> construir SQL parametrizado
                  |                            |
                 400                           v
                                          PostgreSQL
                                               |
                                        fila --> toProduct --> JSON
```

## Hallazgos priorizados

1. **Alta — PATCH sin campos reconocidos.** En `[slug].patch.ts:25`, `{ "color": "red" }`, `{ "slug": "otro" }`, un string no vacío o un array no vacío superan el control inicial. Ninguno aporta name, price o quantity. Se construye `UPDATE products SET WHERE slug = $1 RETURNING *`, inválido. El error no se traduce a 400. Validar forma de objeto y presencia de campos permitidos antes de consultar.
2. **Alta — números incompatibles con SQL.** POST:42 y PATCH:53 permiten `quantity: 1.5` o `2147483648`; el esquema usa INT. `price: 100000000` también pasa y excede NUMERIC(10,2). Esas entradas llegan a la BD y los errores distintos de 23505 se propagan sin traducción a 400. Validar finitud, integridad y rango según columna; definir política para decimales del precio. Fuente: [tipos numéricos de PostgreSQL](https://www.postgresql.org/docs/16/datatype-numeric.html).
3. **Funcionalidad pendiente — DELETE.** `[slug].delete.ts` está vacío. No implementa el contrato 204/404 anunciado en el README; no se afirma un estado HTTP concreto sin ejecutar Nitro.
4. **Media — URL cambia con el mismo nombre.** PATCH:71 llama generateSlug siempre que se envía name, aunque sea idéntico al persistido. El prefijo aleatorio cambia y la URL anterior deja de localizar el producto. Decidir cuándo debe cambiar el slug y conservarlo cuando no corresponda.

## Mejoras posteriores

- `queryValues: any[]` puede expresar los tipos reales `(string | number)[]`; tipar las filas en pool.query con ProductRow mejora el chequeo estático, pero no valida datos en ejecución.
- `readBody<T>` no reemplaza validación en ejecución. Omit tampoco impide que el cliente envíe slug: hoy se ignora en POST.
- Los seis caracteres hexadecimales del UUID no garantizan unicidad. La restricción UNIQUE sigue siendo necesaria; decidir cómo gestionar una colisión generada por el servidor.
- sanitizeName elimina letras acentuadas y puede dejar vacío el componente legible. Definir el contrato para nombres Unicode.
- La conversión de price concentra correctamente la adaptación al contrato JSON; para cálculos monetarios posteriores habría que acordar una representación y política de redondeo.

## Verificación

- Inicialmente `bun run typecheck` fallaba porque faltaba el script local.
- `bun x --no-install tsc --noEmit` pasó. Se agregó únicamente el script `typecheck: tsc --noEmit` y `bun run typecheck` pasó.
- Simulación en Bun de las condiciones y construcción SQL confirmó el SET vacío y la aceptación de las dos cantidades indicadas.
- Dos llamadas al generador real con Mouse devolvieron slugs distintos.
- Se leyó el esquema del ejercicio 05; no se verificó que coincida con una instancia en ejecución. No se ejecutaron peticiones HTTP ni consultas contra PostgreSQL.
- No se modificaron handlers. Se conservaron los cambios preexistentes del usuario y la rama exercise/06-nitro-api-postgres; el tema no está completado.

## Bitácora de Errores Reales

No hubo respuestas conceptuales del alumno en este turno. Los defectos observados en el código están documentados arriba; no se atribuyen al alumno razonamientos no expresados.

## Pregunta orientadora — Nivel 1

Con `PATCH { "color": "red" }`, ¿qué contendrá `setParts` al construir el UPDATE?


## Correcciones implementadas a petición del alumno

El alumno autorizó implementar las correcciones y pidió comentarios explicativos. Se conserva el estado `Learning`: implementación terminada no implica comprensión demostrada.

- Validación compartida con entrada unknown: objeto, campos permitidos, obligatoriedad en POST y presencia de al menos un campo en PATCH. Campos desconocidos, incluido slug, producen 400.
- name se normaliza con trim. quantity debe ser entero entre 0 y 2147483647. price debe ser finito entre 0 y 99999999.99 y tener hasta dos decimales; se rechazan decimales adicionales.
- PATCH usa columnas de una lista fija y parámetros tipados string | number. Conserva el slug también al renombrar, evitando enlaces rotos y sin una lectura adicional.
- Nuevos slugs usan UUID completo y nombre legible compatible con Unicode; nombres formados por símbolos usan producto como componente legible. Los existentes no se migran. UNIQUE continúa garantizando unicidad y POST mantiene 409 ante conflicto.
- DELETE realiza una sentencia parametrizada, comprueba rowCount y devuelve 204 sin cuerpo o 404.
- Consultas tipadas con ProductRow y columnas explícitas; comentarios explican validación, SQL, serialización e identidad.

```text
POST/PATCH --> JSON desconocido --> validación compartida --error--> 400
                                          |
                                          v
                              SQL con valores parametrizados
                                          |
                                    fila --> JSON

DELETE --> SQL --> rowCount = 0 --> 404
                  rowCount = 1 --> 204 sin cuerpo
```

Verificación: bun run typecheck pasa; bun test pasa con 23 pruebas y 54 aserciones; bun run build pasa. Nitro avisa que no resuelve pg-native durante el trazado, pero genera el servidor. Las pruebas ejercitan HTTP en proceso con PostgreSQL simulado; no se ha comprobado una instancia real. No se modificaron los datos de PostgreSQL ni los cambios previos de otros ejercicios.

### Bitácora de Errores Reales — implementación

No hubo una nueva respuesta conceptual del alumno; no se agregan errores atribuidos a él. Los hallazgos originales se conservan como historial y quedan corregidos según lo descrito arriba.


## Restauración solicitada — 2026-09-08

Objetivo: volver a la implementación anterior porque el alumno considera las correcciones demasiado complejas para su nivel. Se restauraron los handlers y el generador de slug anteriores con comentarios sencillos, además del contrato ProductInput original. Se retiraron del ejercicio la validación compartida y las pruebas añadidas; se conserva el script typecheck. DELETE vuelve a quedar pendiente y los hallazgos iniciales vuelven a estar abiertos.

```text
petición --> handler con validación local --> SQL --> filas --> JSON
```

Verificación: bun run typecheck pasa. No se hicieron consultas contra PostgreSQL. Estado: Learning.

### Bitácora de Errores Reales

El alumno señaló que la implementación del asistente era difícil para un principiante. Se corrige el enfoque de enseñanza recuperando su estructura previa y explicándola con comentarios. No se atribuye al alumno ningún error conceptual nuevo.


## DELETE implementado — 2026-09-08

Objetivo: completar el borrado manteniendo el estilo sencillo de los handlers anteriores. A petición explícita del alumno se implementa la ruta con comentarios y se preparan todos los cambios pendientes para commit y push.

El handler lee el slug, comprueba que no esté vacío y ejecuta DELETE con WHERE slug = $1. El valor se envía separado del SQL. rowCount permite saber si se borró una fila sin hacer un SELECT previo.

```text
DELETE /api/products/:slug --> validar slug --> DELETE con WHERE
                                                   |
                                     rowCount = 0 --> 404
                                     rowCount = 1 --> 204 sin cuerpo
```

Verificación: bun run typecheck y bun run build pasan. Se comprueban HTTP 204 sin cuerpo, parámetros SQL y HTTP 404 con PostgreSQL simulado mediante un script temporal; no se borraron datos reales. Estado de aprendizaje: Learning. Las limitaciones de POST/PATCH documentadas siguen pendientes.

### Bitácora de Errores Reales

No hubo un nuevo intento conceptual del alumno; no se registran errores suyos en este turno.


## Siguiente práctica: persistencia real — 2026-09-08

Objetivo: comprobar la API contra PostgreSQL real antes de avanzar de tema. Estado: Learning. Se propone crear un producto de prueba, guardar su slug, reiniciar solo Nitro y consultarlo por GET; después practicar PATCH y DELETE sobre ese producto. La comprobación previa de DELETE usó una base simulada, por lo que todavía falta esta evidencia.

```text
POST --> PostgreSQL --> reiniciar Nitro --> GET por el mismo slug
```

Pregunta orientadora: si creamos un producto y reiniciamos solo Nitro, ¿esperás que GET por su slug lo encuentre y por qué?

### Bitácora de Errores Reales

No hay una nueva respuesta conceptual del alumno. Práctica propuesta, todavía no ejecutada.


### Peticiones curl preparadas — 2026-09-08

Objetivo: practicar creación, actualización y borrado con datos de prueba. El alumno pidió los curl para crear diez productos, actualizar dos y eliminar dos. Se preparó exercises/06-nitro-api-postgres/scripts/probar-productos.sh: usa curl y Bun para extraer los slugs generados por POST. PATCH modifica precio y cantidad de los dos primeros; DELETE elimina los dos últimos del lote. Cada ejecución crea un lote nuevo.

```text
10 POST --> guardar slugs --> 2 PATCH --> 2 DELETE --> GET listado
```

Sintaxis comprobada con bash -n. No se ejecutaron las peticiones ni se comprobó todavía PostgreSQL real. No hay nuevos errores conceptuales del alumno.
