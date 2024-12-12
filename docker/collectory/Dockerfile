ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


WORKDIR /project

# ARG VERSION=5.1.1
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/collectory.git

ARG VERSION=fix-use-occurenceid-as-default-unique-id-when-scanning-ipt
ARG SOURCE=https://github.com/StefanVanDyck/collectory
ARG COMMIT=29e12de13c5820b672a6b2dd46bba83c5f74eac6
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

ARG VERSION=5.2.0-SNAPSHOT
ARG COMMIT=29e12de13c5820b672a6b2dd46bba83c5f74eac6
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/collectory-${VERSION}-plain.war ${CATALINA_HOME}/webapps/collectory.war
COPY collectory.xml ${CATALINA_HOME}/conf/portal/localhost/collectory.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n/collectory-plugin \
  && ln -s /config/config/collectory/i18n /opt/atlas/i18n/collectory-plugin/messages
RUN mkdir -p /var/opt/atlas/i18n/collectory-plugin \
  && ln -s /config/config/collectory/i18n/override /var/opt/atlas/i18n/collectory-plugin/messages

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/collectory/actuator/health || exit 1