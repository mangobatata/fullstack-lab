import { v4 as uuidv4 } from "uuid";

export function sanitizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Apodo generado por el servidor: prefijo único + nombre limpio.
// El cliente nunca manda el slug; nace acá.
export function generateSlug(name: string): string {
  return `${uuidv4().slice(0, 6)}-${sanitizeName(name)}`;
}
