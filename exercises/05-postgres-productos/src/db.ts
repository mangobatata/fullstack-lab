import pg from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Falta DATABASE_URL en el entorno (.env).");
}

export const pool = new pg.Pool({ connectionString });
