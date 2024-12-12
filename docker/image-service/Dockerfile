ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=3.0.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/image-service.git
LABEL ala.version=${VERSION}

WORKDIR /project
RUN git clone --branch v${VERSION} --depth 1 ${SOURCE} /project

COPY build.gradle /project/build.gradle
COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assetCompile assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=3.1.0-SNAPSHOT
LABEL ala.version=${VERSION}

COPY --from=builder /project/build/libs/image-service-${VERSION}-plain.war ${CATALINA_HOME}/webapps/image-service.war
COPY image-service.xml ${CATALINA_HOME}/conf/portal/localhost/image-service.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n/image-service \
  && ln -s /config/config/image-service/i18n /opt/atlas/i18n/image-service/messages
RUN mkdir -p /var/opt/atlas/i18n/image-service \
  && ln -s /config/config/image-service/i18n/override /var/opt/atlas/i18n/image-service/messages

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/image-service/actuator/health || exit 1