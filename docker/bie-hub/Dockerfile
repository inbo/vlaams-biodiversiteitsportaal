ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder


WORKDIR /project

# ARG VERSION=4.1.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-bie-hub.git

ARG VERSION=fix-wolf-wiki-page
ARG SOURCE=https://github.com/StefanVanDyck/ala-bie-hub.git

RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/


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

ARG VERSION=4.2.0-SNAPSHOT

COPY --from=builder /project/build/libs/ala-bie-hub-${VERSION}-plain.war ${CATALINA_HOME}/webapps/bie-hub.war
COPY bie-hub.xml ${CATALINA_HOME}/conf/portal/localhost/bie-hub.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1