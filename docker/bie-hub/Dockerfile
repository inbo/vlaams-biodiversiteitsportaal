ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

WORKDIR /project

# ARG VERSION=4.1.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-bie-hub.git

ARG VERSION=develop
ARG COMMIT=261b5138873c63d7c08de17ae961dc50a3158dc0
ARG SOURCE=https://github.com/inbo/ala-bie-hub.git
LABEL ala.version=inbo-${COMMIT}

RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=4.2.0-SNAPSHOT
ARG COMMIT=15ad276721bb4c970c87933ff4edaf7128bc0e59
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/ala-bie-hub-${VERSION}-plain.war ${CATALINA_HOME}/webapps/bie-hub.war
COPY bie-hub.xml ${CATALINA_HOME}/conf/portal/localhost/bie-hub.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/config/bie-hub/i18n/crowdin /opt/atlas/i18n/bie-plugin \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/config/bie-hub/i18n/override /var/opt/atlas/i18n/bie-plugin

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1