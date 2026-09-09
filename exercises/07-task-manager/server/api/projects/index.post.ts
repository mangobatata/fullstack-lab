import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { db } from "~~/server/db";
import { projectsTable } from "~~/server/db/schema";
import { slugify } from "../utils/slug";
import { getPostgresErrorCode } from "../utils/db-error";

const bodySchema = z.strictObject({
  projectName: z
    .string()
    .trim()
    .min(2, "El nombre debe tener al menos 2 caracteres.")
    .max(255, "El nombre no puede superar los 255 caracteres."),
});

type ProjectBody = z.infer<typeof bodySchema>;

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Inicie sesión para continuar.",
    });
  }

  const body = await readBody<ProjectBody>(event);
  const result = bodySchema.safeParse(body);

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: result.error.issues[0]?.message ?? "Datos inválidos.",
    });
  }

  const { projectName } = result.data;

  const baseSlug = slugify(projectName);

  const project: typeof projectsTable.$inferInsert = {
    projectName,
    slug: `${uuidv4().slice(0, 6)}-${baseSlug}`,
    userId: session.user.id,
  };

  try {
    const [createdProject] = await db
      .insert(projectsTable)
      .values(project)
      .returning({
        id: projectsTable.id,
        projectName: projectsTable.projectName,
        slug: projectsTable.slug,
        userId: projectsTable.userId,
      });
    setResponseStatus(event, 201);
    return createdProject;
  } catch (error: unknown) {
    const errorCode = getPostgresErrorCode(error);

    if (errorCode === "23505") {
      throw createError({
        statusCode: 409,
        statusMessage: "Conflict",
        message: "Ya existe un proyecto con un slug igual, intentá de nuevo.",
      });
    }

    throw error;
  }
});

// 1. Verificar que exista una sesión válida.
// 2. Leer y validar projectName del body.
// 3. Generar el slug desde projectName.
// 4. Obtener userId desde session.user.id.
// 5. Insertar el proyecto.
// 6. Devolver el proyecto creado con status 201.
