CREATE USER apikey IDENTIFIED BY 'my-super-secret-password';

CREATE DATABASE apikey CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON apikey . * TO 'apikey';
