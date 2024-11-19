ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=2.1.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/spatial-hub.git

RUN apt-get update && apt-get -y install \
    npm

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/
COPY ./layouts/* ./grails-app/views/layouts/

RUN --mount=type=cache,target=/home/gradle/.gradle/caches,sharing=locked \
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