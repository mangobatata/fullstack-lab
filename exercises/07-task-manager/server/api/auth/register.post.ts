import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { usersTable } from "~~/server/db/schema";
import { hashPassword } from "../utils/password";
import { getPostgresErrorCode } from "../utils/db-error";


interface User {
  name: string;
  email: string;
  password: string;
}

export default defineEventHandler(async (event) => {
  const body = await readBody<User>(event);

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "El body es requerido.",
    });
  }

  const { name, email, password } = body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "El campo 'name' es requerido y debe ser un texto válido.",
    });
  }

  if (!email || typeof email !== "string" || email.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "El campo 'email' es requerido y debe ser un texto válido.",
    });
  }

  if (!password || typeof password !== "string" || password.trim() === "") {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "El campo 'password' es requerido y debe ser un texto válido.",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailExists = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizedEmail));

  if (emailExists.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: "El email ya existe.",
    });
  }

  const passwordHash = await hashPassword(password);

  const user: typeof usersTable.$inferInsert = {
    name,
    email: normalizedEmail,
    passwordHash,
  };

  try {
    await db.insert(usersTable).values(user);
    setResponseStatus(event, 201);

    return { name: user.name, email: user.email };
  } catch (error: unknown) {
    const errorCode = getPostgresErrorCode(error);

    if (errorCode === "23505") {
      throw createError({
        statusCode: 409,
        statusMessage: "Conflict",
        message: "El email ya existe.",
      });
    }

    throw error;
  }
});

// verifico que el body exista
// si no existe retorno error
// verifico que cada campo del body sea valido
// primero voy a verifiar si el usuario existe mediante su email
// voy a hashear la pass
// voy a guardar el user en la db
