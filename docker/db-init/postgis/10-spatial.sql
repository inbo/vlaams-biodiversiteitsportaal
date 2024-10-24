CREATE USER spatial WITH PASSWORD 'my-super-secret-password';
ALTER USER spatial WITH PASSWORD 'my-super-secret-password';

GRANT spatial TO postgres;

CREATE DATABASE layersdb OWNER spatial;

GRANT ALL PRIVILEGES ON DATABASE layersdb TO spatial;

\connect layersdb;

-- Enable PostGIS (includes raster)
CREATE EXTENSION postgis;
-- Enable Topology
CREATE EXTENSION postgis_topology;

GRANT ALL ON SCHEMA public TO spatial;
GRANT ALL ON SCHEMA topology TO spatial;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO spatial;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO spatial;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO spatial;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA topology TO spatial;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA topology TO spatial;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA topology TO spatial;
