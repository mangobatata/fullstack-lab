// Contrato de escritura: id y slug pertenecen al servidor, no al cliente.
export interface ProductInput {
  name: string;
  price: number;
  quantity: number;
}
