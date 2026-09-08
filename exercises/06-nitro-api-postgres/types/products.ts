// Forma de los datos. Los handlers excluyen slug con Omit porque lo genera el servidor.
export interface ProductInput {
  slug: string;
  name: string;
  price: number;
  quantity: number;
}
