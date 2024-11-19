ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=4.2.1
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/alerts.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .


ENV GRADLE_RO_DEP_CACHE=/gradle-cache

RUN --mount=type=cache,target=/gradle-cache,ro ls -la /gradle-cache
RUN --mount=type=cache,target=/gradle-cache,ro ls -la /gradle-cache/modules-2
RUN --mount=type=cache,target=/gradle-cache,ro ls -la /gradle-cache/modules-2/files-2.1

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        --parallel

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    cp -rv /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && ls -la /gradle-cache


FROM tomcat-base

ARG VERSION=4.2.1
COPY --from=builder /project/build/libs/alerts-${VERSION}-plain.war ${CATALINA_HOME}/webapps/alerts.war
COPY alerts.xml ${CATALINA_HOME}/conf/portal/localhost/alerts.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/alerts/actuator/health || exit 1