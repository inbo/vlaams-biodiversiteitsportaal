# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64

# What is built: one source of truth per repo, used for the checkouts AND the labels of the final image.
# COMMITs must be full commit SHAs (checked after each checkout).
# Branch develop-vbp
ARG DOWNLOADS_PLUGIN_SOURCE=https://github.com/inbo/vbp-downloads-plugin.git
ARG DOWNLOADS_PLUGIN_COMMIT=d3ab750802f0eaabbdbdbca215754a845e307ff5
# Branch feature/map-auto-display (develop-vbp + configurable grid layers and auto display modes, #1322)
ARG BIOCACHE_HUBS_SOURCE=https://github.com/inbo/vbp-biocache-hubs.git
ARG BIOCACHE_HUBS_COMMIT=0ecdcc29957afa20fc9c567300ac928908e65a78
# Stock ALA, branch develop
ARG ALA_HUB_SOURCE=https://github.com/AtlasOfLivingAustralia/ala-hub
ARG ALA_HUB_COMMIT=0955e37614df501273d2cce716cf8deba669ad04
# ala-hub version at ALA_HUB_COMMIT (build.gradle), used for the war name and the labels
ARG APP_VERSION=8.4.0-SNAPSHOT

FROM --platform=${BUILDPLATFORM} custom-gradle-jdk17 AS builder

ARG DOWNLOADS_PLUGIN_SOURCE
ARG DOWNLOADS_PLUGIN_COMMIT
ARG BIOCACHE_HUBS_SOURCE
ARG BIOCACHE_HUBS_COMMIT
ARG ALA_HUB_SOURCE
ARG ALA_HUB_COMMIT

# Full clone (not shallow): COMMIT does not have to be a branch head
WORKDIR /project/downloads-plugin
RUN git clone -q ${DOWNLOADS_PLUGIN_SOURCE} . \
  && git checkout -q ${DOWNLOADS_PLUGIN_COMMIT} \
  && test "$(git rev-parse HEAD)" = "${DOWNLOADS_PLUGIN_COMMIT}"

WORKDIR /project/biocache-hubs
RUN git clone -q ${BIOCACHE_HUBS_SOURCE} . \
  && git checkout -q ${BIOCACHE_HUBS_COMMIT} \
  && test "$(git rev-parse HEAD)" = "${BIOCACHE_HUBS_COMMIT}"

WORKDIR /project/ala-hub
RUN git clone -q ${ALA_HUB_SOURCE} . \
  && git checkout -q ${ALA_HUB_COMMIT} \
  && test "$(git rev-parse HEAD)" = "${ALA_HUB_COMMIT}"

COPY resources.xml ./grails-app/conf/spring/resources.xml

# TODO: ugly fix for config values being overwritten by ala defaults (plugin.groovy wins over our config)
RUN grep -q '^ *- classpath:plugin.groovy' grails-app/conf/application.yml \
  && sed -i '/^ *- classpath:plugin.groovy/d' grails-app/conf/application.yml

# TODO: Fix explore your area not loading properly because of global
COPY alaBs.js ./grails-app/assets/javascripts/alaBs.js

RUN --mount=type=cache,target=/gradle-cache,ro \
  gradle build assemble \
  -x test -x integrationTest \
  --include-build ../biocache-hubs \
  --include-build ../downloads-plugin

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
  rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
  && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:17.0.21-al2023-headless

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

ARG DOWNLOADS_PLUGIN_SOURCE
ARG DOWNLOADS_PLUGIN_COMMIT
ARG BIOCACHE_HUBS_SOURCE
ARG BIOCACHE_HUBS_COMMIT
ARG ALA_HUB_SOURCE
ARG ALA_HUB_COMMIT
ARG APP_VERSION
# The VBP fork carries our changes, so it is the image's main source/revision
LABEL org.opencontainers.image.source=${BIOCACHE_HUBS_SOURCE}
LABEL org.opencontainers.image.revision=${BIOCACHE_HUBS_COMMIT}
LABEL org.opencontainers.image.version=${APP_VERSION}
LABEL be.vbp.downloads-plugin.source=${DOWNLOADS_PLUGIN_SOURCE}
LABEL be.vbp.downloads-plugin.revision=${DOWNLOADS_PLUGIN_COMMIT}
LABEL be.vbp.ala-hub.source=${ALA_HUB_SOURCE}
LABEL be.vbp.ala-hub.revision=${ALA_HUB_COMMIT}

COPY --from=builder /project/ala-hub/build/libs/ala-hub-${APP_VERSION}.war /biocache-hub.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/biocache-hub/actuator/health || exit 1

ENV JAVA_RELECT_OPTS="--add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED"

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} ${JAVA_RELECT_OPTS} -jar /biocache-hub.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data

RUN mkdir /catalina
RUN chown 1000:1000 /catalina
VOLUME /catalina
ENV CATALINA_BASE=/catalina

USER 1000:1000

