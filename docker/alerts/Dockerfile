# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

#ARG VERSION=4.2.1
#ARG SOURCE=https://github.com/AtlasOfLivingAustralia/alerts.git

ARG VERSION=develop-vbp
ARG COMMIT=aa46bddabbda1e06e9512a1c6b4509806bcf3ed3
ARG SOURCE=https://github.com/StefanVanDyck/alerts.git

LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:11

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/alerts/alerts.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/alerts/i18n/crowdin /opt/atlas/i18n/alerts \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/config/alerts/i18n/override /var/opt/atlas/i18n/alerts

ARG VERSION=4.4.0-SNAPSHOT
LABEL ala.version=${VERSION}

COPY --from=builder /project/build/libs/alerts-${VERSION}.war /alerts.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/alerts/actuator/health || exit 1


ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /alerts.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000

