# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

WORKDIR /project

# ARG VERSION=4.1.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-bie-hub.git

ARG VERSION=develop
ARG COMMIT=2abbe63b8f9c0b97d862350fa5ee36df46ea48fa
ARG SOURCE=https://github.com/inbo/ala-bie-hub.git
LABEL ala.version=inbo-${COMMIT}

RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:11

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/bie-hub/bie-hub.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/bie-hub/i18n/crowdin /opt/atlas/i18n/bie-plugin \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/bie-hub/i18n/override /var/opt/atlas/i18n/bie-plugin

ARG VERSION=4.2.0-SNAPSHOT
ARG COMMIT=2abbe63b8f9c0b97d862350fa5ee36df46ea48fa
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/ala-bie-hub-${VERSION}.war /bie-hub.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /bie-hub.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data

RUN mkdir /cache
RUN chown 1000:1000 /cache
VOLUME /cache

USER 1000:1000
