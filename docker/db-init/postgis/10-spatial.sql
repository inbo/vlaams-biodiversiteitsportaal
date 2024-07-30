CREATE DATABASE layersdb;

CREATE USER spatial WITH PASSWORD 'my-super-secret-password';
GRANT ALL PRIVILEGES ON DATABASE layersdb TO spatial;
