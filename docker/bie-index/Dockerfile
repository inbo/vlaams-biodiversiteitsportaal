ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=fix-admin-index-page
ARG SOURCE=https://github.com/StefanVanDyck/bie-index.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/


RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=3.1.0

COPY --from=builder /project/build/libs/bie-index-${VERSION}-plain.war ${CATALINA_HOME}/webapps/bie-index.war
COPY bie-index.xml ${CATALINA_HOME}/conf/portal/localhost/bie-index.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1