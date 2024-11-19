ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=2.1.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/spatial-hub.git

RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get -y install --no-install-recommends \
    npm

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/
COPY ./layouts/* ./grails-app/views/layouts/


ENV GRADLE_RO_DEP_CACHE=/gradle-cache

RUN --mount=type=cache,target=/gradle-cache,ro \
    ls -la /gradle-cache && \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        --parallel


FROM tomcat-base

ARG VERSION=2.1.0
COPY --from=builder /project/build/libs/project-${VERSION}-plain.war ${CATALINA_HOME}/webapps/spatial-hub.war
COPY spatial-hub.xml ${CATALINA_HOME}/conf/portal/localhost/spatial-hub.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/spatial-hub/actuator/health || exit 1