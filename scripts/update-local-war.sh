#!/usr/bin/env bash
set -e -o pipefail

SERVICE_NAME=${1:?First argument "service name" must be provided}
JAR_LOCATION=${2:?Second argument "jar location" must be provided}

# Services in the Java 17 Tomcat (see docker/docker-compose.yaml), all others are in portal-full (Java 21)
case "${SERVICE_NAME}" in
  apikey|biocache-hub|regions|species-list)
    CONTAINER=docker-portal-full-jdk17-1
    PORT=8082
    ;;
  alerts)
    echo "alerts runs from its own image (docker-alerts-1), rebuild it instead" >&2
    exit 1
    ;;
  *)
    CONTAINER=docker-portal-full-1
    PORT=8080
    ;;
esac

# autoDeploy is on: replacing the war makes Tomcat redeploy it within ~10 seconds
docker cp "${JAR_LOCATION}" "${CONTAINER}:/usr/local/tomcat/webapps/${SERVICE_NAME}.war"
echo "Copied to ${CONTAINER}; follow the redeploy with: docker logs -f ${CONTAINER}"
echo "Manager: http://localhost:${PORT}/manager/html"
