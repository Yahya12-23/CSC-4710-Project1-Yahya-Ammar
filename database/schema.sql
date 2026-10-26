-- Shared database schema for BOTH teammates (requirements 1–10).
-- Run this in phpMyAdmin's SQL tab before starting the backend.
CREATE DATABASE IF NOT EXISTS web_app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE web_app;

CREATE TABLE IF NOT EXISTS Users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL, -- bcrypt hash, NEVER plaintext
    firstname VARCHAR(50) NOT NULL,
    lastname VARCHAR(50) NOT NULL,
    salary DECIMAL(12,2) NOT NULL,
    age INTEGER NOT NULL,
    registerday DATE NOT NULL,
    signintime DATETIME NULL DEFAULT NULL,
    INDEX idx_users_name (firstname, lastname),
    INDEX idx_users_salary (salary),
    INDEX idx_users_registerday (registerday)
);
