# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

#ARG VERSION=2.1.0
#ARG SOURCE=https://github.com/AtlasOfLivingAustralia/spatial-hub.git
#LABEL ala.version=${VERSION}

ARG VERSION=develop
ARG COMMIT=ce0be66f141fde08cb5e8f768c52d96f1c8cde98
ARG SOURCE=https://github.com/katya-shaleninova/spatial-hub
LABEL ala.version=inbo-${VERSION}

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

COPY --from=builder /opt/aws-xray-agent /opt/aws-xray-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/spatial-hub/spatial-hub.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/spatial-hub/i18n/crowdin /opt/atlas/i18n/spatial-hub \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/spatial-hub/i18n/override /var/opt/atlas/i18n/spatial-hub

ARG VERSION=2.2.0-SNAPSHOT
ARG COMMIT=53d4aad16d6b1a704ef147923ed233a2d18d668d
LABEL ala.version=inbo-${VERSION}

COPY --from=builder /project/build/libs/project-${VERSION}.war /spatial-hub.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/spatial-hub/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /spatial-hub.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000
