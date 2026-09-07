import { pool } from "./db.ts";
import { getAllProducts } from "./query.ts";

const products = await getAllProducts();
console.log(products);

await pool.end();
