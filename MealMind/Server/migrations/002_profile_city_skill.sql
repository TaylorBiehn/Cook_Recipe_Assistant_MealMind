-- City + skill rename + kitchen comfort (onboarding vs profile dietary stays separate)

ALTER TABLE users
  ADD COLUMN city VARCHAR(128) NULL DEFAULT NULL COMMENT 'City or locality; optional when WORLDWIDE' AFTER country_code,
  CHANGE COLUMN cooking_level skill_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner' COMMENT 'Kitchen skill (beginner / intermediate / advanced)',
  ADD COLUMN kitchen_comfort ENUM('quick_simple', 'balanced', 'ambitious') NOT NULL DEFAULT 'balanced' COMMENT 'How you usually cook — quick vs ambitious' AFTER skill_level;
