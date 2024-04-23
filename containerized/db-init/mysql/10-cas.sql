CREATE USER cas IDENTIFIED BY 'my-super-secret-password';

CREATE DATABASE cas;
GRANT ALL PRIVILEGES ON cas . * TO 'cas';
