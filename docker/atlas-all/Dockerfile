######################################### BIE HUB #########################################
FROM gradle:7-jdk11 AS bie-hub-builder
ARG BIE_HUB_VERSION=4.1.0

WORKDIR /project
RUN git clone --branch ${BIE_HUB_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/ala-bie-hub.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

######################################### BIE SERVICE #########################################
FROM gradle:7-jdk11 AS bie-index-builder

ARG BIE_INDEX_VERSION=3.1.0

WORKDIR /project
RUN git clone --branch ${BIE_INDEX_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/bie-index.git /project
# COPY ./i18n/ ./grails-app/i18n/
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

######################################### BIOCACHE HUB #########################################
FROM gradle:7-jdk11 AS biocache-hub-builder

ARG BIOCACHE_HUB_VERSION=7.0.0

WORKDIR /project
RUN git clone --branch ${BIOCACHE_HUB_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/ala-hub.git /project

# TODO: ugly fix for config values being overwritten by ala defaults
RUN sed -i '10d' grails-app/conf/application.yml
RUN cat grails-app/conf/application.yml

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

######################################### BIOCACHE SERVICE #########################################
FROM gradle:7-jdk11 AS biocache-service-builder

ARG BIOCACHE_SERVICE_VERSION=3.4.1

WORKDIR /project
RUN git clone --branch ${BIOCACHE_SERVICE_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/biocache-service.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

######################################### COLLECTORY #########################################
FROM gradle:7-jdk11 AS collectory-builder

ARG COLLECTORY_VERSION=develop

WORKDIR /project
RUN git clone --branch ${COLLECTORY_VERSION} --depth 1 https://github.com/StefanVanDyck/collectory /project
# COPY ./i18n/ ./grails-app/i18n/
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

######################################### IMAGE SERVICE #########################################
FROM gradle:7-jdk11 AS image-service-builder

ARG IMAGE_SERVICE_VERSION=3.0.0
WORKDIR /project
RUN git clone --branch v${IMAGE_SERVICE_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/image-service.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assetCompile assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

######################################### LOGGER SERVICE #########################################
FROM gradle:7-jdk11 AS logger-service-builder

ARG LOGGER_SERVICE_VERSION=4.3
WORKDIR /project
RUN git clone --branch v${LOGGER_SERVICE_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/logger-service.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

######################################### REGIONS #########################################
FROM gradle:7-jdk11 AS regions-builder

ARG REGIONS_VERSION=4.0.0
WORKDIR /project
RUN git clone --branch ${REGIONS_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/regions.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assetCompile assemble --no-daemon \
    -x test \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

######################################### SPATIAL HUB #########################################
FROM gradle:7-jdk11 AS spatial-hub-builder

RUN apt-get update && apt-get -y install \
    npm

ARG SPATIAL_HUB_VERSION=2.1.0

WORKDIR /project
RUN git clone --branch ${SPATIAL_HUB_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/spatial-hub.git /project
# COPY ./i18n/ ./grails-app/i18n/
# COPY ./layouts/* ./grails-app/views/layouts/

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
        --parallel

######################################### SPATIAL SERVICE #########################################
FROM gradle:7-jdk11 AS spatial-service-builder

ARG SPATIAL_SERVICE_VERSION=fix-bbox-from-geoserver

WORKDIR /project
RUN git clone --branch ${SPATIAL_SERVICE_VERSION} --depth 1 https://github.com/StefanVanDyck/spatial-service.git /project
# COPY ./i18n/ ./grails-app/i18n/

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
        --parallel

######################################### SPECIES LIST #########################################
FROM gradle:7-jdk11 AS species-list-builder

ARG SPECIES_LIST_VERSION=4.5.3

WORKDIR /project
RUN git clone --branch ${SPECIES_LIST_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/specieslist-webapp.git /project
# COPY ./i18n/ ./grails-app/i18n/
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel


########################################## CAS APIKEY #########################################
#FROM gradle:7-jdk11 AS cas-apikey-builder
#
#ARG CAS_APIKEY_VERSION=1.7.0
#
#WORKDIR /project
#RUN git clone --branch ${CAS_APIKEY_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/apikey.git /project
#RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
#    gradle build assemble --no-daemon \
#    -x test -x integrationTest \
#    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
#    --parallel
#
#RUN ls -la /project/build/libs/

########################################## USERDETAILS #########################################
FROM gradle:7-jdk11 AS userdetails-builder

ARG USERDETAILS_VERSION=3.0.3

WORKDIR /project
RUN git clone --branch v${USERDETAILS_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/userdetails.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel


RUN ls -la /project/build/libs/

######################################### TOMCAT SERVER #########################################
FROM tomcat:9.0-jdk11-openjdk

ARG BIE_HUB_VERSION=4.1.0
ARG BIE_INDEX_VERSION=3.1.0
ARG BIOCACHE_HUB_VERSION=7.0.0
ARG BIOCACHE_SERVICE_VERSION=3.4.1
ARG COLLECTORY_VERSION=5.2.0-SNAPSHOT
ARG LOGGER_SERVICE_VERSION=4.3
ARG IMAGE_SERVICE_VERSION=3.0.0
ARG REGIONS_VERSION=4.0.0
ARG SPATIAL_HUB_VERSION=2.1.0
ARG SPATIAL_SERVICE_VERSION=2.1.6-SNAPSHOT
ARG SPECIES_LIST_VERSION=4.5.3
ARG CAS_APIKEY_VERSION=1.7.0
ARG USERDETAILS_VERSION=3.0.3

COPY --from=bie-hub-builder \
    /project/build/libs/ala-bie-hub-${BIE_HUB_VERSION}-plain.war ${CATALINA_HOME}/webapps/bie-hub/ROOT.war
COPY --from=bie-index-builder \
    /project/build/libs/bie-index-${BIE_INDEX_VERSION}-plain.war ${CATALINA_HOME}/webapps/bie-index/ROOT.war
COPY --from=biocache-hub-builder \
    /project/build/libs/ala-hub-${BIOCACHE_HUB_VERSION}-plain.war ${CATALINA_HOME}/webapps/biocache-hub/ROOT.war
COPY --from=biocache-service-builder \
    /project/build/libs/biocache-service-${BIOCACHE_SERVICE_VERSION}.war ${CATALINA_HOME}/webapps/biocache-service/ROOT.war
COPY --from=collectory-builder \
    /project/build/libs/collectory-${COLLECTORY_VERSION}-plain.war ${CATALINA_HOME}/webapps/collectory/ROOT.war
COPY --from=logger-service-builder \
    /project/build/libs/logger-service-${LOGGER_SERVICE_VERSION}-plain.war ${CATALINA_HOME}/webapps/logger/ROOT.war
COPY --from=image-service-builder \
    /project/build/libs/image-service-${IMAGE_SERVICE_VERSION}-plain.war ${CATALINA_HOME}/webapps/imageservice/ROOT.war
COPY --from=regions-builder \
    /project/build/libs/regions-${REGIONS_VERSION}-plain.war ${CATALINA_HOME}/webapps/regions/ROOT.war
COPY --from=spatial-hub-builder \
    /project/build/libs/project-${SPATIAL_HUB_VERSION}-plain.war ${CATALINA_HOME}/webapps/spatial/ROOT.war
COPY --from=spatial-service-builder \
    /project/build/libs/project-${SPATIAL_SERVICE_VERSION}-plain.war ${CATALINA_HOME}/webapps/spatial/ws.war
COPY --from=species-list-builder \
    /project/build/libs/specieslist-webapp-${SPECIES_LIST_VERSION}-plain.war ${CATALINA_HOME}/webapps/species-list/ROOT.war
#COPY --from=cas-apikey-builder \
#    /project/build/libs/apikey-${CAS_APIKEY_VERSION}-plain.war ${CATALINA_HOME}/webapps/cas-apikey.war
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