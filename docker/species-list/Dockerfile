# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG VERSION=develop-vbp
ARG COMMIT=c353fd4940dfe06853311997f2692affec822998
ARG SOURCE=https://github.com/inbo/specieslist-webapp.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

RUN ls -la /project/build/libs

FROM tomcat-base

ARG VERSION=5.3.0-SNAPSHOT
ARG COMMIT=c353fd4940dfe06853311997f2692affec822998
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/specieslist-webapp-${VERSION}-plain.war ${CATALINA_HOME}/webapps/species-list.war
COPY species-list.xml ${CATALINA_HOME}/conf/portal/localhost/species-list.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/config/species-list/i18n/crowdin /opt/atlas/i18n/specieslist-webapp \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/config/species-list/i18n/override /var/opt/atlas/i18n/specieslist-webapp

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/species-list/actuator/health || exit 1