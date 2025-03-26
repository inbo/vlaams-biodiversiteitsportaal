# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG VERSION=poc-rbac
ARG COMMIT=12f95580312a5c5f5b9ad49f02131eff68120e4b
ARG SOURCE=https://github.com/StefanVanDyck/biocache-hubs.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project/biocache-hubs
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build publishToMavenLocal \
    -x test

ARG VERSION=develop
ARG COMMIT=8af1cfe2a61e39ba69f8ee534d32e20a36acfc7f
ARG SOURCE=https://github.com/inbo/ala-hub.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project/ala-hub
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

# # TODO: ugly fix for config values being overwritten by ala defaults
RUN sed -i '10d' grails-app/conf/application.yml
RUN cat grails-app/conf/application.yml

# TODO: Fix explore your area not loading properly because of global
COPY alaBs.js ./grails-app/assets/javascripts/alaBs.js

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=7.1.1
ARG COMMIT=6a473fbb17deeebcadecc28dbe3d0b05740816f5
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/ala-hub/build/libs/ala-hub-${VERSION}-plain.war ${CATALINA_HOME}/webapps/biocache-hub.war
COPY biocache-hub.xml ${CATALINA_HOME}/conf/portal/localhost/biocache-hub.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/config/biocache-hub/i18n/downloads-plugin/crowdin /opt/atlas/i18n/downloads-plugin \
  && ln -s /config/config/biocache-hub/i18n/crowdin /opt/atlas/i18n/biocache-hubs \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/config/biocache-hub/i18n/downloads-plugin/override /var/opt/atlas/i18n/downloads-plugin \
  && ln -s /config/config/biocache-hub/i18n/override /var/opt/atlas/i18n/biocache-hubs

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/biocache-hub/actuator/health || exit 1