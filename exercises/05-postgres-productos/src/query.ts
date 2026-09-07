import { pool } from "./db.ts";

/**
 * 1. GET /api/products
 * Devuelve todos los productos ordenados por ID.
 */
export async function getAllProducts() {
  const queryText =
    "SELECT id, name, price, quantity, slug FROM products ORDER BY id;";
  const result = await pool.query(queryText);
  return result.rows;
}

/**
 * 2. GET /api/products/:slug
 * Devuelve un único producto filtrado por su slug de forma segura.
 */
export async function getProductBySlug(slug: string) {
  const queryText =
    "SELECT id, name, price, quantity, slug FROM products WHERE slug = $1;";
  const result = await pool.query(queryText, [slug]); // 🛡️ Blindado contra SQL Injection

  // Si no encuentra nada, devolvemos null para que el handler tire un 404
  if (result.rows.length === 0) return null;
  return result.rows[0];
}

/**
 * 3. PATCH /api/products/:slug/stock
 * Actualiza el stock restando o seteando la nueva cantidad.
 * Usa RETURNING * para devolver el producto actualizado al cliente sin hacer otro SELECT.
 */
export async function updateProductStock(slug: string, newQuantity: number) {
  const queryText = `
    UPDATE products 
    SET quantity = $1 
    WHERE slug = $2 
    RETURNING id, name, price, quantity, slug;
  `;
  const result = await pool.query(queryText, [newQuantity, slug]); // 🛡️ Parámetros en orden ($1 = newQuantity, $2 = slug)

  if (result.rows.length === 0) return null;
  return result.rows[0];
}

/**
 * 4. DELETE /api/products/:slug
 * Elimina un producto por su slug de forma segura.
 * También usa RETURNING para confirmar qué se borró.
 */
export async function deleteProduct(slug: string) {
  const queryText = "DELETE FROM products WHERE slug = $1 RETURNING id, name;";
  const result = await pool.query(queryText, [slug]);

  if (result.rows.length === 0) return null;
  return result.rows[0]; // Devuelve el id y name del producto eliminado
}
