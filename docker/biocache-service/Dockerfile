ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=3.5.1
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/biocache-service.git
LABEL ala.version=${VERSION}

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/messages-nl.properties ./src/main/webapp/WEB-INF/messages.properties

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=3.5.1
LABEL ala.version=${VERSION}

COPY --from=builder /project/build/libs/biocache-service-${VERSION}.war ${CATALINA_HOME}/webapps/biocache-service.war
COPY biocache-service.xml ${CATALINA_HOME}/conf/portal/localhost/biocache-service.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/biocache-service/actuator/health || exit 1