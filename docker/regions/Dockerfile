ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


# ARG VERSION=4.0.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/regions.git

ARG VERSION=inbo/vlaams-biodiversiteitsportaal-26-fix-error-when-showing-timelapse
ARG SOURCE=https://github.com/StefanVanDyck/regions.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assetCompile assemble \
    -x test

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    cp -r /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

# ARG VERSION=4.0.0
ARG VERSION=4.1.0-SNAPSHOT
COPY --from=builder /project/build/libs/regions-${VERSION}-plain.war ${CATALINA_HOME}/webapps/regions.war
COPY regions.xml ${CATALINA_HOME}/conf/portal/localhost/regions.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/regions/actuator/health || exit 1