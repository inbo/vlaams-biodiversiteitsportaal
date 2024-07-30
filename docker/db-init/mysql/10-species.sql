CREATE DATABASE specieslists CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER species IDENTIFIED BY 'my-super-secret-password';
GRANT ALL PRIVILEGES ON specieslists . * TO 'species';
