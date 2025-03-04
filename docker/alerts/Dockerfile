# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

#ARG VERSION=4.2.1
#ARG SOURCE=https://github.com/AtlasOfLivingAustralia/alerts.git

ARG VERSION=develop
ARG COMMIT=aa7df1bbf477137cda448d79ca96f6b8556d6730
ARG SOURCE=https://github.com/StefanVanDyck/alerts.git

LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=4.4.0-SNAPSHOT

LABEL ala.version=${VERSION}

COPY --from=builder /project/build/libs/alerts-${VERSION}-plain.war ${CATALINA_HOME}/webapps/alerts.war
COPY alerts.xml ${CATALINA_HOME}/conf/portal/localhost/alerts.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/config/alerts/i18n/crowdin /opt/atlas/i18n/alerts \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/config/alerts/i18n/override /var/opt/atlas/i18n/alerts

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/alerts/actuator/health || exit 1
