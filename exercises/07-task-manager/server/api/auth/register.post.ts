import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~~/server/db";
import { usersTable } from "~~/server/db/schema";
import { hashPassword } from "../utils/password";
import { getPostgresErrorCode } from "../utils/db-error";

const bodySchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().toLowerCase().pipe(z.email("Email is not valid")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type RegisterBody = z.infer<typeof bodySchema>;

export default defineEventHandler(async (event) => {
  // 1. leer y validar el body con Zod (safeParse no lanza, devuelve success/data|error)
  const body = await readBody<RegisterBody>(event);
  const result = bodySchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: result.error.issues[0]?.message ?? "Datos inválidos.",
    });
  }

  const { name, email, password } = result.data;

  // 2. verificar si el usuario ya existe mediante su email
  //    (email ya viene trimeado y en minúsculas por el schema)
  const emailExists = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (emailExists.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: "Conflict",
      message: "El email ya existe.",
    });
  }

  // 3. hashear la contraseña
  const passwordHash = await hashPassword(password);

  // 4. guardar el usuario en la db
  const user: typeof usersTable.$inferInsert = {
    name,
    email,
    passwordHash,
  };

  try {
    await db.insert(usersTable).values(user);
    setResponseStatus(event, 201);

    return { name: user.name, email: user.email };
  } catch (error: unknown) {
    const errorCode = getPostgresErrorCode(error);

    // fallback de condición de carrera: si dos requests pasan el check
    // anterior al mismo tiempo, la constraint única de la db lo atrapa acá
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
