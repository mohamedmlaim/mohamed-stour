-- =============================================
--  Mohamed Stour — Database Schema
--  Run this entire file in phpMyAdmin → SQL tab
-- =============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ── Users table ──────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT(11)      NOT NULL AUTO_INCREMENT,
  `first_name` VARCHAR(80)  NOT NULL,
  `last_name`  VARCHAR(80)  NOT NULL,
  `email`      VARCHAR(180) NOT NULL,
  `password`   VARCHAR(255) NOT NULL,   -- bcrypt hash
  `age`        TINYINT(3)   NOT NULL,
  `phone`      VARCHAR(20)  NOT NULL,
  `address`    VARCHAR(255) NOT NULL,
  `wilaya`     VARCHAR(60)  NOT NULL,
  `gender`     ENUM('Male','Female') NOT NULL,
  `created_at` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Orders table ─────────────────────────────
CREATE TABLE IF NOT EXISTS `orders` (
  `id`           INT(11)      NOT NULL AUTO_INCREMENT,
  `user_id`      INT(11)      NOT NULL,
  `product_name` VARCHAR(120) NOT NULL,
  `product_id`   VARCHAR(20)  NOT NULL,
  `quantity`     INT(4)       NOT NULL DEFAULT 1,
  `full_name`    VARCHAR(160) NOT NULL,
  `phone`        VARCHAR(20)  NOT NULL,
  `address`      VARCHAR(255) NOT NULL,
  `wilaya`       VARCHAR(60)  NOT NULL,
  `note`         TEXT,
  `status`       ENUM('pending','confirmed','shipped','delivered','cancelled')
                 NOT NULL DEFAULT 'pending',
  `created_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_user` (`user_id`),
  CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Guest orders (no account needed) ─────────
CREATE TABLE IF NOT EXISTS `guest_orders` (
  `id`           INT(11)      NOT NULL AUTO_INCREMENT,
  `product_name` VARCHAR(120) NOT NULL,
  `product_id`   VARCHAR(20)  NOT NULL,
  `quantity`     INT(4)       NOT NULL DEFAULT 1,
  `full_name`    VARCHAR(160) NOT NULL,
  `phone`        VARCHAR(20)  NOT NULL,
  `address`      VARCHAR(255) NOT NULL,
  `wilaya`       VARCHAR(60)  NOT NULL,
  `note`         TEXT,
  `status`       ENUM('pending','confirmed','shipped','delivered','cancelled')
                 NOT NULL DEFAULT 'pending',
  `created_at`   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
