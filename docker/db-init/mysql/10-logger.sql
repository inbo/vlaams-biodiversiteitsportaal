CREATE DATABASE logger CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER logger IDENTIFIED BY 'my-super-secret-password'; -- TODO extract this super secret password to an env variable....
ALTER USER IF EXISTS 'logger'@'%' IDENTIFIED BY 'my-super-secret-password';
GRANT ALL PRIVILEGES ON logger . * TO 'logger';