-- === Schema: user_table / flat_table / message_table ===
-- 先生ルール: createdAt TIMESTAMP NOT NULL（DEFAULTなし）
-- INSERT 時は必ず NOW() を明示すること

SET NAMES utf8mb4;
SET time_zone = "+00:00";

-- 外部キーのための順序でDROP
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS message_table;
DROP TABLE IF EXISTS flat_table;
DROP TABLE IF EXISTS user_table;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE user_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name  VARCHAR(100),
  birth_date DATE,
  is_admin   TINYINT(1) NOT NULL DEFAULT 0,
  createdAt  TIMESTAMP  NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE flat_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city          VARCHAR(100) NOT NULL,
  street_name   VARCHAR(100) NOT NULL,
  street_number VARCHAR(50)  NOT NULL,
  area_size     INT,
  has_ac        TINYINT(1)   NOT NULL DEFAULT 0,
  year_built    INT,
  rent_price    DECIMAL(10,2),
  date_available DATE,
  owner_id      INT NOT NULL,
  createdAt     TIMESTAMP NOT NULL,
  CONSTRAINT fk_flat_owner
    FOREIGN KEY (owner_id) REFERENCES user_table(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_flat_owner (owner_id),
  INDEX idx_flat_city (city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE message_table (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content   TEXT NOT NULL,
  flat_id   INT  NOT NULL,
  sender_id INT  NOT NULL,
  createdAt TIMESTAMP NOT NULL,
  CONSTRAINT fk_msg_flat
    FOREIGN KEY (flat_id) REFERENCES flat_table(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_msg_sender
    FOREIGN KEY (sender_id) REFERENCES user_table(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_msg_flat (flat_id),
  INDEX idx_msg_sender (sender_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
