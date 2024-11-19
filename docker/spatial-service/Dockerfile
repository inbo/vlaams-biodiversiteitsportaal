ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

# ARG VERSION=2.1.5
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/spatial-service.git

ARG VERSION=vbp-develop
ARG SOURCE=https://github.com/StefanVanDyck/spatial-service.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/


ENV GRADLE_RO_DEP_CACHE=/gradle-cache

RUN --mount=type=cache,target=/gradle-cache,ro \
    ls -la /gradle-cache && \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        --parallel


FROM tomcat-base

RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    gettext-base \
    gdal-bin

# ARG VERSION=2.1.5
ARG VERSION=2.1.6-SNAPSHOT
COPY --from=builder /project/build/libs/project-${VERSION}-plain.war ${CATALINA_HOME}/webapps/spatial-service.war
COPY spatial-service.xml ${CATALINA_HOME}/conf/portal/localhost/spatial-service.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/spatial-service/actuator/health || exit 1