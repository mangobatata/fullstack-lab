# Ejercicio 05 — PostgreSQL y persistencia

## Objetivo

Levantar PostgreSQL con Docker Compose, practicar SQL y después integrar el catálogo de Nitro. Estado: `Learning`. Rama: `foundation/05-sql-postgres`.

## Paso 1: comprobar Docker desde WSL

En Docker Desktop, activar la distribución en **Settings > Resources > WSL Integration** y aplicar los cambios. Desde la terminal WSL:

```bash
docker version
docker compose version
```

El primer comando debe mostrar Client y Server sin error de conexión. Si falla, resolver primero esa conexión.

## Paso 2: preparar Compose — intento del alumno

Crear `compose.yaml` en esta carpeta con estos requisitos:

- Servicio llamado `db`, imagen `postgres:18`.
- Base inicial `fullstack_lab`, usuario `lab` y contraseña para desarrollo local mediante `POSTGRES_DB`, `POSTGRES_USER` y `POSTGRES_PASSWORD`.
- Publicar `127.0.0.1:5432:5432` para conectar desde la terminal local.
- Volumen nombrado `postgres_data`, montado en `/var/lib/postgresql` para esta versión de la imagen.
- Declarar el volumen también en la sección superior `volumes` del documento Compose.

No hay una solución Compose implementada todavía: el alumno construirá su primer intento. Las variables de inicialización se aplican al inicializar un directorio de datos vacío.

## Pregunta orientadora

¿Qué función cumplirá el volumen si eliminamos y volvemos a crear el contenedor?

## Paso 3: validar y arrancar cuando el archivo esté listo

Desde esta carpeta:

```bash
docker compose config --quiet
docker compose up -d
docker compose ps
docker compose exec db pg_isready -U lab -d fullstack_lab
```

Cuando PostgreSQL acepte conexiones:

```bash
psql -h 127.0.0.1 -p 5433 -U lab -d fullstack_lab
```

`psql` pedirá la contraseña elegida. Usa `\conninfo` para comprobar la conexión y `\q` para salir. Todavía no crear la tabla: primero razonaremos los tipos y restricciones.

## Criterios de avance

- Docker accesible desde WSL y conexión a `fullstack_lab` confirmada.
- Explicar contenedor frente a volumen.
- Diseñar la tabla, practicar INSERT y SELECT, y luego conectar Nitro con consultas parametrizadas.

Esta etapa prepara infraestructura y SQL. El código TypeScript y sus scripts Bun se añadirán en la etapa de conexión, después del razonamiento del alumno.

## Registro

El alumno creó `docker-compose.yml` y levantó PostgreSQL. `docker compose ps` confirmó el servicio `db` con imagen `postgres:18-alpine`, estado `healthy` y publicación `127.0.0.1:5433->5432/tcp`. El Compose usa variables de entorno y un volumen nombrado en `/var/lib/postgresql`. El puerto elegido por el alumno, 5433, sustituye el 5432 de los requisitos iniciales para la conexión desde WSL.

El alumno ejecutó `\conninfo` y confirmó conexión a `fullstack_lab` como `lab`, en `127.0.0.1:5433`. Todavía no se creó la tabla. Sin nuevos errores registrados.

## Diseño de products — siguiente paso

Cada fila representará un producto, con columnas `id`, `name`, `price`, `quantity` y `slug`. Antes de escribir `CREATE TABLE`, razonar qué debe impedir la base respecto a IDs repetidos o ausentes para identificar cada fila inequívocamente. Definición SQL pendiente del intento del alumno.

El alumno identificó la unicidad del ID como requisito para evitar duplicados. Siguiente pregunta: decidir si se permite un producto sin ID (`NULL`) y justificarlo.

Se retomaron los fundamentos desde cero a petición del alumno: tabla, fila, columna, NULL y clave primaria. Identificó correctamente dos filas como dos productos con IDs diferentes. Antes de escribir SQL, introduciremos los tipos de columnas con `quantity`, que representa un conteo de unidades individuales.

El alumno eligió enteros para `quantity` y los describió como positivos. Siguiente caso a razonar: vender la última unidad de un producto que permanece en el catálogo, para decidir si se permite cero. Restricción SQL todavía pendiente.

El alumno confirmó que sin stock corresponde `0`. Se introdujo el fragmento `quantity INTEGER NOT NULL CHECK (quantity >= 0)` para la futura tabla y se explicó cada parte. Pendiente identificar qué parte rechaza `-3`; aún no ejecutar el fragmento aislado ni crear la tabla.

El alumno identificó correctamente `CHECK` para rechazar cantidades negativas. Siguiente intento: escribir la columna `name` usando `TEXT` y la restricción aprendida para impedir `NULL`. Todavía no se ejecutó SQL.

El alumno escribió correctamente `name TEXT NOT NULL`. Se explica que `NOT NULL` no rechaza `''`; siguiente decisión: si el catálogo debe aceptar nombres vacíos. La tabla todavía no se ha creado.

El alumno decidió que no se aceptan nombres vacíos. Se introduce `<>` (distinto de) y la expresión `name <> ''`. Siguiente intento: incorporar esa condición mediante CHECK a su definición de `name`. El caso de nombres formados solo por espacios queda pendiente.

Intento recibido: `name TEXT NOT NULL CHECK <> ''`. Se corrigió de forma guiada a `name TEXT NOT NULL CHECK (name <> '')`: CHECK necesita una condición completa entre paréntesis. Siguiente caso: evaluar un nombre formado solo por tres espacios. No se creó todavía la tabla.

## Referencias

- [Docker Desktop y WSL](https://docs.docker.com/desktop/features/wsl/).
- [Imagen oficial PostgreSQL](https://hub.docker.com/_/postgres).
- [Notas de tutoría](../../docs/databases/01-postgres-productos.md).
