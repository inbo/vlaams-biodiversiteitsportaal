######################################### TOMCAT BASE #########################################
FROM tomcat:9-jdk11-corretto AS base

RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    amazon-linux-extras install epel -y && \
    yum update -y && \
    yum -y install --skip-broken \
    shadow-utils \
    util-linux \
    # Spatial-service dependencies \
    gettext \
    unzip

# Install GDAL using self built RPMs (check rpm folder in spatial-service docker for script used to generate them)
ARG PROJ_VERSION=6.1.1
ARG GDAL_VERSION=3.2.1
ARG TARGETARCH
RUN yum -y install https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/spatial-service/gdal/proj-${PROJ_VERSION}-1.amzn2.$TARGETARCH.rpm &&\
    yum -y install https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/spatial-service/gdal/gdal-${GDAL_VERSION}-1.amzn2.$TARGETARCH.rpm

# Default user and group id
ENV UID=1000
ENV GID=1000

WORKDIR ${CATALINA_HOME}

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
    && for service in alerts apikey bie-index biocache-service collectory image-service logger regions spatial-hub spatial-service; do \
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
RUN ln -s ./biocache-hub webapps/sandbox-hub
COPY --from=biocache-service /biocache-service.war webapps
RUN ln -s ./biocache-service webapps/sandbox-service
COPY --from=collectory /collectory.war webapps
COPY --from=data-quality-filter-service /data-quality-filter-service.war webapps
COPY --from=image-service /image-service.war webapps
COPY --from=logger /logger.war webapps
COPY --from=regions /regions.war webapps
COPY --from=spatial-hub /spatial-hub.war webapps
COPY --from=spatial-service /spatial-service.war webapps
COPY --from=spatial-service /opt/vbp /opt/vbp
COPY --from=species-list /species-list.war webapps

ENTRYPOINT ["/docker-entrypoint.sh"]
