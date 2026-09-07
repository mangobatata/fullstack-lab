// Contrato de lectura que recibe el cliente; coincide con las columnas seleccionadas.
export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  slug: string;
}

// pg devuelve NUMERIC como string para no perder precisión.
export interface ProductRow extends Omit<Product, "price"> {
  price: string;
}

// ¿Qué hace toProduct?
// Es una traductora: copia la fila (...row) pero convierte el precio de texto a número.
// Entra:  { id: 2, price: "45.50", ... }  ← texto (así lo manda pg)
// Sale:   { id: 2, price: 45.5, ... }     ← número (así lo pide tu Product)
export function toProduct(row: ProductRow): Product {
  return { ...row, price: parseFloat(row.price) };
}

// Reutilizamos la misma conversión para cada fila del listado.
export function toProducts(rows: ProductRow[]): Product[] {
  return rows.map(toProduct);
}
