-- User database schema. Run in phpMyAdmin before starting the server.
CREATE DATABASE IF NOT EXISTS web_app
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE web_app;

CREATE TABLE IF NOT EXISTS Users (
    username VARCHAR(50) PRIMARY KEY,
    password VARCHAR(255) NOT NULL, -- bcrypt password hash
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
