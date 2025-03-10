# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


# ARG VERSION=4.0.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/regions.git

ARG VERSION=develop-vbp
ARG COMMIT=9ada379ea7b9effacac6a1b8caf7e526c9b89057
ARG SOURCE=https://github.com/StefanVanDyck/regions.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assetCompile assemble \
    -x test

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

# ARG VERSION=4.0.0
ARG VERSION=4.1.0-SNAPSHOT
ARG COMMIT=1e599e807db00ed615f398d0812eafa75271f5ed
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/regions-${VERSION}-plain.war ${CATALINA_HOME}/webapps/regions.war
COPY regions.xml ${CATALINA_HOME}/conf/portal/localhost/regions.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/config/regions/i18n/crowdin /opt/atlas/i18n/regions \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/config/regions/i18n/override /var/opt/atlas/i18n/regions

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/regions/actuator/health || exit 1