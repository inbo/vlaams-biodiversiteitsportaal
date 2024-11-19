ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=4.5.3
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/specieslist-webapp.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/


RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest


FROM tomcat-base

ARG VERSION=4.5.3
COPY --from=builder /project/build/libs/specieslist-webapp-${VERSION}-plain.war ${CATALINA_HOME}/webapps/species-list.war
COPY species-list.xml ${CATALINA_HOME}/conf/portal/localhost/species-list.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/species-list/actuator/health || exit 1