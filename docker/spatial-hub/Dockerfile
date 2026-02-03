# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

#ARG VERSION=2.1.0
#ARG SOURCE=https://github.com/AtlasOfLivingAustralia/spatial-hub.git1
#LABEL ala.version=${VERSION}

ARG VERSION=741-fix-merge-areas
ARG COMMIT=df3923ef32530ff38d8a3b532f50d31a10e649b3
ARG SOURCE=https://github.com/inbo/spatial-hub
LABEL ala.version=inbo-${VERSION}

# trivy:ignore:DS-0015  # using BuildKit yum cache
RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum update -y && \
    yum install -y \
    npm

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml
COPY ./layouts/* ./grails-app/views/layouts/
COPY ./assets/images/icon_flanders.png ./grails-app/assets/images/icon_contextual-layer.png
COPY ./assets/images/icon_flanders.png ./grails-app/assets/images/icon_wms-layer.png
COPY ./assets/javascripts/* ./grails-app/assets/javascripts/

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:11

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/spatial-hub/spatial-hub.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/spatial-hub/i18n/crowdin /opt/atlas/i18n/spatial-hub \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/spatial-hub/i18n/override /var/opt/atlas/i18n/spatial-hub

ARG VERSION=2.2.0-SNAPSHOT
ARG COMMIT=df3923ef32530ff38d8a3b532f50d31a10e649b3
LABEL ala.version=inbo-${VERSION}

COPY --from=builder /project/build/libs/project-${VERSION}.war /spatial-hub.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/spatial-hub/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /spatial-hub.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000
