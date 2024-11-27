CREATE USER alerts IDENTIFIED BY 'my-super-secret-password';

CREATE DATABASE alerts CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON alerts . * TO 'alerts';
