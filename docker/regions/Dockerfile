ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

# ARG VERSION=4.0.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/regions.git

ARG VERSION=inbo/vlaams-biodiversiteitsportaal-26-fix-error-when-showing-timelapse
ARG SOURCE=https://github.com/StefanVanDyck/regions.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/

ENV GRADLE_RO_DEP_CACHE=/gradle-cache

RUN --mount=type=cache,target=/gradle-cache,ro \
    ls -la /gradle-cache && \
    gradle build assetCompile assemble --no-daemon \
    -x test \
    --parallel

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    cp -rv /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && ls -la /gradle-cache

FROM tomcat-base

# ARG VERSION=4.0.0
ARG VERSION=4.1.0-SNAPSHOT
COPY --from=builder /project/build/libs/regions-${VERSION}-plain.war ${CATALINA_HOME}/webapps/regions.war
COPY regions.xml ${CATALINA_HOME}/conf/portal/localhost/regions.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/regions/actuator/health || exit 1