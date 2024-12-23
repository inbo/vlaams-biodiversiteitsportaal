ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

#ARG VERSION=2.1.0
#ARG SOURCE=https://github.com/AtlasOfLivingAustralia/spatial-hub.git
#LABEL ala.version=${VERSION}

ARG VERSION=fix-setting-language-in-spatial-portal
ARG COMMIT=50a19013e5e0c20d279d3c6f7654a0ebed4f3e44
ARG SOURCE=https://github.com/StefanVanDyck/spatial-hub.git
LABEL ala.version=inbo-${COMMIT}

RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get -y install --no-install-recommends \
    npm

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml
COPY ./layouts/* ./grails-app/views/layouts/
COPY ./assets/images/icon_flanders.png ./grails-app/assets/images/icon_contextual-layer.png
COPY ./assets/images/icon_flanders.png ./grails-app/assets/images/icon_wms-layer.png

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=2.1.2-SNAPSHOT
ARG COMMIT=50a19013e5e0c20d279d3c6f7654a0ebed4f3e44
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/project-${VERSION}-plain.war ${CATALINA_HOME}/webapps/spatial-hub.war
COPY spatial-hub.xml ${CATALINA_HOME}/conf/portal/localhost/spatial-hub.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/config/spatial-hub/i18n/crowdin /opt/atlas/i18n/spatial-hub \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/config/spatial-hub/i18n/override /var/opt/atlas/i18n/spatial-hub

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/spatial-hub/actuator/health || exit 1