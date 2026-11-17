# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64

# What is built: one source of truth, used for the checkout AND the labels of the final image.
# COMMIT must be a full commit SHA (branches/tags fail the checkout verification).
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/logger-service.git
# Release 4.7.0
ARG COMMIT=58f47a0bc34fac505d53c776ca392c409bde9f10
# App version at COMMIT (build.gradle), used for the war name and the labels
ARG APP_VERSION=4.7.0

FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG SOURCE
ARG COMMIT
ARG APP_VERSION

WORKDIR /project
# Fetch only the pinned commit and verify that is what got checked out
RUN git init --quiet . \
  && git remote add origin ${SOURCE} \
  && git fetch --depth 1 origin ${COMMIT} \
  && git checkout --detach FETCH_HEAD \
  && test "$(git rev-parse HEAD)" = "${COMMIT}"

# Remove absolutely ridiculous and annoying "security" check (only allows event logging from whitelisted IPs).
# rm fails the build if upstream moves or renames it.
RUN rm grails-app/controllers/au/org/ala/logger/IpAddressInterceptor.groovy

# Locale resolver override (default locale nl, vbp-lang cookie).
# Fail instead of silently replacing/duplicating if upstream starts defining its own.
RUN test ! -e grails-app/conf/spring/resources.xml && ! grep -rn "localeResolver" grails-app src/main
COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
  gradle assemble

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
  rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
  && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:17.0.21

ARG SOURCE
ARG COMMIT
ARG APP_VERSION

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/logger/logger.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/logger/i18n/crowdin /opt/atlas/i18n/logger \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/logger/i18n/override /var/opt/atlas/i18n/logger

LABEL ala.version=${APP_VERSION}
LABEL org.opencontainers.image.source=${SOURCE}
LABEL org.opencontainers.image.revision=${COMMIT}
LABEL org.opencontainers.image.version=${APP_VERSION}

COPY --from=builder /project/build/libs/logger-service-${APP_VERSION}.war /logger.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/logger/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /logger.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data

RUN mkdir /catalina
RUN chown 1000:1000 /catalina
VOLUME /catalina
ENV CATALINA_BASE=/catalina

USER 1000:1000
