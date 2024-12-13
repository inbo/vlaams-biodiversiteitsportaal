ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


# ARG VERSION=4.0.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/regions.git

ARG VERSION=develop-vbp
ARG COMMIT=c5e2bc0ab7f1be6571de8e066205dc4f2ad79fe2
ARG SOURCE=https://github.com/StefanVanDyck/regions.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY ./i18n/ ./grails-app/i18n/
COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assetCompile assemble \
    -x test

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

# ARG VERSION=4.0.0
ARG VERSION=4.1.0-SNAPSHOT
ARG COMMIT=a1a58634cdd1d8c4383dc6b49c25ac4cf8062c9b
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/regions-${VERSION}-plain.war ${CATALINA_HOME}/webapps/regions.war
COPY regions.xml ${CATALINA_HOME}/conf/portal/localhost/regions.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/regions/actuator/health || exit 1