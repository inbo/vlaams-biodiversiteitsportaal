# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=v4.3
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/logger-service.git
LABEL ala.version=${VERSION}

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

# Remove absolutely ridiculous and annoying "security" check
RUN rm /project/grails-app/controllers/au/org/ala/logger/IpAddressInterceptor.groovy

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest \
    --init-script /vbp-utils/add-deps.gradle

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:11

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/logger/logger.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/logger/i18n/crowdin /opt/atlas/i18n/logger \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/logger/i18n/override /var/opt/atlas/i18n/logger

ARG VERSION=4.3
LABEL ala.version=${VERSION}

COPY --from=builder /project/build/libs/logger-service-${VERSION}.war /logger.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/logger/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /logger.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000
