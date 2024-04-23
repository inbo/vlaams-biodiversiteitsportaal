CREATE DATABASE specieslists;
CREATE USER species IDENTIFIED BY 'my-super-secret-password';
GRANT ALL PRIVILEGES ON specieslists . * TO 'species';
