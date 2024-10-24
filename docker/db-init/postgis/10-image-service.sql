CREATE DATABASE images;

CREATE USER images WITH PASSWORD 'my-super-secret-password';
ALTER USER images WITH PASSWORD 'my-super-secret-password';
GRANT CONNECT ON DATABASE images TO images;
GRANT CREATE ON DATABASE images TO images;

\connect images;
GRANT ALL ON SCHEMA public TO images;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO images;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO images;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO images;