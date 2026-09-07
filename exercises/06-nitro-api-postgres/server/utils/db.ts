import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta DATABASE_URL en el entorno (.env).");
}

// Pool compartido: se crea una vez y se reutiliza en todos los handlers.
export const pool = new pg.Pool({ connectionString });
