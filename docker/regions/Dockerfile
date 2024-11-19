ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

# ARG VERSION=4.0.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/regions.git

ARG VERSION=inbo/vlaams-biodiversiteitsportaal-26-fix-error-when-showing-timelapse
ARG SOURCE=https://github.com/StefanVanDyck/regions.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/

RUN --mount=type=cache,target=/home/gradle/.gradle/caches,sharing=locked \
    gradle build assetCompile assemble --no-daemon \
    -x test \
    --parallel


FROM tomcat-base

# ARG VERSION=4.0.0
ARG VERSION=4.1.0-SNAPSHOT
COPY --from=builder /project/build/libs/regions-${VERSION}-plain.war ${CATALINA_HOME}/webapps/regions.war
COPY regions.xml ${CATALINA_HOME}/conf/portal/localhost/regions.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/regions/actuator/health || exit 1