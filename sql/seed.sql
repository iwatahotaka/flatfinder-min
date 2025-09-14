-- === Seed (先生ルール: createdAt は NOW() を明示) ===

-- ユーザー1人
INSERT INTO user_table (email, password_hash, first_name, last_name, is_admin, createdAt)
VALUES ('admin@example.com', '$2b$10$dummyhashfornow', 'Admin', 'User', 1, NOW());

-- 物件1件（owner_id: 1）
INSERT INTO flat_table (city, street_name, street_number, area_size, has_ac, year_built, rent_price, date_available, owner_id, createdAt)
VALUES ('Vancouver', 'Main St', '100', 55, 1, 2010, 2100.00, '2025-10-01', 1, NOW());

-- メッセージ1件（flat_id:1, sender_id:1）
INSERT INTO message_table (content, flat_id, sender_id, createdAt)
VALUES ('Is this flat still available?', 1, 1, NOW());
