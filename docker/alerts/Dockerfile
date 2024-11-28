ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG VERSION=4.2.1
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/alerts.git

LABEL ala.version=${VERSION}

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=4.2.1

LABEL ala.version=${VERSION}

COPY --from=builder /project/build/libs/alerts-${VERSION}-plain.war ${CATALINA_HOME}/webapps/alerts.war
COPY alerts.xml ${CATALINA_HOME}/conf/portal/localhost/alerts.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/alerts/actuator/health || exit 1
