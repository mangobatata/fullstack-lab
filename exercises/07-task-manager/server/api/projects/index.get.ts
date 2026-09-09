import { eq } from "drizzle-orm";
import { db } from "~~/server/db";
import { projectsTable } from "~~/server/db/schema";

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Inicie sesión para continuar.",
    });
  }

  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.userId, session.user.id));
    
  return projects;
});
