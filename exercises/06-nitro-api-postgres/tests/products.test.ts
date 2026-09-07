import { describe, expect, test, mock, beforeEach } from "bun:test";
import { H3, HTTPError } from "nitro/h3";
import { validateProduct } from "../server/utils/validation.ts";
import { sanitizeName } from "../server/utils/slug.ts";

// Sustituimos solo PostgreSQL: el routing, lectura JSON y respuesta HTTP son reales.
const row = { id: 1, name: "Mouse", price: "0.29", quantity: 2, slug: "estable" };
const query = mock(async (..._args: unknown[]) => ({ rows: [row], rowCount: 1 }));
mock.module("../server/utils/db.ts", () => ({ pool: { query } }));
const post = (await import("../server/api/products/index.post.ts")).default;
const patch = (await import("../server/api/products/[slug].patch.ts")).default;
const remove = (await import("../server/api/products/[slug].delete.ts")).default;
const get = (await import("../server/api/products/[slug].get.ts")).default;
const list = (await import("../server/api/products/index.get.ts")).default;
const app = new H3().post("/api/products", post).get("/api/products", list)
  .patch("/api/products/:slug", patch).delete("/api/products/:slug", remove)
  .get("/api/products/:slug", get);

function request(method: string, body?: unknown, path = "/api/products/estable") {
  return app.fetch(new Request(`http://localhost${path}`, {
    method, headers: { "content-type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }));
}
beforeEach(() => { query.mockReset(); query.mockResolvedValue({ rows: [row], rowCount: 1 }); });

describe("validación antes de consultar", () => {
  for (const body of [null, [], [1], "hola", {}, { color: "red" }, { slug: "otro" }, { name: " " }, { quantity: 1.5 }, { quantity: 2147483648 }, { price: 100000000 }, { price: 1.234 }, { price: null }, { quantity: -1 }]) {
    test(`PATCH rechaza ${JSON.stringify(body)}`, async () => {
      expect((await request("PATCH", body)).status).toBe(400);
      expect(query).not.toHaveBeenCalled();
    });
  }
  test("POST requiere todos los campos y rechaza extras", async () => {
    for (const body of [{ name: "Mouse" }, { name: "Mouse", price: 1, quantity: 1, slug: "ajeno" }]) {
      expect((await request("POST", body, "/api/products")).status).toBe(400);
    }
    expect(query).not.toHaveBeenCalled();
  });
  test("límites y números no finitos", () => {
    expect(validateProduct({ name: " Mouse ", price: 99999999.99, quantity: 2147483647 }, false).name).toBe("Mouse");
    expect(validateProduct({ price: 0.29, quantity: 0 }, true)).toEqual({ price: 0.29, quantity: 0 });
    for (const price of [NaN, Infinity, -Infinity]) expect(() => validateProduct({ price }, true)).toThrow(HTTPError);
  });
});

test("POST devuelve 201 y convierte el precio", async () => {
  const response = await request("POST", { name: "Mouse", price: 0.29, quantity: 2 }, "/api/products");
  expect(response.status).toBe(201);
  expect((await response.json()).price).toBe(0.29);
});
test("POST traduce conflicto de unicidad", async () => {
  query.mockRejectedValueOnce({ code: "23505" });
  expect((await request("POST", { name: "Mouse", price: 1, quantity: 1 }, "/api/products")).status).toBe(409);
});
test("PATCH conserva el slug y parametriza el nombre", async () => {
  const name = "Mouse'; DELETE FROM products; --";
  const response = await request("PATCH", { name, quantity: 0 });
  expect(response.status).toBe(200);
  const [sql, values] = query.mock.calls[0];
  expect(sql).toContain("SET name = $1, quantity = $2 WHERE slug = $3");
  expect(sql).not.toContain(name);
  expect(values).toEqual([name, 0, "estable"]);
  expect((await response.json()).slug).toBe("estable");
});
test("GET y listado convierten filas", async () => {
  expect((await (await request("GET")).json()).price).toBe(0.29);
  expect(await (await request("GET", undefined, "/api/products")).json()).toEqual([{ ...row, price: 0.29 }]);
});
test("GET, PATCH y DELETE ausentes devuelven 404", async () => {
  query.mockResolvedValue({ rows: [], rowCount: 0 });
  for (const method of ["GET", "PATCH", "DELETE"]) {
    expect((await request(method, method === "PATCH" ? { price: 1 } : undefined)).status).toBe(404);
  }
});
test("DELETE devuelve 204 sin cuerpo", async () => {
  const response = await request("DELETE");
  expect(response.status).toBe(204);
  expect(await response.text()).toBe("");
  expect(query.mock.calls[0]).toEqual(["DELETE FROM products WHERE slug = $1;", ["estable"]]);
});
test("nombre legible con acentos, Unicode y símbolos", () => {
  expect(sanitizeName(" Café 日本 ")).toBe("cafe-日本");
  expect(sanitizeName("🎉")).toBe("producto");
});
