// Ejercicio 02 — API HTTP mínima con Bun
// Ejecutar con: bun run ex02

import { createServer, ServerResponse } from "node:http";
import { findProductBySlug, products } from "../01-modelado-productos/index";

function sendJSON(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// Crear aquí el servidor HTTP y manejar GET /products.
const server = createServer((req, res) => {
  const method = req.method;

  // Manejo seguro de la URL y extracción de segmentos
  const pathname = new URL(req.url ?? "", "http://localhost").pathname;
  const segments = pathname.split("/"); // ["", "products", "wireless-mouse"]
  const baseRoute = segments[1]; // "products"
  const slug = segments[2]; // "wireless-mouse"

  if (baseRoute === "products" && method !== "GET") {
    sendJSON(res, 405, { error: "Método no permitido" });
    return;
  }

  // 1. GET /products (Listar todos los productos)
  if (method === "GET" && pathname === "/products") {
    sendJSON(res, 200, products);
    return;
  }

  // 2. GET /products/:slug (Buscar un producto específico por su slug)
  if (
    method === "GET" &&
    baseRoute === "products" &&
    slug &&
    segments.length === 3
  ) {
    const product = findProductBySlug(products, slug);

    if (!product) {
      sendJSON(res, 404, {
        error: `Producto con slug '${slug}' no encontrado`,
      });
      return;
    }

    sendJSON(res, 200, product);
    return;
  }

  // 3. Caso por defecto: Ruta no encontrada
  sendJSON(res, 404, { error: "Ruta no encontrada" });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Servidor HTTP corriendo en http://localhost:${PORT}`);
});
