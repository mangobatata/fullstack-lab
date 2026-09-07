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

export function toProduct(row: ProductRow): Product {
  return { ...row, price: parseFloat(row.price) };
}

export function toProducts(rows: ProductRow[]): Product[] {
  return rows.map(toProduct);
}
