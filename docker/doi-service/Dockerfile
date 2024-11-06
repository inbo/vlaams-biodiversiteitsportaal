ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=4.0.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/doi-service.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test \
        --no-daemon \
        --parallel

FROM tomcat-base

ARG VERSION=4.0.0

COPY --from=builder /project/build/libs/doi-service-${VERSION}-plain.war ${CATALINA_HOME}/webapps/doi-service.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/doi-service/actuator/health || exit 1