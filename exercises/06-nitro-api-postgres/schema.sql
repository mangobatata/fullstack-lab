CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL CHECK (btrim(name) <> ''),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity >= 0),
  slug TEXT UNIQUE NOT NULL CHECK (btrim(slug) <> '')
);
