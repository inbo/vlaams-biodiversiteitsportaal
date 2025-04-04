# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG VERSION=develop-vbp
ARG COMMIT=965ba388b19bf851e5117ff56c7259ee33dffb6b
ARG SOURCE=https://github.com/inbo/specieslist-webapp.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

RUN ls -la /project/build/libs

FROM amazoncorretto:11

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/species-list/species-list.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/species-list/i18n/crowdin /opt/atlas/i18n/specieslist-webapp \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/species-list/i18n/override /var/opt/atlas/i18n/specieslist-webapp

ARG VERSION=5.3.0-SNAPSHOT
ARG COMMIT=c353fd4940dfe06853311997f2692affec822998
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/specieslist-webapp-${VERSION}.war /species-list.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/species-list/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /species-list.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000
