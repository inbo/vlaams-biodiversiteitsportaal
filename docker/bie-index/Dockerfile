ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=fix-admin-index-page
ARG SOURCE=https://github.com/StefanVanDyck/bie-index.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

FROM tomcat-base

ARG VERSION=3.1.0

COPY --from=builder /project/build/libs/bie-index-${VERSION}-plain.war ${CATALINA_HOME}/webapps/bie-index.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1