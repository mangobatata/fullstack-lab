// Ejercicio 03 — CRUD HTTP mínimo en memoria con Node
// Ejecutar con: bun run ex03

import { createServer } from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Product } from "../01-modelado-productos";
import { findProductBySlug, products } from "../01-modelado-productos";
import { findProductById, validateProductInput } from "./utils";

function sendJSON(res: ServerResponse, status: number, data: unknown): void {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function readJSON(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function getId(pathname: string): number | undefined {
  const segments = pathname.split("/");

  if (segments.length !== 3 || segments[1] !== "products") {
    return undefined;
  }

  const id = Number(segments[2]);
  return Number.isInteger(id) && id > 0 ? id : undefined;
}

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const method = req.method;
  const pathname = new URL(req.url ?? "", "http://localhost").pathname;

  if (method === "POST" && pathname === "/products") {
    try {
      const body = await readJSON(req);

      if (typeof body !== "object" || body === null) {
        sendJSON(res, 400, { error: "El body debe ser un objeto JSON" });
        return;
      }

      const input = body as Record<string, unknown>;
      const validationError = validateProductInput(input);

      if (validationError) {
        sendJSON(res, 400, { error: validationError });
        return;
      }

      if (findProductById(products, input.id as number)) {
        sendJSON(res, 409, { error: `El id '${input.id}' ya existe` });
        return;
      }

      if (findProductBySlug(products, input.slug as string)) {
        sendJSON(res, 409, { error: `El slug '${input.slug}' ya existe` });
        return;
      }

      const product = input as unknown as Product;
      products.push(product);
      sendJSON(res, 201, product);
      return;
    } catch {
      sendJSON(res, 400, { error: "El body debe ser JSON válido" });
      return;
    }
  }

  const id = getId(pathname);

  if (id === undefined && (method === "PATCH" || method === "DELETE")) {
    sendJSON(res, 400, { error: "La ruta debe tener el formato /products/:id" });
    return;
  }

  if (method === "DELETE" && id !== undefined) {
    const index = products.findIndex((product) => product.id === id);

    if (index === -1) {
      sendJSON(res, 404, { error: `Producto con id '${id}' no encontrado` });
      return;
    }

    products.splice(index, 1);
    res.writeHead(204);
    res.end();
    return;
  }

  if (method === "PATCH" && id !== undefined) {
    const product = findProductById(products, id);

    if (!product) {
      sendJSON(res, 404, { error: `Producto con id '${id}' no encontrado` });
      return;
    }

    try {
      const body = await readJSON(req);

      if (typeof body !== "object" || body === null) {
        sendJSON(res, 400, { error: "El body debe ser un objeto JSON" });
        return;
      }

      const candidate = { ...product, ...(body as Record<string, unknown>), id };
      const validationError = validateProductInput(candidate);

      if (validationError) {
        sendJSON(res, 400, { error: validationError });
        return;
      }

      const duplicateSlug = findProductBySlug(products, candidate.slug as string);

      if (duplicateSlug && duplicateSlug.id !== id) {
        sendJSON(res, 409, { error: `El slug '${candidate.slug}' ya existe` });
        return;
      }

      Object.assign(product, candidate);
      sendJSON(res, 200, product);
      return;
    } catch {
      sendJSON(res, 400, { error: "El body debe ser JSON válido" });
      return;
    }
  }

  sendJSON(res, 404, { error: "Ruta no encontrada" });
}

const server = createServer((req, res) => {
  void handleRequest(req, res);
});

server.listen(3000, () => {
  console.log("Servidor CRUD corriendo en http://localhost:3000");
});
