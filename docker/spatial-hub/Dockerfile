ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=2.1.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/spatial-hub.git
LABEL ala.version=${VERSION}

RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get -y install --no-install-recommends \
    npm

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY resources.xml ./grails-app/conf/spring/resources.xml
COPY ./layouts/* ./grails-app/views/layouts/


RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=2.1.0
LABEL ala.version=${VERSION}

COPY --from=builder /project/build/libs/project-${VERSION}-plain.war ${CATALINA_HOME}/webapps/spatial-hub.war
COPY spatial-hub.xml ${CATALINA_HOME}/conf/portal/localhost/spatial-hub.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n/spatial-hub \
  && ln -s /config/config/spatial-hub/i18n/crowdin /opt/atlas/i18n/spatial-hub/messages
RUN mkdir -p /var/opt/atlas/i18n/spatial-hub \
  && ln -s /config/config/spatial-hub/i18n/override /var/opt/atlas/i18n/spatial-hub/messages

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/spatial-hub/actuator/health || exit 1