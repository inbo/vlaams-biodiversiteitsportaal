# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


# ARG VERSION=4.0.0
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/regions.git

ARG VERSION=fix-non-working-pop-up-for-subregions
ARG COMMIT=c957a9ac93ea7f1e3e08a0b58fce073a6bb7a7e6
ARG SOURCE=https://github.com/StefanVanDyck/regions.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assetCompile assemble \
    -x test

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:11

COPY --from=builder /opt/aws-xray-agent /opt/aws-xray-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/regions/regions.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/regions/i18n/crowdin /opt/atlas/i18n/regions \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/regions/i18n/override /var/opt/atlas/i18n/regions

# ARG VERSION=4.0.0
ARG VERSION=4.1.0-SNAPSHOT
ARG COMMIT=c957a9ac93ea7f1e3e08a0b58fce073a6bb7a7e6
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/regions-${VERSION}.war /regions.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/regions/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /regions.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000
