import { v4 as uuidv4 } from "uuid";

// Limpiamos espacios y símbolos y sustituimos espacios por guiones.
export function sanitizeName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Apodo: seis caracteres del UUID y el nombre limpio.
// El prefijo puede repetirse: UNIQUE en PostgreSQL detecta duplicados.
// El cliente nunca manda el slug; nace acá.
export function generateSlug(name: string): string {
  return `${uuidv4().slice(0, 6)}-${sanitizeName(name)}`;
}
