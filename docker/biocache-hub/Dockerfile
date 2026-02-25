# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle-jdk17 AS builder

ARG VERSION=develop-vbp
ARG COMMIT=800686e1ca958d934dc1ccd49c2d0e1d09d35824

ARG SOURCE=https://github.com/StefanVanDyck/biocache-hubs.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project/biocache-hubs
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

#RUN --mount=type=cache,target=/gradle-cache,ro \
#    gradle build publishToMavenLocal \
#    -x test

ARG VERSION=develop
ARG COMMIT=acc4e25421dd15a375adfbe83567a587d5b145bd
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-hub
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project/ala-hub
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml

# # TODO: ugly fix for config values being overwritten by ala defaults
RUN sed -i '10d' grails-app/conf/application.yml
RUN cat grails-app/conf/application.yml

# TODO: Fix explore your area not loading properly because of global
COPY alaBs.js ./grails-app/assets/javascripts/alaBs.js

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest \
    --include-build ../biocache-hubs

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:17

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/biocache-hub/biocache-hub.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/biocache-hub/i18n/downloads-plugin/crowdin /opt/atlas/i18n/downloads-plugin \
  && ln -s /config/biocache-hub/i18n/crowdin /opt/atlas/i18n/biocache-hubs \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/biocache-hub/i18n/downloads-plugin/override /var/opt/atlas/i18n/downloads-plugin \
  && ln -s /config/biocache-hub/i18n/override /var/opt/atlas/i18n/biocache-hubs

ARG VERSION=8.1.0-SNAPSHOT
ARG COMMIT=38b573fc6b8545eff69ccfb9f0fb870e9cc54211
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/ala-hub/build/libs/ala-hub-${VERSION}.war /biocache-hub.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/biocache-hub/actuator/health || exit 1

ENV JAVA_RELECT_OPTS="--add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED"

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} ${JAVA_RELECT_OPTS} -jar /biocache-hub.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000

