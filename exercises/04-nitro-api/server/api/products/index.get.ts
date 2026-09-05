import { defineHandler } from "nitro";
import { products } from "#data/api.ts";

export default defineHandler(() => {
  return products;
});
