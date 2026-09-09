import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../server/db";
import { projectsTable, usersTable } from "../../server/db/schema";

vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 });
const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const email = `projects-${randomUUID()}@example.com`;
let cookie = "";
let userId: number;

function post(path: string, body: unknown, sessionCookie = cookie) {
  return fetch(new URL(`/api/${path}`, baseUrl), {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: sessionCookie },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000),
    redirect: "manual",
  });
}

beforeAll(async () => {
  const password = "Test-password-123!";
  expect((await post("auth/register", { name: "Projects Test", email, password })).status).toBe(201);
  const response = await post("auth/login", { email, password });
  expect(response.status).toBe(200);
  cookie = response.headers.getSetCookie().find((value) => value.startsWith("nuxt-session="))?.split(";")[0] ?? "";
  expect(cookie).not.toBe("");
  userId = (await response.json()).user.id;
});

afterAll(async () => {
  try {
    // La FK elimina en cascada únicamente los proyectos de este usuario de prueba.
    await db.delete(usersTable).where(eq(usersTable.email, email));
  } finally {
    await db.$client.end();
  }
});

describe("POST /api/projects", () => {
  it("crea y persiste un proyecto con el propietario de la sesión", async () => {
    const response = await post("projects", { projectName: "  Mi proyecto  " });
    expect(response.status).toBe(201);
    const project = await response.json();
    expect(project).toEqual({
      id: expect.any(Number), projectName: "Mi proyecto",
      slug: expect.stringMatching(/-mi-proyecto$/), userId,
    });
    const [stored] = await db.select().from(projectsTable).where(eq(projectsTable.id, project.id));
    expect(stored).toEqual(project);
  });

  it("rechaza crear sin sesión", async () => {
    expect((await post("projects", { projectName: "Privado" }, "")).status).toBe(401);
  });

  it.each([
    {}, { projectName: "A" }, { projectName: "   " },
    { projectName: 123 }, { projectName: "a".repeat(256) },
    { projectName: "Ajeno", userId: -1 },
  ])("rechaza datos inválidos o un propietario enviado por el cliente: %j", async (body) => {
    expect((await post("projects", body)).status).toBe(400);
  });

  it("admite 255 caracteres sin exceder el límite del slug", async () => {
    const response = await post("projects", { projectName: "a".repeat(255) });
    expect(response.status).toBe(201);
    expect((await response.json()).slug.length).toBeLessThanOrEqual(255);
  });

  it("genera slugs distintos para proyectos con el mismo nombre", async () => {
    const first = await post("projects", { projectName: "Repetido" });
    const second = await post("projects", { projectName: "Repetido" });
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect((await first.json()).slug).not.toBe((await second.json()).slug);
  });

  it("admite nombres sin caracteres latinos", async () => {
    const response = await post("projects", { projectName: "日本語" });
    expect(response.status).toBe(201);
    expect((await response.json()).slug).toMatch(/-project$/);
  });
});
