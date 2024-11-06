######################################### TOMCAT BASE #########################################
FROM tomcat:9.0-jdk11-openjdk AS base

WORKDIR ${CATALINA_HOME}

# Create the user
ENV UID=1000
ENV GID=1000
RUN groupadd --gid ${GID} tomcat \
    && useradd --uid ${UID} --gid ${GID} -m -d /tomcat tomcat

RUN mkdir /data
RUN chown tomcat:tomcat /data
VOLUME /data

COPY docker-entrypoint.sh /docker-entrypoint.sh

COPY conf conf
# Folder container the context xml configs for every service
RUN mkdir -p ${CATALINA_HOME}/conf/portal/localhost

ENTRYPOINT ["/docker-entrypoint.sh"]

######################################### PORTAL FULL #########################################
FROM base AS portal

COPY --from=alerts ${CATALINA_HOME}/webapps webapps
COPY --from=alerts ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=apikey ${CATALINA_HOME}/webapps webapps
COPY --from=apikey ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=bie-hub ${CATALINA_HOME}/webapps webapps
COPY --from=bie-hub ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=bie-index ${CATALINA_HOME}/webapps webapps
COPY --from=bie-index ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=biocache-hub ${CATALINA_HOME}/webapps webapps
COPY --from=biocache-hub ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=biocache-service ${CATALINA_HOME}/webapps webapps
COPY --from=biocache-service ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=collectory ${CATALINA_HOME}/webapps webapps
COPY --from=collectory ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=doi-service ${CATALINA_HOME}/webapps webapps
COPY --from=doi-service ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=image-service ${CATALINA_HOME}/webapps webapps
COPY --from=image-service ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=logger ${CATALINA_HOME}/webapps webapps
COPY --from=logger ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=regions ${CATALINA_HOME}/webapps webapps
COPY --from=regions ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=spatial-hub ${CATALINA_HOME}/webapps webapps
COPY --from=spatial-hub ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=spatial-service ${CATALINA_HOME}/webapps webapps
COPY --from=spatial-service ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=species-list ${CATALINA_HOME}/webapps webapps
COPY --from=species-list ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost

COPY --from=userdetails ${CATALINA_HOME}/webapps webapps
COPY --from=userdetails ${CATALINA_HOME}/conf/portal/localhost conf/portal/localhost
