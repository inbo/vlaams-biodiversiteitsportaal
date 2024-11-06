######################################### TOMCAT BASE #########################################
FROM tomcat:9.0-jdk11-openjdk AS base

# Create the user
ENV UID=1000
ENV GID=1000
RUN groupadd --gid ${GID} tomcat \
    && useradd --uid ${UID} --gid ${GID} -m -d /tomcat tomcat

RUN mkdir /data
RUN chown tomcat:tomcat /data
VOLUME /data

COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY conf ${CATALINA_HOME}/conf

ENTRYPOINT ["/docker-entrypoint.sh"]

######################################### PORTAL FULL #########################################
FROM base AS portal

COPY --from=alerts ${CATALINA_HOME}/webapps/alerts.war ${CATALINA_HOME}/webapps/alerts.war
COPY --from=apikey ${CATALINA_HOME}/webapps/apikey.war ${CATALINA_HOME}/webapps/apikey.war
COPY --from=bie-hub ${CATALINA_HOME}/webapps/bie-hub.war ${CATALINA_HOME}/webapps/bie-hub.war
COPY --from=bie-index ${CATALINA_HOME}/webapps/bie-index.war ${CATALINA_HOME}/webapps/bie-index.war
COPY --from=biocache-hub ${CATALINA_HOME}/webapps/biocache-hub.war ${CATALINA_HOME}/webapps/biocache-hub.war
COPY --from=biocache-service ${CATALINA_HOME}/webapps/biocache-service.war ${CATALINA_HOME}/webapps/biocache-service.war
COPY --from=collectory ${CATALINA_HOME}/webapps/collectory.war ${CATALINA_HOME}/webapps/collectory.war
COPY --from=doi-service ${CATALINA_HOME}/webapps/doi-service.war ${CATALINA_HOME}/webapps/doi-service.war
COPY --from=image-service ${CATALINA_HOME}/webapps/image-service.war ${CATALINA_HOME}/webapps/image-service.war
COPY --from=logger ${CATALINA_HOME}/webapps/logger.war ${CATALINA_HOME}/webapps/logger.war
COPY --from=regions ${CATALINA_HOME}/webapps/regions.war ${CATALINA_HOME}/webapps/regions.war
COPY --from=spatial-hub ${CATALINA_HOME}/webapps/spatial-hub.war ${CATALINA_HOME}/webapps/spatial-hub.war
COPY --from=spatial-service ${CATALINA_HOME}/webapps/spatial-service.war ${CATALINA_HOME}/webapps/spatial-service.war
COPY --from=species-list ${CATALINA_HOME}/webapps/species-list.war ${CATALINA_HOME}/webapps/species-list.war
COPY --from=userdetails ${CATALINA_HOME}/webapps/userdetails.war ${CATALINA_HOME}/webapps/userdetails.war
