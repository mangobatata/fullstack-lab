import { v4 as uuidv4 } from "uuid";

// Conservamos letras Unicode; descomponemos acentos y eliminamos sus marcas.
export function sanitizeName(name: string): string {
  return name.normalize("NFKD").replace(/\p{M}/gu, "")
    .trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s-]+/g, "-").replace(/^-+|-+$/g, "") || "producto";
}

// UUID completo reduce colisiones; UNIQUE en PostgreSQL sigue siendo la garantía.
// Se genera al crear: renombrar un producto conserva su URL pública.
export function generateSlug(name: string): string {
  return `${uuidv4()}-${sanitizeName(name)}`;
}
