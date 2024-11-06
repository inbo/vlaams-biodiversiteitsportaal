ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=4.2.1
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/alerts.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        --parallel

FROM tomcat-base

ARG VERSION=4.2.1
COPY --from=builder /project/build/libs/alerts-${VERSION}-plain.war ${CATALINA_HOME}/webapps/alerts.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/alerts/actuator/health || exit 1