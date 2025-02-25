#!/usr/bin/env bash
set -e -o pipefail

SERVICE_NAME=${1:?First argument "service name" must be provided}
JAR_LOCATION=${2:?Second argument "jar location" must be provided}


docker cp "${JAR_LOCATION}" docker-portal-full-1:/usr/local/tomcat/webapps/${SERVICE_NAME}.war
curl -u stefan:stefan \
  "http://localhost:8080/manager/text/reload?path=/${SERVICE_NAME}"
