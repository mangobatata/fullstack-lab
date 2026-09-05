export interface Product {
  id: number;
  name: string;
  price: number;
  quantity: number;
  slug: string;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Wireless Mouse",
    price: 29.99,
    quantity: 15,
    slug: "wireless-mouse",
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    price: 89.5,
    quantity: 0,
    slug: "mechanical-keyboard",
  },
  {
    id: 3,
    name: "Gaming Headset",
    price: 59.9,
    quantity: 8,
    slug: "gaming-headset",
  },
];
