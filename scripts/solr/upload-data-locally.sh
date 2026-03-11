#!/usr/bin/env bash

docker exec docker-solr-1 solr post -c biocache /var/solr/init/docker/solr-scripts/data.csv
