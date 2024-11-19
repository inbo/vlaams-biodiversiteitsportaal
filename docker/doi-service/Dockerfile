ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=4.0.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/doi-service.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .


ENV GRADLE_RO_DEP_CACHE=/gradle-cache

RUN --mount=type=cache,target=/gradle-cache,ro \
    ls -la /gradle-cache && \
    gradle \
        build assemble \
        -x test \
        --no-daemon \
        --parallel

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    cp -rv /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && ls -la /gradle-cache

FROM tomcat-base

ARG VERSION=4.0.0

COPY --from=builder /project/build/libs/doi-service-${VERSION}-plain.war ${CATALINA_HOME}/webapps/doi-service.war
COPY doi-service.xml ${CATALINA_HOME}/conf/portal/localhost/doi-service.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/doi-service/actuator/health || exit 1