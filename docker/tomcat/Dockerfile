######################################### TOMCAT BASE #########################################
FROM tomcat:9-jdk11-corretto AS base

WORKDIR ${CATALINA_HOME}

RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum update -y && \
    yum install -y \
        shadow-utils \
        util-linux

# Default user and group id
ENV UID=1000
ENV GID=1000

RUN mkdir /data
RUN chown ${UID}:${GID} /data
VOLUME /data

COPY docker-entrypoint.sh /docker-entrypoint.sh

COPY conf conf
# Folder container the context xml configs for every service
RUN mkdir -p ${CATALINA_HOME}/conf/portal/localhost

ENTRYPOINT ["/docker-entrypoint.sh"]

######################################### PORTAL FULL #########################################
# Start from spatial-service as that image has a bunch of additional dependencies installed
FROM spatial-service AS portal

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
# Second instance of biocache-service for user sandbox
RUN ln -s ./biocache-service.war webapps/sandbox.war

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

# Symlink to i18n files location (for loop for standard naming, additional special cases at the end)
RUN sh -x \
    && mkdir -p /opt/atlas/i18n \
    && mkdir -p /var/opt/atlas/i18n \
    && for service in alerts apikey bie-index biocache-service collectory doi-service image-service logger regions spatial-hub spatial-service userdetails; do \
            ln -s /config/config/${service}/i18n/crowdin /opt/atlas/i18n/${service}; \
            ln -s /config/config/${service}/i18n/override /var/opt/atlas/i18n/${service}; \
        done \
    && ln -s /config/config/bie-hub/i18n/crowdin /opt/atlas/i18n/bie-plugin \
    && ln -s /config/config/bie-hub/i18n/override /var/opt/atlas/i18n/bie-plugin \
    && ln -s /config/config/biocache-hub/i18n/crowdin /opt/atlas/i18n/biocache-hubs \
    && ln -s /config/config/biocache-hub/i18n/override /var/opt/atlas/i18n/biocache-hubs \
    && ln -s /config/config/collectory/i18n/crowdin /opt/atlas/i18n/collectory-plugin \
    && ln -s /config/config/collectory/i18n/override /var/opt/atlas/i18n/collectory-plugin \
    && ln -s /config/config/biocache-hub/i18n/downloads-plugin/crowdin /opt/atlas/i18n/downloads-plugin \
    && ln -s /config/config/biocache-hub/i18n/downloads-plugin/override /var/opt/atlas/i18n/downloads-plugin \
    && ln -s /config/config/species-list/i18n/crowdin /opt/atlas/i18n/specieslist-webapp \
    && ln -s /config/config/species-list/i18n/override /var/opt/atlas/i18n/specieslist-webapp