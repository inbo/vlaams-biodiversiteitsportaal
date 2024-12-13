ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=1.7.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/apikey.git

LABEL ala.version=${VERSION}

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=1.7.0

LABEL ala.version=${VERSION}

COPY --from=builder /project/build/libs/apikey-${VERSION}-plain.war ${CATALINA_HOME}/webapps/apikey.war
COPY apikey.xml ${CATALINA_HOME}/conf/portal/localhost/apikey.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n/apikey \
  && ln -s /config/config/apikey/i18n/crowdin /opt/atlas/i18n/apikey
RUN mkdir -p /var/opt/atlas/i18n/apikey \
  && ln -s /config/config/apikey/i18n/override /var/opt/atlas/i18n/apikey

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1