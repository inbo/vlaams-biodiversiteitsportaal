# syntax=docker/dockerfile:1.14.0
FROM biocache-service

RUN rm ${CATALINA_HOME}/conf/portal/localhost/biocache-service.xml \
    && mv ${CATALINA_HOME}/webapps/biocache-service.war ${CATALINA_HOME}/webapps/sandbox.war
COPY sandbox.xml ${CATALINA_HOME}/conf/portal/localhost/sandbox.xml
