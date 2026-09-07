# PostgreSQL: persistir el catálogo

## Objetivo

Continuar la tutoría creando una base de datos PostgreSQL para el catálogo de Nitro. Estado: `Learning`. El alumno solicitó avanzar a este paso tras comprobar la pérdida de un producto al reiniciar la API.

## Razonamiento

La integración debe cubrir tanto guardar como consultar productos. Empezaremos por la base de datos y SQL antes de conectar los handlers.

```text
cliente --> API Nitro --> PostgreSQL
                |              |
           se reinicia    conserva productos
                |              |
                +-- consulta --+
```

## Secuencia de trabajo

1. Identificar la instancia PostgreSQL que se usará y comprobar la conexión.
2. Crear una base de datos dedicada al laboratorio.
3. Razonar el diseño de la tabla `products`, sus tipos y restricciones.
4. Insertar y consultar un producto con SQL.
5. Conectar POST y GET de Nitro y repetir la prueba de reinicio.

## Entorno observado

Actualización: Docker ya responde. El alumno implementó `docker-compose.yml`; se verificó `db` en estado `healthy`, usando `postgres:18-alpine`, volumen `postgres_data` y puerto local **5433**, dirigido al **5432** interno. La base configurada es `fullstack_lab` y el usuario `lab`. Siguiente paso: conectar con `psql` desde WSL y comprobar `\conninfo`. Esta verificación de estado no sustituye comprobar una conexión autenticada.

```text
psql en WSL --> 127.0.0.1:5433 --> contenedor db:5432
```

Las observaciones siguientes corresponden a la revisión inicial, antes de que el alumno levantara Docker:

- El cliente `psql` está disponible en `/usr/bin/psql`.
- `pg_isready` no obtuvo respuesta en `/var/run/postgresql:5432`. Esto no descarta una instancia en Windows, otro puerto o un servidor remoto.
- El comando de Docker informa que no está disponible en esta distribución WSL y menciona la integración de Docker Desktop.
- No se ha creado ninguna base de datos ni modificado un servicio. Pendiente identificar dónde quiere ejecutar PostgreSQL el alumno; no solicitar contraseñas en el chat.

## Bitácora de Errores Reales

No se registraron nuevos errores del alumno. La práctica anterior confirmó correctamente que los productos creados en memoria desaparecen al reiniciar la API.

## Conexión confirmada y diseño de tabla

El alumno ejecutó `\conninfo` y compartió la conexión a `fullstack_lab` como usuario `lab`, host `127.0.0.1`, puerto `5433`. La conexión autenticada desde su terminal queda confirmada. Estado de conexión con `psql`: `Practiced`.

Siguiente objetivo: trasladar el contrato `Product` a una tabla `products`. Cada fila representará un producto y cada columna una propiedad: `id`, `name`, `price`, `quantity`, `slug`. Todavía no se ha ejecutado `CREATE TABLE`.

```text
Product en TypeScript          tabla products
---------------------          --------------
un objeto                -->   una fila
propiedades del objeto   -->   columnas
id del producto          -->   identificador de la fila
```

El alumno identificó correctamente que `id` debe ser único para impedir duplicados. Falta razonar el caso de un identificador ausente antes de introducir la definición SQL de la clave primaria.

Pregunta de seguimiento: además de impedir duplicados, ¿permitirías guardar un producto sin `id` (`NULL`), y por qué? No se registra un error: la respuesta sobre unicidad es correcta, pero aún no aborda la ausencia del identificador.

## Fundamentos desde cero: tablas, filas y columnas

El alumno aclaró que no tiene conocimientos previos de bases de datos. Se ajusta la tutoría: explicar cada concepto antes de pedir razonamiento sobre él. La pregunta anterior se adelantó a esa explicación; no se atribuye al alumno un error por desconocer el tema.

Una tabla organiza datos en filas y columnas. En `products`, cada fila representa un producto y cada columna una característica. `NULL` representa la ausencia de un valor; no equivale a cero ni a un texto vacío. Una clave primaria (`PRIMARY KEY`) exige valores únicos y no nulos; en este catálogo se aplicará a `id`.

```text
             columnas
        id | name    | price
        ---+---------+------
fila --> 1 | Mouse   | 29.99
fila --> 2 | Teclado | 89.50
```

Los IDs numéricos del ejemplo solo simplifican la explicación. El catálogo real conserva la elección de UUID.

El alumno respondió correctamente que hay dos productos guardados y que cada uno tiene un ID diferente. Reconoce filas como productos y distingue sus identificadores. No se han practicado aún sentencias SQL.

Siguiente paso: explicar que cada columna tiene un tipo de dato y usar `quantity` para introducir cantidades enteras. Pregunta orientadora: si el inventario cuenta teclados individuales, ¿tendría sentido guardar una cantidad de `2.5` teclados?

### Cantidad de inventario: enteros y el caso cero

El alumno respondió que no tiene sentido una cantidad de `2.5` teclados y propuso «un entero positivo». Identificó correctamente la necesidad de unidades enteras. Falta precisar si incluye el cero: en sentido estricto, positivo significa mayor que cero, mientras que no negativo incluye cero.

```text
entero positivo:    1, 2, 3, ...
entero no negativo: 0, 1, 2, 3, ...
                   |
                   +--> caso a razonar: producto sin stock
```

Pregunta de seguimiento: si el producto sigue en el catálogo pero se vende la última unidad, ¿qué valor debería guardar `quantity`? Pendiente de respuesta antes de definir su restricción SQL.

El alumno respondió correctamente `0`. Queda precisada la regla: `quantity` debe ser un entero no negativo, con valor obligatorio.

### Expresar la regla en SQL

Este fragmento se utilizará dentro de la futura definición de la tabla; no es una sentencia para ejecutar por separado:

```sql
quantity INTEGER NOT NULL CHECK (quantity >= 0)
```

- `INTEGER`: almacena números enteros.
- `NOT NULL`: exige que haya un valor; cero sí es un valor.
- `CHECK (quantity >= 0)`: exige que el valor sea cero o mayor.

```text
quantity --> entero --> valor presente --> mayor o igual a 0
```

Siguiente comprobación de comprensión: identificar qué parte del fragmento impide guardar `-3`. No se ha ejecutado SQL ni creado la tabla.

El alumno identificó correctamente `CHECK` como la restricción que rechaza `-3`: la condición `quantity >= 0` resulta falsa. La comprensión es conceptual; su ejecución en PostgreSQL sigue pendiente.

Siguiente campo: `name`. Se introduce `TEXT` para almacenar texto y se reutiliza `NOT NULL` para exigir un valor presente. Pregunta: escribir la definición de la columna `name` con texto obligatorio, siguiendo la estructura `nombre TIPO RESTRICCIÓN`. No se ha introducido todavía una regla para rechazar texto vacío: `NOT NULL` por sí solo no lo rechaza.

El alumno escribió correctamente `name TEXT NOT NULL`. Aplicó la estructura de definición y la restricción de presencia a otra columna, sin recibir la línea completa.

### Presencia frente a texto vacío

`NULL` significa ausencia de valor; `''` es un texto existente de longitud cero. Por ello `NOT NULL` rechaza el primero, pero permite el segundo. No se ha añadido todavía una restricción de contenido al nombre.

```text
name TEXT NOT NULL
        |
        +--> NULL      rechazado: falta valor
        +--> ''        permitido: texto vacío
        +--> 'Mouse'   permitido: texto con contenido
```

Siguiente pregunta: para el catálogo, ¿deberíamos aceptar un producto cuyo nombre sea `''`? Pendiente de decisión del alumno antes de construir su CHECK. Sin nuevos errores registrados.

El alumno decidió correctamente rechazar nombres vacíos y expresó que todo producto debe tener precio, cantidad y nombre. Se distingue presencia de contenido: `NOT NULL` exige un valor; un `CHECK` adicional puede exigir contenido en el nombre. El cero sigue siendo válido para cantidad.

Se introduce esta expresión SQL de comparación:

```sql
name <> ''
```

`<>` significa «distinto de». La expresión es verdadera para `'Mouse'` y falsa para `''`. Siguiente intento: añadir un `CHECK` con esta condición a `name TEXT NOT NULL`. No se entrega todavía la definición completa. Los nombres compuestos solo por espacios quedan para una revisión posterior: esta condición no los rechaza.

### Bitácora de Errores Reales — sintaxis de CHECK

El alumno escribió `name TEXT NOT NULL CHECK <> ''`. Eligió la restricción y el operador adecuados, pero faltaron los paréntesis y la columna que se compara. `CHECK` recibe una condición completa entre paréntesis; no toma implícitamente la columna declarada antes.

Corrección guiada tras su intento:

```sql
name TEXT NOT NULL CHECK (name <> '')
```

```text
CHECK (name <> '')
       |    |  |
       |    |  +--> valor con el que se compara
       |    +-----> distinto de
       +----------> columna evaluada
```

Esta definición rechaza NULL y texto vacío. Siguiente pregunta: si `name` contiene solo tres espacios (`'   '`), ¿cumple la condición `name <> ''`? Pendiente de razonamiento; aún no se ejecutó SQL.

Referencia: [Restricciones en PostgreSQL](https://www.postgresql.org/docs/current/ddl-constraints.html).

Bitácora: no se asume que el alumno quiera rechazar cero; se aclara el alcance de «positivo» mediante un caso concreto. La elección de enteros es correcta.

## Entorno elegido y acceso a datos

Se preparó el [ejercicio 05](../../exercises/05-postgres-productos/README.md) para que el alumno construya su configuración Compose: comprobar Docker en WSL, usar PostgreSQL 18 con un volumen nombrado y conectar con `psql`. La ejecución está pendiente.

```text
psql en WSL --> puerto local 5432 --> PostgreSQL en contenedor
                                             |
                                             v
                                    volumen postgres_data
```

Pregunta actual: explicar qué función tiene el volumen al recrear el contenedor. Fuentes de infraestructura: [Docker y WSL](https://docs.docker.com/desktop/features/wsl/) e [imagen oficial PostgreSQL](https://hub.docker.com/_/postgres).

El alumno eligió instalar PostgreSQL con Docker para este ejercicio. La instalación queda a su cargo; todavía no se ha confirmado la conexión desde WSL.

Ante su pregunta sobre Prisma, Drizzle o acceso directo, la recomendación pedagógica es comenzar con SQL mediante `psql`: crear la tabla, definir clave primaria y restricciones, insertar y consultar datos. Después conectaremos Nitro mediante consultas parametrizadas. Esto permite entender el contrato de la base antes de añadir un ORM.

```text
PostgreSQL en Docker --> SQL con psql --> SQL desde Nitro --> evaluar ORM
```

Drizzle ofrece esquemas TypeScript y consultas cercanas a SQL, por lo que se propone como siguiente paso tras los fundamentos. Prisma también es una opción válida para trabajar con modelos, consultas tipadas y migraciones. La preferencia por Drizzle en esta secuencia es una decisión pedagógica, no una afirmación de superioridad general.

No hace falta dominar todo SQL para avanzar: empezaremos con el CRUD del catálogo y sus restricciones, y ampliaremos a relaciones, JOIN y transacciones cuando el ejercicio lo requiera. No se ha instalado ningún ORM.

Fuentes oficiales consultadas:
- [Tutorial PostgreSQL: conceptos relacionales y SQL](https://www.postgresql.org/docs/current/tutorial.html).
- [Drizzle: esquemas TypeScript y API de consultas](https://orm.drizzle.team/docs/overview).
- [Prisma ORM](https://www.prisma.io/orm).

## Columna name con btrim (2026-09-07)

Verificado en vivo: `SELECT btrim('   ') <> '';` → `f`. Definición acordada: `name TEXT NOT NULL CHECK (btrim(name) <> '')`. Rechaza `NULL`, `''` y solo-espacios.

## Columna price exacta (2026-09-07)

Verificado: `SELECT 0.1::float + 0.2::float;` → `0.30000000000000004`. Definición: `price NUMERIC(10,2) NOT NULL CHECK (price >= 0)`. El alumno corrigió primero un CHECK invertido (`price < 0` rechazaba precios válidos).

## SELECT por slug (2026-09-07)

El alumno construyó por razonamiento: `SELECT id, name, price, quantity, slug FROM products WHERE slug = '...';`. Verificado: devuelve 1 fila (id 2). Equivale al `find` del GET :slug.

## CHECK enforced + secuencia sin hueco (2026-09-07)

`INSERT quantity -3` → `ERROR violates check constraint products_quantity_check`, fila rechazada. `count(*)` = 4. Un INSERT válido posterior recibió `id 5` (`RETURNING id`), sin hueco de secuencia en este caso. Fila de prueba eliminada para dejar el seed limpio.
