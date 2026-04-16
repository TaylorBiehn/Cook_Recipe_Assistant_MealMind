-- MealMind initial schema (MySQL 8.0+, InnoDB, utf8mb4)
-- Run via: npm run migrate
-- schema_migrations is created by src/cli/migrate.ts before any file runs.

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  auth_subject VARCHAR(255) NULL COMMENT 'External auth subject when using SSO; NULL for anonymous/local id mapping later',
  cooking_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
  preferences JSON NOT NULL DEFAULT (JSON_ARRAY()) COMMENT 'Taste tags, e.g. spicy, sweet, healthy',
  dislikes JSON NOT NULL DEFAULT (JSON_ARRAY()) COMMENT 'Ingredients or patterns to exclude',
  country_code VARCHAR(32) NOT NULL DEFAULT 'WORLDWIDE' COMMENT 'ISO country code or WORLDWIDE default',
  vegetarian_focus TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'When 1, prefer vegetarian recipes',
  pescetarian_friendly TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'When 1, fish/seafood allowed alongside vegetarian tilt',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_auth_subject (auth_subject),
  KEY idx_users_country (country_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS favorites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  recipe_data JSON NOT NULL COMMENT 'Full recipe payload for offline display',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_favorites_user (user_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recipes_cache (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  title VARCHAR(512) NOT NULL,
  ingredients JSON NOT NULL,
  steps JSON NOT NULL,
  source_refs JSON NULL COMMENT 'URLs or citation blobs for grounded steps',
  query_fingerprint CHAR(64) NOT NULL COMMENT 'SHA-256 hex of normalized suggest request',
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_recipes_cache_fingerprint (query_fingerprint),
  KEY idx_recipes_cache_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
