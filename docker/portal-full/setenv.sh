#!/usr/bin/env sh
# Sourced by catalina.sh

# Resolve ${ENV_VAR} placeholders in the context xml files (conf/portal/localhost/*.xml),
# e.g. ${ADDITIONAL_SPRING_CONFIG_LOCATIONS} and ${GRAILS_ENV}, from the container environment.
CATALINA_OPTS="${CATALINA_OPTS} -Dorg.apache.tomcat.util.digester.PROPERTY_SOURCE=org.apache.tomcat.util.digester.EnvironmentPropertySource"

# Same as JAVA_RELECT_OPTS in the biocache-hub and image-service images
# (catalina.sh already opens java.lang, java.io, java.util and java.util.concurrent)
CATALINA_OPTS="${CATALINA_OPTS} --add-opens=java.base/java.lang.reflect=ALL-UNNAMED"
export CATALINA_OPTS
