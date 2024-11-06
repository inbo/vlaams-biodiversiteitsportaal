ARG BUILDPLATFORM=linux/amd64
######################################### ALERTS #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS alerts-builder
ARG ALERTS_VERSION=4.2.1

WORKDIR /project
RUN git clone --branch ${ALERTS_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/alerts.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        --parallel

RUN ls -la /project/build/libs/

######################################### BIE HUB #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS bie-hub-builder
ARG BIE_HUB_VERSION=4.1.0

WORKDIR /project
RUN git clone --branch ${BIE_HUB_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/ala-bie-hub.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

######################################### BIE SERVICE #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS bie-index-builder

ARG BIE_INDEX_VERSION=3.1.0

WORKDIR /project
RUN git clone --branch ${BIE_INDEX_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/bie-index.git /project

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

######################################### BIOCACHE HUB #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS biocache-hub-builder

ARG BIOCACHE_HUB_VERSION=7.0.0

WORKDIR /project
RUN git clone --branch ${BIOCACHE_HUB_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/ala-hub.git /project

# TODO: ugly fix for config values being overwritten by ala defaults
RUN sed -i '10d' grails-app/conf/application.yml
RUN cat grails-app/conf/application.yml

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

######################################### BIOCACHE SERVICE #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS biocache-service-builder

ARG BIOCACHE_SERVICE_VERSION=3.4.1

WORKDIR /project
RUN git clone --branch ${BIOCACHE_SERVICE_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/biocache-service.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test \
    --parallel

######################################### COLLECTORY #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS collectory-builder

ARG COLLECTORY_VERSION=develop

WORKDIR /project
RUN git clone --branch ${COLLECTORY_VERSION} --depth 1 https://github.com/StefanVanDyck/collectory /project

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

######################################### DOI SERVICE #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS doi-service-builder

ARG DOI_SERVICE_VERSION=4.0.0

WORKDIR /project
RUN git clone --branch ${DOI_SERVICE_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/doi-service.git /project

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test \
    --parallel


RUN ls -la /project/build/libs/

######################################### IMAGE SERVICE #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS image-service-builder

ARG IMAGE_SERVICE_VERSION=3.0.0
WORKDIR /project
RUN git clone --branch v${IMAGE_SERVICE_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/image-service.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assetCompile assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

######################################### LOGGER SERVICE #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS logger-service-builder

ARG LOGGER_SERVICE_VERSION=4.3
WORKDIR /project
RUN git clone --branch v${LOGGER_SERVICE_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/logger-service.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

######################################### REGIONS #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS regions-builder

ARG REGIONS_VERSION=4.0.0
WORKDIR /project
RUN git clone --branch ${REGIONS_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/regions.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assetCompile assemble --no-daemon \
    -x test \
    --parallel

######################################### SPATIAL HUB #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS spatial-hub-builder

RUN apt-get update && apt-get -y install \
    npm

ARG SPATIAL_HUB_VERSION=2.1.0

WORKDIR /project
RUN git clone --branch ${SPATIAL_HUB_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/spatial-hub.git /project

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        --parallel

######################################### SPATIAL SERVICE #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS spatial-service-builder

ARG SPATIAL_SERVICE_VERSION=fix-bbox-from-geoserver

WORKDIR /project
RUN git clone --branch ${SPATIAL_SERVICE_VERSION} --depth 1 https://github.com/StefanVanDyck/spatial-service.git /project

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        --parallel

######################################### SPECIES LIST #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS species-list-builder

ARG SPECIES_LIST_VERSION=4.5.3

WORKDIR /project
RUN git clone --branch ${SPECIES_LIST_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/specieslist-webapp.git /project
# COPY ./i18n/ ./grails-app/i18n/
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel


########################################## APIKEY #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS apikey-builder

ARG APIKEY_VERSION=1.7.0

WORKDIR /project
RUN git clone --branch ${APIKEY_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/apikey.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
   gradle build assemble --no-daemon \
   -x test -x integrationTest \
   --parallel

RUN ls -la /project/build/libs/

########################################## USERDETAILS #########################################
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS userdetails-builder

ARG USERDETAILS_VERSION=3.0.3

WORKDIR /project
RUN git clone --branch v${USERDETAILS_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/userdetails.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel


RUN ls -la /project/build/libs/

######################################### TOMCAT SERVER #########################################
FROM tomcat:9.0-jdk11-openjdk

ARG ALERTS_VERSION=4.2.1
ARG BIE_HUB_VERSION=4.1.0
ARG BIE_INDEX_VERSION=3.1.0
ARG BIOCACHE_HUB_VERSION=7.0.0
ARG BIOCACHE_SERVICE_VERSION=3.4.1
ARG COLLECTORY_VERSION=5.2.0-SNAPSHOT
ARG DOI_SERVICE_VERSION=4.0.0
ARG LOGGER_SERVICE_VERSION=4.3
ARG IMAGE_SERVICE_VERSION=3.0.0
ARG REGIONS_VERSION=4.0.0
ARG SPATIAL_HUB_VERSION=2.1.0
ARG SPATIAL_SERVICE_VERSION=2.1.6-SNAPSHOT
ARG SPECIES_LIST_VERSION=4.5.3
ARG APIKEY_VERSION=1.7.0
ARG USERDETAILS_VERSION=3.0.3

COPY --from=alerts-builder \
    /project/build/libs/alerts-${ALERTS_VERSION}-plain.war ${CATALINA_HOME}/webapps/alerts.war
COPY --from=bie-hub-builder \
    /project/build/libs/ala-bie-hub-${BIE_HUB_VERSION}-plain.war ${CATALINA_HOME}/webapps/bie-hub.war
COPY --from=bie-index-builder \
    /project/build/libs/bie-index-${BIE_INDEX_VERSION}-plain.war ${CATALINA_HOME}/webapps/bie-index.war
COPY --from=biocache-hub-builder \
    /project/build/libs/ala-hub-${BIOCACHE_HUB_VERSION}-plain.war ${CATALINA_HOME}/webapps/biocache-hub.war
COPY --from=biocache-service-builder \
    /project/build/libs/biocache-service-${BIOCACHE_SERVICE_VERSION}.war ${CATALINA_HOME}/webapps/biocache-service.war
COPY --from=collectory-builder \
    /project/build/libs/collectory-${COLLECTORY_VERSION}-plain.war ${CATALINA_HOME}/webapps/collectory.war
COPY --from=doi-service-builder \
    /project/build/libs/doi-service-${DOI_SERVICE_VERSION}-plain.war ${CATALINA_HOME}/webapps/doi-service.war
COPY --from=logger-service-builder \
    /project/build/libs/logger-service-${LOGGER_SERVICE_VERSION}-plain.war ${CATALINA_HOME}/webapps/logger.war
COPY --from=image-service-builder \
    /project/build/libs/image-service-${IMAGE_SERVICE_VERSION}-plain.war ${CATALINA_HOME}/webapps/image-service.war
COPY --from=regions-builder \
    /project/build/libs/regions-${REGIONS_VERSION}-plain.war ${CATALINA_HOME}/webapps/regions.war
COPY --from=spatial-hub-builder \
    /project/build/libs/project-${SPATIAL_HUB_VERSION}-plain.war ${CATALINA_HOME}/webapps/spatial-hub.war
COPY --from=spatial-service-builder \
    /project/build/libs/project-${SPATIAL_SERVICE_VERSION}-plain.war ${CATALINA_HOME}/webapps/spatial-service.war
COPY --from=species-list-builder \
    /project/build/libs/specieslist-webapp-${SPECIES_LIST_VERSION}-plain.war ${CATALINA_HOME}/webapps/species-list.war
COPY --from=apikey-builder \
   /project/build/libs/apikey-${APIKEY_VERSION}-plain.war ${CATALINA_HOME}/webapps/apikey.war
COPY --from=userdetails-builder \
    /project/build/libs/userdetails-${USERDETAILS_VERSION}-plain.war ${CATALINA_HOME}/webapps/userdetails/userdetails.war

COPY conf ${CATALINA_HOME}/conf

# Create the user
ENV UID 1000
ENV GID 1000
RUN groupadd --gid ${GID} tomcat \
    && useradd --uid ${UID} --gid ${GID} -m -d /tomcat tomcat

RUN mkdir /data
RUN chown tomcat:tomcat /data
VOLUME /data

COPY docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]