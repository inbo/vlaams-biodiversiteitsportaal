# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=try-deconflicting-beans
ARG COMMIT=b2c9b7cd0f35e31f2c60c2870d9d3fe264e73092
ARG SOURCE=https://github.com/StefanVanDyck/biocache-service.git
LABEL ala.version=inbo-${COMMIT}


WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

RUN ls -la /project/build/libs/

FROM tomcat-base

ARG VERSION=3.7.0-SNAPSHOT
ARG COMMIT=b2c9b7cd0f35e31f2c60c2870d9d3fe264e73092
LABEL ala.version=inbo-${COMMIT}


COPY --from=builder /project/build/libs/biocache-service-${VERSION}.war ${CATALINA_HOME}/webapps/biocache-service.war
COPY biocache-service.xml ${CATALINA_HOME}/conf/portal/localhost/biocache-service.xml
COPY sandbox.xml ${CATALINA_HOME}/conf/portal/localhost/sandbox.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/config/biocache-service/i18n/crowdin /opt/atlas/i18n/biocache-service \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/config/biocache-service/i18n/override /var/opt/atlas/i18n/biocache-service

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/biocache-service/actuator/health || exit 1