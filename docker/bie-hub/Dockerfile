ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder


WORKDIR /project

# ARG VERSION=4.1.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-bie-hub.git

ARG VERSION=fix-search-page-not-showing-refine-results
ARG SOURCE=https://github.com/StefanVanDyck/ala-bie-hub.git

RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

FROM tomcat-base

ARG VERSION=4.2.0-SNAPSHOT

COPY --from=builder /project/build/libs/ala-bie-hub-${VERSION}-plain.war ${CATALINA_HOME}/webapps/bie-hub.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1