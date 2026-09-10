import { asc, count, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~~/server/db";
import { projectsTable } from "~~/server/db/schema";

// Validar los parámetros de paginación
const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int("La página debe ser un entero.")
    .positive("La página debe ser mayor a 0.")
    .default(1),

  limit: z.coerce
    .number()
    .int("El límite debe ser un entero.")
    .positive("El límite debe ser mayor a 0.")
    .max(100, "El límite máximo es 100.")
    .default(20),
});

export default defineEventHandler(async (event) => {
  // 1. Verificar sesión
  const session = await requireUserSession(event);

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Inicie sesión para continuar.",
    });
  }

  // 2. Leer los query params
  const query = getQuery(event);

  // 3. Validar page y limit
  const paginationResult = paginationSchema.safeParse({
    page: query.page,
    limit: query.limit,
  });

  if (!paginationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message:
        paginationResult.error.issues[0]?.message ??
        "Los parámetros de paginación no son válidos.",
    });
  }

  const { page, limit } = paginationResult.data;

  // 4. Convertir page a offset para PostgreSQL
  const offset = (page - 1) * limit;

  // 5. Buscar los proyectos del usuario y contar el total
  const [projects, totalResult] = await Promise.all([
    db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, session.user.id))
      .orderBy(asc(projectsTable.id))
      .limit(limit)
      .offset(offset),

    db
      .select({
        total: count(),
      })
      .from(projectsTable)
      .where(eq(projectsTable.userId, session.user.id)),
  ]);

  // 6. Obtener cantidad total de proyectos
  const total = totalResult[0]?.total ?? 0;

  // 7. Calcular cantidad total de páginas
  const totalPages = Math.ceil(total / limit);

  // 8. Retornar proyectos y datos de paginación
  return {
    data: projects,

    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
});
