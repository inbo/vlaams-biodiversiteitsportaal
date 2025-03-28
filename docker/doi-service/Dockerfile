# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG VERSION=4.0.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/doi-service.git
LABEL ala.version=${VERSION}

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:11

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/doi-service/doi-service.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/doi-service/i18n/crowdin /opt/atlas/i18n/doi \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/doi-service/i18n/override /var/opt/atlas/i18n/doi

ARG VERSION=4.0.0
LABEL ala.version=${VERSION}

COPY --from=builder /project/build/libs/doi-service-${VERSION}-exec.war /doi-service.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/doi-service/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /doi-service.war"]
