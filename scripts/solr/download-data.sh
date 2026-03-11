#!/usr/bin/env bash

NUMBER_OF_RECORDS=10000
SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

curl -L -o "${SCRIPT_DIR}/data_raw.csv" "http://localhost:8983/solr/biocache/select?q=*%3A*&wt=csv&indent=true&rows=${NUMBER_OF_RECORDS}"

mlr --csv cut -x -f geohash,location,packedQuad,quad "${SCRIPT_DIR}/data_raw.csv" > "${SCRIPT_DIR}/data.csv"
