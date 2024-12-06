ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG VERSION=102_add_search_by_occurrence_id
ARG COMMIT=f99784c5de2af188b735e358976c81abbe9d315b
ARG SOURCE=https://github.com/inbo/biocache-hubs.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project/biocache-hubs
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build publishToMavenLocal \
    -x test

ARG VERSION=102_add_search_by_occurrence_id
ARG COMMIT=d56989cda0b1234b2818f22d916534e01a13b254
ARG SOURCE=https://github.com/inbo/ala-hub.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project/ala-hub
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

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
ARG COMMIT=6a473fbb17deeebcadecc28dbe3d0b05740816f5
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/ala-hub/build/libs/ala-hub-${VERSION}-plain.war ${CATALINA_HOME}/webapps/biocache-hub.war
COPY biocache-hub.xml ${CATALINA_HOME}/conf/portal/localhost/biocache-hub.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/biocache-hub/actuator/health || exit 1