CREATE DATABASE collectory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER collectory IDENTIFIED BY 'my-super-secret-password';
GRANT ALL PRIVILEGES ON collectory . * TO 'collectory';
