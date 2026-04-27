CREATE TABLE IF NOT EXISTS ingredient_history (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  ingredient_name VARCHAR(120) NOT NULL,
  ingredient_key VARCHAR(120) NOT NULL COMMENT 'Lowercased, normalized key for dedupe',
  last_used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  use_count INT UNSIGNED NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ingredient_history_user_key (user_id, ingredient_key),
  KEY idx_ingredient_history_user_recent (user_id, last_used_at),
  CONSTRAINT fk_ingredient_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
