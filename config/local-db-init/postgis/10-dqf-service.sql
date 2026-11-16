CREATE DATABASE dataqualityfilter;

CREATE USER dataqualityfilter WITH PASSWORD 'my-super-secret-password';
ALTER USER dataqualityfilter WITH PASSWORD 'my-super-secret-password';
GRANT CONNECT ON DATABASE dataqualityfilter TO dataqualityfilter;
GRANT CREATE ON DATABASE dataqualityfilter TO dataqualityfilter;

\connect dataqualityfilter;

GRANT ALL ON SCHEMA public TO dataqualityfilter;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO dataqualityfilter;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO dataqualityfilter;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO dataqualityfilter;

-- Upstream initial.sql (Liquibase changeset 1) runs ALTER ... OWNER TO "data-quality".
-- The app user must be a member of that role, and the role needs CREATE on public.
CREATE ROLE "data-quality" NOLOGIN;
GRANT "data-quality" TO dataqualityfilter;
GRANT ALL ON SCHEMA public TO "data-quality";

