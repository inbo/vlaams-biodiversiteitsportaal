# Local development image: many services in one Tomcat 9 (javax.servlet) to save memory.
#
# Two targets share this file:
#   portal-full        Java 21: every war that starts on Java 21
#   portal-full-jdk17  Java 17: the Grails 6 wars whose Groovy 3.0.11 compiles config at runtime
#                      and fails on Java 21 class files (apikey, regions, species-list, biocache-hub)
# alerts (Grails 7, jakarta.servlet) needs Tomcat 10.1 and runs from its own image.

ARG TOMCAT_IMAGE=tomcat:9.0.120-jdk21-corretto
ARG RUNTIME_IMAGE=amazoncorretto:21.0.13-al2023-headless

FROM ${TOMCAT_IMAGE} AS tomcat

######################################### TOMCAT BASE #########################################
FROM ${RUNTIME_IMAGE} AS base

## trivy:ignore:DS-0015  # using BuildKit dnf cache
RUN --mount=type=cache,target=/var/cache/dnf,sharing=locked \
    dnf -y install \
    shadow-utils \
    util-linux \
    procps-ng \
    findutils \
    gettext \
    tar \
    unzip \
    # socat: forwards localhost:80 to nginx, see LOCALHOST_PROXY_TARGET in docker-entrypoint.sh
    socat

# Tomcat distribution only; the JVM comes from the Corretto runtime image (same patch level as the individual images).
# The native (APR) library of the official image is built for Amazon Linux 2 and is not used.
ENV CATALINA_HOME=/usr/local/tomcat
ENV PATH=${CATALINA_HOME}/bin:${PATH}
COPY --from=tomcat ${CATALINA_HOME} ${CATALINA_HOME}
RUN rm -rf ${CATALINA_HOME}/native-jni-lib ${CATALINA_HOME}/webapps ${CATALINA_HOME}/webapps.dist \
    && mkdir ${CATALINA_HOME}/webapps

ENV UID=1000
ENV GID=1000
RUN groupadd --gid ${GID} tomcat-users && useradd --no-create-home --gid ${GID} --uid ${UID} tomcat-user

WORKDIR ${CATALINA_HOME}

RUN mkdir /data /cache && chown ${UID}:${GID} /data /cache
VOLUME /data
VOLUME /cache

COPY docker-entrypoint.sh /docker-entrypoint.sh
COPY setenv.sh ${CATALINA_HOME}/bin/setenv.sh

COPY conf conf
# Folder containing the context xml configs for every service
RUN mkdir -p ${CATALINA_HOME}/conf/portal/localhost

# Symlink to i18n files location (for loop for standard naming, additional special cases at the end)
RUN sh -x \
    && mkdir -p /opt/atlas/i18n \
    && mkdir -p /var/opt/atlas/i18n \
    && for service in apikey bie-index biocache-service collectory image-service logger regions spatial-hub spatial-service; do \
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

ENTRYPOINT ["/docker-entrypoint.sh"]

######################################### JAVA 21 #########################################
FROM base AS portal-full

# GDAL/PROJ for spatial-service (same packages as docker/spatial-service).
# Java 17 for the spatial-service sandbox: pipelines.jar (Spark 3.4) does not run on Java 21,
# see pipelinesCmd in config/common/common-docker.yml. Tomcat itself runs on JAVA_HOME (21).
## trivy:ignore:DS-0015  # using BuildKit dnf cache
RUN --mount=type=cache,target=/var/cache/dnf,sharing=locked \
    dnf -y install \
    gdal310 \
    java-17-amazon-corretto-headless \
    && /usr/lib/jvm/jre-17/bin/java -version \
    && java -version 2>&1 | grep -q '"21\.'

COPY --from=bie-hub /bie-hub.war webapps/
COPY --from=bie-index /bie-index.war webapps/
COPY --from=biocache-service /biocache-service.war webapps/
RUN ln -s ./biocache-service webapps/sandbox-service
COPY --from=collectory /collectory.war webapps/
COPY --from=data-quality-filter-service /data-quality-filter-service.war webapps/
COPY --from=image-service /image-service.war webapps/
COPY --from=logger /logger.war webapps/
COPY --from=spatial-hub /spatial-hub.war webapps/
COPY --from=spatial-service /spatial-service.war webapps/
COPY --from=spatial-service /opt/vbp /opt/vbp

RUN cd conf/portal/localhost \
    && rm apikey.xml regions.xml species-list.xml biocache-hub.xml sandbox-hub.xml \
    && chown -R ${UID}:${GID} ${CATALINA_HOME}

USER ${UID}:${GID}

######################################### JAVA 17 #########################################
FROM base AS portal-full-jdk17

COPY --from=apikey /apikey.war webapps/
COPY --from=biocache-hub /biocache-hub.war webapps/
RUN ln -s ./biocache-hub webapps/sandbox-hub
COPY --from=regions /regions.war webapps/
COPY --from=species-list /species-list.war webapps/

RUN cd conf/portal/localhost \
    && ls | grep -vxE 'apikey.xml|biocache-hub.xml|sandbox-hub.xml|regions.xml|species-list.xml' | xargs rm \
    && chown -R ${UID}:${GID} ${CATALINA_HOME}

USER ${UID}:${GID}
