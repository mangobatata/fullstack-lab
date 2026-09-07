export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  slug: string;
}

export const products: Product[] = [
  {
    id: crypto.randomUUID(),
    name: "Wireless Mouse",
    price: 29.99,
    quantity: 15,
    slug: "wireless-mouse",
  },
  {
    id: crypto.randomUUID(),
    name: "Mechanical Keyboard",
    price: 89.5,
    quantity: 0,
    slug: "mechanical-keyboard",
  },
  {
    id: crypto.randomUUID(),
    name: "Gaming Headset",
    price: 59.9,
    quantity: 8,
    slug: "gaming-headset",
  },
];
