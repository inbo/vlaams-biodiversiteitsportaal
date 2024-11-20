CREATE DATABASE doi;

CREATE USER doi WITH PASSWORD 'my-super-secret-password';
ALTER USER doi WITH PASSWORD 'my-super-secret-password';
GRANT CONNECT ON DATABASE doi TO doi;
GRANT CREATE ON DATABASE doi to doi;
CREATE EXTENSION IF NOT EXISTS citext;

\connect doi;
GRANT ALL ON SCHEMA public TO doi;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO doi;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO doi;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO doi;