import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "../../server/db";
import { usersTable } from "../../server/db/schema";

vi.setConfig({ testTimeout: 30_000, hookTimeout: 30_000 });
const baseUrl = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const runId = randomUUID();
const password = "Test-password-123!";
const emailA = `tasks-a-${runId}@example.com`;
const emailB = `tasks-b-${runId}@example.com`;
let cookieA = "";
let cookieB = "";
let projectId = 0;
let taskId = 0;

function request(path: string, init: RequestInit = {}, cookie = "") {
  return fetch(new URL(`/api/${path}`, baseUrl), {
    ...init,
    headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}), ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(10_000),
  });
}
const body = (value: unknown): RequestInit => ({ body: JSON.stringify(value) });
const cookieFrom = (response: Response) => response.headers.getSetCookie().find((v) => v.startsWith("nuxt-session="))?.split(";")[0] ?? "";

async function login(email: string, name: string) {
  expect((await request("auth/register", { method: "POST", ...body({ name, email, password }) })).status).toBe(201);
  const response = await request("auth/login", { method: "POST", ...body({ email, password }) });
  expect(response.status).toBe(200);
  return cookieFrom(response);
}

beforeAll(async () => {
  cookieA = await login(emailA, "Tasks A");
  cookieB = await login(emailB, "Tasks B");
  const project = await request("projects", { method: "POST", ...body({ projectName: `Tasks ${runId}` }) }, cookieA);
  expect(project.status).toBe(201);
  projectId = (await project.json()).id;
  const task = await request(`projects/${projectId}/tasks`, { method: "POST", ...body({ title: `Task ${runId}`, description: "Initial description" }) }, cookieA);
  expect(task.status).toBe(201);
  taskId = (await task.json()).id;
});

afterAll(async () => {
  await db.delete(usersTable).where(eq(usersTable.email, emailA));
  await db.delete(usersTable).where(eq(usersTable.email, emailB));
});

describe("Nested Tasks API", () => {
  it("creates with todo and lists with pagination", async () => {
    const create = await request(`projects/${projectId}/tasks`, { method: "POST", ...body({ title: `Another ${runId}` }) }, cookieA);
    expect(create.status).toBe(201);
    expect((await create.json()).status).toBe("todo");
    const list = await request(`projects/${projectId}/tasks?page=1&limit=20`, {}, cookieA);
    expect(list.status).toBe(200);
    const data = await list.json();
    expect(data.pagination).toEqual({ page: 1, limit: 20, total: expect.any(Number), totalPages: expect.any(Number) });
    expect(data.data.every((task: { projectId: number }) => task.projectId === projectId)).toBe(true);
  });

  it("rejects invalid create and pagination", async () => {
    expect((await request(`projects/${projectId}/tasks`, { method: "POST", ...body({ title: "A" }) }, cookieA)).status).toBe(400);
    expect((await request(`projects/${projectId}/tasks?page=0`, {}, cookieA)).status).toBe(400);
    expect((await request(`projects/${projectId}/tasks?limit=101`, {}, cookieA)).status).toBe(400);
  });

  it("gets and partially updates without overwriting omitted fields", async () => {
    const get = await request(`projects/${projectId}/tasks/${taskId}`, {}, cookieA);
    expect(get.status).toBe(200);
    const original = (await get.json()).data;
    const update = await request(`projects/${projectId}/tasks/${taskId}`, { method: "PATCH", ...body({ status: "doing" }) }, cookieA);
    expect(update.status).toBe(200);
    const updated = await update.json();
    expect(updated).toMatchObject({ id: taskId, title: original.title, description: original.description, status: "doing" });
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(updated.createdAt).getTime());
  });

  it("rejects empty body, invalid enum and invalid task id", async () => {
    expect((await request(`projects/${projectId}/tasks/${taskId}`, { method: "PATCH", ...body({}) }, cookieA)).status).toBe(400);
    expect((await request(`projects/${projectId}/tasks/${taskId}`, { method: "PATCH", ...body({ status: "invalid" }) }, cookieA)).status).toBe(400);
    expect((await request(`projects/${projectId}/tasks/not-a-number`, {}, cookieA)).status).toBe(400);
  });

  it("returns 404 for missing task and wrong project", async () => {
    expect((await request(`projects/${projectId}/tasks/999999`, {}, cookieA)).status).toBe(404);
    expect((await request(`projects/${projectId + 999999}/tasks/${taskId}`, {}, cookieA)).status).toBe(404);
  });

  it("enforces IDOR protection for user B", async () => {
    expect((await request(`projects/${projectId}/tasks`, {}, cookieB)).status).toBe(404);
    expect((await request(`projects/${projectId}/tasks/${taskId}`, {}, cookieB)).status).toBe(404);
    expect((await request(`projects/${projectId}/tasks/${taskId}`, { method: "PATCH", ...body({ status: "done" }) }, cookieB)).status).toBe(404);
    expect((await request(`projects/${projectId}/tasks/${taskId}`, { method: "DELETE" }, cookieB)).status).toBe(404);
  });

  it("deletes with 204 and then returns 404", async () => {
    const create = await request(`projects/${projectId}/tasks`, { method: "POST", ...body({ title: `Deletable ${runId}` }) }, cookieA);
    const id = (await create.json()).id;
    const deleted = await request(`projects/${projectId}/tasks/${id}`, { method: "DELETE" }, cookieA);
    expect(deleted.status).toBe(204);
    expect(await deleted.text()).toBe("");
    expect((await request(`projects/${projectId}/tasks/${id}`, {}, cookieA)).status).toBe(404);
  });
});
