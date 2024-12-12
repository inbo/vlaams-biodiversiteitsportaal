ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=master
ARG COMMIT=cdcce55581b5d37173d6536431d92defeb2d7266
ARG SOURCE=https://github.com/inbo/bie-index.git
LABEL ala.version=inbo-${COMMIT}

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

ARG VERSION=3.1.0
ARG COMMIT=cdcce55581b5d37173d6536431d92defeb2d7266
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/bie-index-${VERSION}-plain.war ${CATALINA_HOME}/webapps/bie-index.war
COPY bie-index.xml ${CATALINA_HOME}/conf/portal/localhost/bie-index.xml

# Symlink to i18n files location
RUN ln -s /opt/atlas/i18n/bie-index/messages /config/config/bie-index/i18n

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1