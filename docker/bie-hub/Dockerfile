ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

WORKDIR /project

# ARG VERSION=4.1.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-bie-hub.git

ARG VERSION=develop
ARG COMMIT=15ad276721bb4c970c87933ff4edaf7128bc0e59
ARG SOURCE=https://github.com/inbo/ala-bie-hub.git
LABEL ala.version=inbo-${COMMIT}

RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} . && git checkout ${COMMIT}

COPY ./i18n/ ./grails-app/i18n/


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

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1