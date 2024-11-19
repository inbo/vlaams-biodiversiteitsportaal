ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=7.1.1
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-hub.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

# # TODO: ugly fix for config values being overwritten by ala defaults
RUN sed -i '10d' grails-app/conf/application.yml
RUN cat grails-app/conf/application.yml

# TODO: Fix explore your area not loading properly because of global
COPY alaBs.js ./grails-app/assets/javascripts/alaBs.js

COPY ./i18n/ ./grails-app/i18n/


RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=7.1.1

COPY --from=builder /project/build/libs/ala-hub-${VERSION}-plain.war ${CATALINA_HOME}/webapps/biocache-hub.war
COPY biocache-hub.xml ${CATALINA_HOME}/conf/portal/localhost/biocache-hub.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/biocache-hub/actuator/health || exit 1