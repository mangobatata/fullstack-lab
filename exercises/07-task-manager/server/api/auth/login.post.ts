import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~~/server/db";
import { usersTable } from "~~/server/db/schema";
import { verifyPassword } from "../utils/password";
import type { AuthUser } from "~~/server/types/auth";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Email is not valid")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginBody = z.infer<typeof bodySchema>;

export default defineEventHandler(async (event) => {
  // 1. leer y validar el body con Zod (safeParse no lanza, devuelve success/data|error)
  const body = await readBody<LoginBody>(event);
  const result = bodySchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Invalid credentials.",
    });
  }

  const { email, password } = result.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });
  }

  const isPasswordValid = await verifyPassword(user.passwordHash, password);
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid credentials.",
    });
  }

  const userSession: AuthUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };

  await setUserSession(event, {
    user: userSession,
  });

  return {
    message: "Login successful",
    user: userSession,
  };
});

// Leer body y hacer verificación de credenciales
// Verifico si el usuario existe en la base de datos
// Si existe, verifico si la contraseña es correcta
// Si es correcta, guardo en la session

// validar body
// → buscar usuario
// → verificar contraseña
// → crear sesión
// → devolver usuario público
