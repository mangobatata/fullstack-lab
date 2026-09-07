# Revisión del CRUD Nitro — 2026-09-07

## Objetivo

Detectar fallos que aparecen al combinar operaciones del CRUD antes de avanzar a persistencia. Estado: `Learning`.

## Razonamiento

Una operación puede funcionar aisladamente y romper una condición del catálogo después de otra operación. La primera revisión se centra en conservar identificadores únicos.

```text
catálogo inicial
      |
      v
DELETE de un producto intermedio
      |
      v
POST con slug nuevo
      |
      v
comparar los IDs de todos los productos
```

## Hallazgos de revisión

- `index.post.ts` asigna `id: products.length + 1`. Una simulación sobre una copia del catálogo confirmó una colisión al borrar el producto intermedio y crear otro. Pendiente: razonamiento y propuesta del alumno.
- `[slug].patch.ts` comprueba que el body tenga claves, pero no exige que contenga un campo reconocido: `{ "color": "red" }` llega al retorno sin modificar campos. Pendiente: decidir el contrato para campos desconocidos y revisar la forma del body.
- POST y PATCH aceptan cantidades fraccionarias según sus condiciones actuales. Pendiente: definir si el inventario representa unidades enteras.

Los hallazgos anteriores provienen de lectura del código; la colisión de IDs se reprodujo ejecutando la misma lógica sobre una copia, sin modificar los datos del ejercicio. No se ejecutaron nuevas pruebas HTTP en esta revisión.

## Verificación de tipos

- Raíz: `bun run typecheck` falla con cinco errores TS5097 por imports terminados en `.ts` sin `allowImportingTsExtensions`.
- Dentro de `exercises/04-nitro-api`: `bun x --no-install tsc --noEmit` pasa con su configuración propia.
- Pendiente: armonizar el chequeo de tipos del laboratorio y el subproyecto. No se corrigió código durante esta revisión para preservar el intento del alumno.

## Primera pregunta — Nivel 1

Partiendo de IDs `1, 2, 3`, si eliminas el producto `2` y luego creas otro, ¿qué ID asigna `products.length + 1` y qué problema produce en el catálogo?

## Bitácora de Errores Reales

- El alumno atribuyó el problema a que los IDs dejarían de ser correlativos, proponiendo `1, 3, 5`. Corrección conceptual: los huecos tras un borrado son válidos; la condición que queremos conservar es que los productos existentes tengan IDs distintos. `length` cuenta elementos, no representa el último ID creado.
- Ante el seguimiento, el alumno propuso usar UUID y dejar de derivar el ID del tamaño del array. La propuesta separa la identidad del producto de la cantidad de elementos. No respondió explícitamente el cálculo: con dos productos, `2 + 1` genera `3`, que ya existe.

```text
IDs [1, 2, 3] -- borrar ID 2 --> IDs [1, 3]
                                      |
                                      v
                            contar elementos
                                      |
                                      v
                           sumar 1 y comparar
```

## Propuesta del alumno: UUID

UUID es una opción adecuada para este catálogo: permite generar identificadores sin depender del tamaño del array, con una probabilidad de colisión extremadamente baja. No es necesario que los IDs sean consecutivos.

El alumno implementó `Product.id: string`, `crypto.randomUUID()` en los tres productos iniciales y en POST. Los archivos del repositorio coinciden con su propuesta. El ID ya no depende de la cantidad de productos.

```text
generar UUID (texto) --> Product.id --> catálogo --> respuesta al cliente
```

La pregunta sobre el contrato quedó resuelta con la implementación del alumno. Estado de esta habilidad: `Practiced`.

Verificación tras el cambio: el chequeo local `bun x --no-install tsc --noEmit` pasa. `bun run typecheck` desde la raíz sigue fallando con los mismos cinco TS5097 previamente registrados. No se ejecutaron pruebas HTTP nuevas ni se modificó la configuración.

El alumno explicó correctamente que `wireless-mouse` no conserva su UUID tras reiniciar: la lista inicial vuelve a ejecutar `crypto.randomUUID()` y no hay almacenamiento persistente. Identificó la expresión concreta responsable en `data/api.ts`.

Precisión conceptual: la base de datos es una opción de persistencia, pero también podría usarse un archivo. Lo determinante es guardar el dato fuera de la memoria del proceso y recuperarlo al iniciar. La generación ocurre al evaluar el módulo que inicializa la colección, no en cada GET.

```text
iniciar proceso --> evaluar data/api.ts --> productos con nuevos UUID
                                              |
                                              v
                                     cambios en memoria
                                              |
                                              v
                                      detener proceso
                                              |
                                              v
reiniciar --> evaluar data/api.ts de nuevo --> catálogo inicial
```

El alumno reportó que crear un producto sin reiniciar conserva los UUID anteriores, y que al reiniciar «todo se hace con un nuevo uuid». La primera observación es correcta. La segunda necesita distinguir dos casos: los tres productos declarados en `data/api.ts` se reconstruyen con UUID nuevos; el cuarto producto creado por POST desaparece porque `products.push()` solo modificó el array en memoria y no el archivo fuente.

```text
data/api.ts: 3 productos --> iniciar --> 3 productos en memoria
                                             |
                                             v
                                      POST: ahora hay 4
                                             |
                                             v
reiniciar --> leer data/api.ts --> 3 productos con nuevos UUID
                                  el creado por POST no se recupera
```

Comprobación del alumno: después de reiniciar y consultar la colección, `usb-hub` ya no aparece. Esto confirma la pérdida del producto creado por POST y completa esta práctica de memoria frente a persistencia. Estado: `Practiced`.

El alumno propuso guardar los productos en PostgreSQL. Identificó correctamente la escritura persistente como parte de la solución. PostgreSQL queda como propuesta de almacenamiento; aún no se ha implementado su integración.

Falta completar el razonamiento sobre lectura: guardar los datos no basta si `GET /api/products` continúa devolviendo únicamente el array inicial de `data/api.ts`.

```text
POST --> guardar producto en PostgreSQL
                           |
                     reinicio de API
                           |
                           v
GET  <-- recuperar productos guardados (por diseñar)
```

Pregunta pendiente: si POST guarda en PostgreSQL pero GET sigue devolviendo el array de `data/api.ts`, ¿qué habría que cambiar para que GET muestre los productos guardados tras un reinicio?

### Bitácora de Errores Reales — persistencia

La formulación «todo se hace con un nuevo uuid» generaliza la reconstrucción de los datos iniciales al catálogo completo. Corrección: reiniciar vuelve a ejecutar las declaraciones del archivo; no reproduce las peticiones POST anteriores. El alumno sí identificó correctamente que los UUID existentes permanecen iguales durante la creación de otro producto en el mismo proceso.

No se observaron nuevos errores en la implementación presentada por el alumno.
