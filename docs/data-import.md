# VBP data import cloud > local 

The instruction is only for RDS databases: Postgis, Mysql. To use Solr locally, look up solr - port forwarding in our readmes

## Prerequisites

Locally: AWS CLI, Postgres client, Mysql client

# Postgres

## Start aws ssm port forwarding session (5432 : 5432)

```aws ssm start-session --target i-07e277627de2a0145 --document-name AWS-StartPortForwardingSessionToRemoteHost --profile inbo-dev --region eu-west-1 --parameters host="tf-20240617092958781900000003.ccdv8uvkk6xd.eu-west-1.rds.amazonaws.com",portNumber=5432,localPortNumber=5432```

### parameters explained: 


* --target: bastion ID, look up in EC2 section of the environment
* --profile: profile for the current AWS environment (dev, uat..)
* --parameters, host: the database endpoint (RDS)

## Execute pg_dump for each VBP Postgis database

```
for each database in ('dataqualityfilter', 'doi', 'images', 'layersdb')
$ ./pg_dump --host=localhost --port=5432 --username=root --password <insert pwd> {database} > ~/Work/INBO/data_import/postgres/{database}_pgdump.sql
```

### parameters explained:

* --password: postgres secret to find in Secrets Manager
* dump file path: obviously can be anywhere locally

## close AWS SSM session

(simply terminate the process)

## startup postgres container 

```
cd vlaams-biodiversiteitsportaal/docker
docker-compose -f docker-compose.yaml up postgres
```

## execute postgres data import from dumpfiles

```
for each database in ('dataqualityfilter', 'doi', 'images', 'layersdb')
$ sed -i -e 's/spatial_service/spatial/' /Users/katyashaleninova/Work/INBO/data_import/postgres/layersdb_pgdump.sql #only for spatial 
$ psql --host=localhost --port=5432 --username=postgres —password my-super-secret-password -d {database} -f {datbase}_pgdump.sql
```

### script explained
Because of historical reasons, for some databases local db users' name differs from the one used in AWS. For instance: 
AWS: **spatial_service**; 
Local docker container: **spatial**. 
Therefore we update the username from 'spatial_service' to 'spatial' in the dump script with 'sed' utility.

# Postgres done

# Mysql

## Open aws ssm port forwarding session 3306:3306

```
aws ssm start-session --target i-07e277627de2a0145 --document-name AWS-StartPortForwardingSessionToRemoteHost --profile inbo-dev --region eu-west-1 --parameters host="tf-20240617092952449400000002.ccdv8uvkk6xd.eu-west-1.rds.amazonaws.com",portNumber=3306,localPortNumber=3306
```

## Execute mysql_dump on each VBP Mysql database

```
$cd /usr/local/opt/mysql-client/bin # mysql client - download it or install with e.g. brew install mysql-client
for each database in ('apikey', 'cas', 'collectory', 'specieslists')
$ ./mysqldump -h 0.0.0.0 -u root -p --databases {database} > ~/Work/INBO/data_import/mysql/{database}_mysqldump.sql
```

### parameters explained:

* --password: postgres secret to find in Secrets Manager
* dump file path: obviously can be anywhere locally

## close AWS SSM session

## startup Mysql container

```
for each database in ('apikey', 'cas', 'collectory', 'specieslists')
$ sed -i -e 's|CREATE DATABASE \/\*\!32312 IF NOT EXISTS\*\/|CREATE DATABASE IF NOT EXISTS|' /Users/katyashaleninova/Work/INBO/data_import/mysql/{database}_mysqldump.sql
$./mysql -h 0.0.0.0 -u root -p {database} < ~/Work/INBO/data_import/mysql/{database}_mysqldump.sql
```
### script explained
The dump script contains the following statement:
```
CREATE DATABASE /* !32312 IF NOT EXISTS */
```
'IF NOT EXISTS' is commented out, we have to un-comment it. 
The database is already created in the local container (at startup), therefore creating it again would give an error and fail the script.
un-comment the 'IF NOT EXISTS' with 'sed' utility.

## Mysql done
