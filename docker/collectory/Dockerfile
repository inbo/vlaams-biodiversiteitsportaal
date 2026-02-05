# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


WORKDIR /project

# ARG VERSION=5.1.1
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/collectory.git

ARG VERSION=develop-vbp
ARG SOURCE=https://github.com/StefanVanDyck/collectory
ARG COMMIT=79b9b25d871f01a9949e758a9767e756ca3d6674
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
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/collectory/collectory.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/collectory/i18n/crowdin /opt/atlas/i18n/collectory-plugin \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/collectory/i18n/override /var/opt/atlas/i18n/collectory-plugin

ARG VERSION=5.2.0-SNAPSHOT
ARG COMMIT=426d40413d937a78f2bdcdee89ff7b22e4173fb8
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/collectory-${VERSION}.war /collectory.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/collectory/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /collectory.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000

