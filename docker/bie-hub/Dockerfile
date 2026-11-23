# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64

# What is built: one source of truth, used for the checkout AND the labels of the final image.
# COMMIT must be a full commit SHA (checked after the checkout).
ARG SOURCE=https://github.com/inbo/vbp-ala-bie-hub.git
# Branch upgrade-develop
ARG COMMIT=9a282629b02b3ee0f23cdf60be0a21d0e748051a
# App version at COMMIT (build.gradle), used for the war name and the labels
ARG APP_VERSION=4.2.0-SNAPSHOT

FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG SOURCE
ARG COMMIT

WORKDIR /project

# Full clone (not shallow): COMMIT does not have to be a branch head
RUN git clone -q ${SOURCE} . \
  && git checkout -q ${COMMIT} \
  && test "$(git rev-parse HEAD)" = "${COMMIT}"

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
  gradle build assemble \
  -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
  rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
  && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:21.0.13-al2023-headless

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/bie-hub/bie-hub.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/bie-hub/i18n/crowdin /opt/atlas/i18n/bie-plugin \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/bie-hub/i18n/override /var/opt/atlas/i18n/bie-plugin

ARG SOURCE
ARG COMMIT
ARG APP_VERSION
LABEL ala.version=${APP_VERSION}
LABEL org.opencontainers.image.source=${SOURCE}
LABEL org.opencontainers.image.revision=${COMMIT}
LABEL org.opencontainers.image.version=${APP_VERSION}

COPY --from=builder /project/build/libs/ala-bie-hub-${APP_VERSION}.war /bie-hub.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/bie-hub/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /bie-hub.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data

RUN mkdir /cache
RUN chown 1000:1000 /cache
VOLUME /cache

RUN mkdir /catalina
RUN chown 1000:1000 /catalina
VOLUME /catalina
ENV CATALINA_BASE=/catalina

USER 1000:1000
