CREATE USER cas IDENTIFIED BY 'my-super-secret-password';

CREATE DATABASE cas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON cas . * TO 'cas';
