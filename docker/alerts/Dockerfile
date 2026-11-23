# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64

# What is built: one source of truth, used for the checkout AND the labels of the final image.
# COMMIT must be a full commit SHA (checked after the checkout).
ARG SOURCE=https://github.com/inbo/vbp-alerts.git
# Branch upgrade-6.3.1
ARG COMMIT=e1b373ecbc418e9837c4022ba087385a19796d93
# App version at COMMIT (build.gradle), used for the war name and the labels
ARG APP_VERSION=6.3.1

FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG SOURCE
ARG COMMIT

WORKDIR /project
# Full clone (not shallow): COMMIT does not have to be a branch head
RUN git clone -q ${SOURCE} . \
  && git checkout -q ${COMMIT} \
  && test "$(git rev-parse HEAD)" = "${COMMIT}"

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:21.0.13-al2023-headless

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/alerts/alerts.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/alerts/i18n/crowdin /opt/atlas/i18n/alerts \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/alerts/i18n/override /var/opt/atlas/i18n/alerts

ARG SOURCE
ARG COMMIT
ARG APP_VERSION
LABEL org.opencontainers.image.source=${SOURCE}
LABEL org.opencontainers.image.revision=${COMMIT}
LABEL org.opencontainers.image.version=${APP_VERSION}

COPY --from=builder /project/build/libs/alerts-${APP_VERSION}.war /alerts.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/alerts/actuator/health || exit 1


ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /alerts.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data

RUN mkdir /catalina
RUN chown 1000:1000 /catalina
VOLUME /catalina
ENV CATALINA_BASE=/catalina

USER 1000:1000

