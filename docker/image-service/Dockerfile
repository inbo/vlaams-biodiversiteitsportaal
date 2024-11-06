ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=3.0.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/image-service.git

WORKDIR /project
RUN git clone --branch v${VERSION} --depth 1 ${SOURCE} /project
COPY build.gradle /project/build.gradle
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assetCompile assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

FROM tomcat-base

ARG VERSION=3.1.0-SNAPSHOT

COPY --from=builder /project/build/libs/image-service-${VERSION}-plain.war ${CATALINA_HOME}/webapps/image-service.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/image-service/actuator/health || exit 1