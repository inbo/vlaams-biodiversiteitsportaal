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

# Symlink to i18n files location (for loop for standard naming, additional special cases at the end)
RUN sh -x \
    && mkdir -p /opt/atlas/i18n \
    && mkdir -p /var/opt/atlas/i18n \
    && for service in alerts apikey bie-index biocache-service collectory doi-service image-service logger regions spatial-hub spatial-service userdetails; do \
            ln -s /config/${service}/i18n/crowdin /opt/atlas/i18n/${service}; \
            ln -s /config/${service}/i18n/override /var/opt/atlas/i18n/${service}; \
        done \
    && ln -s /config/bie-hub/i18n/crowdin /opt/atlas/i18n/bie-plugin \
    && ln -s /config/bie-hub/i18n/override /var/opt/atlas/i18n/bie-plugin \
    && ln -s /config/biocache-hub/i18n/crowdin /opt/atlas/i18n/biocache-hubs \
    && ln -s /config/biocache-hub/i18n/override /var/opt/atlas/i18n/biocache-hubs \
    && ln -s /config/collectory/i18n/crowdin /opt/atlas/i18n/collectory-plugin \
    && ln -s /config/collectory/i18n/override /var/opt/atlas/i18n/collectory-plugin \
    && ln -s /config/biocache-hub/i18n/downloads-plugin/crowdin /opt/atlas/i18n/downloads-plugin \
    && ln -s /config/biocache-hub/i18n/downloads-plugin/override /var/opt/atlas/i18n/downloads-plugin \
    && ln -s /config/species-list/i18n/crowdin /opt/atlas/i18n/specieslist-webapp \
    && ln -s /config/species-list/i18n/override /var/opt/atlas/i18n/specieslist-webapp

COPY --from=alerts /alerts.war webapps
COPY --from=apikey /apikey.war webapps
COPY --from=bie-hub /bie-hub.war webapps
COPY --from=bie-index /bie-index.war webapps
COPY --from=biocache-hub /biocache-hub.war webapps
COPY --from=biocache-service /biocache-service.war webapps
RUN ln -s ./biocache-service.war webapps/sandbox.war
COPY --from=collectory /collectory.war webapps
COPY --from=doi-service /doi-service.war webapps
COPY --from=image-service /image-service.war webapps
COPY --from=logger /logger.war webapps
COPY --from=regions /regions.war webapps
COPY --from=spatial-hub /spatial-hub.war webapps
COPY --from=spatial-service /spatial-service.war webapps
COPY --from=species-list /species-list.war webapps
COPY --from=userdetails /userdetails.war webapps

ENTRYPOINT ["/docker-entrypoint.sh"]
