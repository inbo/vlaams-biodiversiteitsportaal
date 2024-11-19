ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=1.7.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/apikey.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

ENV GRADLE_RO_DEP_CACHE=/gradle-cache

RUN --mount=type=cache,target=/gradle-cache,ro \
    ls -la /gradle-cache && \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    cp -rv /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && ls -la /gradle-cache

FROM tomcat-base

ARG VERSION=1.7.0

COPY --from=builder /project/build/libs/apikey-${VERSION}-plain.war ${CATALINA_HOME}/webapps/apikey.war
COPY apikey.xml ${CATALINA_HOME}/conf/portal/localhost/apikey.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1
