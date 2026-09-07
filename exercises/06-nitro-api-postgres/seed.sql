-- =============================================================================
-- FASE 1: INSERCIÓN DE DATOS (SEEDING)
-- =============================================================================
INSERT INTO products (name, price, quantity, slug) VALUES
  ('Teclado Mecánico RGB Switch Blue', 89.99, 45, 'teclado-mecanico-rgb-switch-blue'),
  ('Mouse Óptico Gamer 16000 DPI', 45.50, 120, 'mouse-optico-gamer-16000-dpi'),
  ('Monitor Curvo 27" QHD 165Hz', 320.00, 12, 'monitor-curvo-27-qhd-165hz'),
  ('Memoria RAM DDR5 32GB (2x16GB) 6000MHz', 145.00, 0, 'memoria-ram-ddr5-32gb-2x16gb-6000mhz');


-- =============================================================================
-- FASE 2: CONSULTA (SELECT - GET :slug)
-- =============================================================================
SELECT id, name, price, quantity, slug 
FROM products 
WHERE slug = 'mouse-optico-gamer-16000-dpi';


-- =============================================================================
-- FASE 3: ACTUALIZACIÓN SEGURA (UPDATE - PATCH)
-- =============================================================================
BEGIN; -- Iniciamos la transacción de seguridad

-- 1. El Hábito del Espejo: Verificamos qué fila vamos a modificar
SELECT id, name, quantity FROM products WHERE slug = 'monitor-curvo-27-qhd-165hz';

-- 2. Ejecutamos el cambio (baja el stock a 11)
UPDATE products 
SET quantity = 11 
WHERE slug = 'monitor-curvo-27-qhd-165hz';

-- 3. Si Postgres reporta "UPDATE 1", todo salió perfecto. Confirmamos en disco:
COMMIT;


-- =============================================================================
-- FASE 4: ELIMINACIÓN SEGURA (DELETE) CON CASO DE ERROR Y ROLLBACK
-- =============================================================================
BEGIN; -- Iniciamos otra transacción

-- 1. El Hábito del Espejo: Verificamos qué fila vamos a borrar
SELECT id, name FROM products WHERE slug = 'monitor-curvo-27-qhd-165hz';

-- 2. Simulamos la eliminación
DELETE FROM products 
WHERE slug = 'monitor-curvo-27-qhd-165hz';

-- [PUNTO DE DECISIÓN]
-- Si confirmás que afectó a la fila correcta (DELETE 1), ejecutarías: COMMIT;
-- Pero si te das cuenta de que el WHERE falló o querés deshacer el borrado:
ROLLBACK; -- El monitor borrado vuelve a existir mágicamente en la tabla.
