-- Données de démonstration (inventées). Comptes de test, en local seulement :
--   pharmacie@demo.test / demo-pharmatrend (pharmacien)
--   vendeur@demo.test   / demo-pharmatrend (vendeur pro)

INSERT INTO users (name, company_name, email, password_hash, role) VALUES
  ('Camille Martin', 'Pharmacie du Centre', 'pharmacie@demo.test',
   '$2b$10$Dt/HOT41wuipP6PjuBw1P.XI3aJ.ymEWBzcOnpcw0vXC0l99XHinu', 'PHARMACIST'),
  ('Lucas Bernard', 'MedEquip Pro', 'vendeur@demo.test',
   '$2b$10$Dt/HOT41wuipP6PjuBw1P.XI3aJ.ymEWBzcOnpcw0vXC0l99XHinu', 'SELLER')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, category, likes_count, image_url)
SELECT * FROM (VALUES
  ('Crème solaire SPF 50+', 'Dermatologie', 42, NULL),
  ('Vitamine D3 en gouttes', 'Compléments', 37, NULL),
  ('Spray nasal à l''eau de mer', 'ORL', 25, NULL),
  ('Gel hydroalcoolique 500 ml', 'Hygiène', 18, NULL),
  ('Tensiomètre de poignet', 'Matériel médical', 12, NULL)
) AS v (name, category, likes_count, image_url)
WHERE NOT EXISTS (SELECT 1 FROM products);

INSERT INTO equipments (id_user, title, description, price, status, image_url, location)
SELECT u.id_user, v.title, v.description, v.price, v.status,
       NULL,
       ST_SetSRID(ST_MakePoint(v.lng, v.lat), 4326)
FROM (VALUES
  ('Robot de dispensation', 'Robot de rangement des boîtes, révisé en 2025.', 18000.00, 'Robotics', 4.8357, 45.7640),
  ('Réfrigérateur pharmaceutique 400 L', 'Alarme de température, porte vitrée.', 1450.00, 'Refrigeration', 2.3522, 48.8566),
  ('Comptoir modulable', 'Trois modules, finition chêne clair.', 900.00, 'Furniture', 5.3698, 43.2965)
) AS v (title, description, price, status, lng, lat)
JOIN users u ON u.email = 'vendeur@demo.test'
WHERE NOT EXISTS (SELECT 1 FROM equipments);
