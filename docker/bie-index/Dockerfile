# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=master
ARG COMMIT=3a2558fcf424da3708469927c5c904c7354f3eaa
ARG SOURCE=https://github.com/inbo/bie-index.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

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
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/bie-index/bie-index.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/bie-index/i18n/crowdin /opt/atlas/i18n/bie-index \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/bie-index/i18n/override /var/opt/atlas/i18n/bie-index

ARG VERSION=3.1.0
ARG COMMIT=cdcce55581b5d37173d6536431d92defeb2d7266
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/bie-index-${VERSION}.war /bie-index.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /bie-index.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000
