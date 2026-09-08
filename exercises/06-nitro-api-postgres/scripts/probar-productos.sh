#!/usr/bin/env bash
# Ejecutar con: bash scripts/probar-productos.sh
# Nitro y PostgreSQL deben estar encendidos. Se puede cambiar la URL:
# BASE_URL=http://localhost:3001 bash scripts/probar-productos.sh
set -euo pipefail
BASE_URL="${BASE_URL:-http://localhost:3000}"
slugs=()

# Cada línea es el JSON de un producto. El servidor genera su slug.
while IFS= read -r producto; do
  respuesta=$(curl --silent --show-error --fail-with-body \
    -X POST "$BASE_URL/api/products" \
    -H 'Content-Type: application/json' \
    -d "$producto")

  # Bun lee la respuesta JSON y extrae el slug para las siguientes peticiones.
  slug=$(printf '%s' "$respuesta" | bun -e '
    const producto = await new Response(Bun.stdin.stream()).json();
    if (typeof producto.slug !== "string" || !producto.slug) throw new Error("Falta slug en la respuesta");
    process.stdout.write(producto.slug);
  ')
  slugs+=("$slug")
  printf 'Creado: %s\n' "$respuesta"
done <<'PRODUCTOS'
{"name":"Prueba Teclado","price":45.50,"quantity":10}
{"name":"Prueba Mouse","price":19.99,"quantity":20}
{"name":"Prueba Monitor","price":250,"quantity":5}
{"name":"Prueba Auriculares","price":35,"quantity":12}
{"name":"Prueba Webcam","price":49.90,"quantity":8}
{"name":"Prueba Microfono","price":75,"quantity":6}
{"name":"Prueba Cable USB","price":5.50,"quantity":50}
{"name":"Prueba Hub USB","price":24,"quantity":15}
{"name":"Prueba Soporte Laptop","price":30,"quantity":9}
{"name":"Prueba Alfombrilla","price":8.99,"quantity":25}
PRODUCTOS

# Los índices empiezan en cero: [0] es el teclado y [1] es el mouse.
# PATCH cambia solo los campos enviados. No enviamos name para conservar el slug.
curl --silent --show-error --fail-with-body -i \
  -X PATCH "$BASE_URL/api/products/${slugs[0]}" \
  -H 'Content-Type: application/json' \
  -d '{"price":39.99,"quantity":8}'

curl --silent --show-error --fail-with-body -i \
  -X PATCH "$BASE_URL/api/products/${slugs[1]}" \
  -H 'Content-Type: application/json' \
  -d '{"price":17.50,"quantity":18}'

# Borramos los productos 9 y 10 creados por esta ejecución.
# -i muestra el estado HTTP: esperamos 204, sin cuerpo.
curl --silent --show-error --fail-with-body -i \
  -X DELETE "$BASE_URL/api/products/${slugs[8]}"

curl --silent --show-error --fail-with-body -i \
  -X DELETE "$BASE_URL/api/products/${slugs[9]}"

# El listado incluirá los ocho productos de prueba restantes y los que ya existían.
curl --silent --show-error --fail-with-body "$BASE_URL/api/products"
printf '\n'
