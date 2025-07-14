# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=add-pac4j-cookie-matcher
ARG COMMIT=adde12c7e0dab33b719669511fbc5f31693eb82e
ARG SOURCE=https://github.com/StefanVanDyck/biocache-service.git
LABEL ala.version=inbo-${COMMIT}


WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

RUN ls -la /project/build/libs/

FROM amazoncorretto:11

COPY --from=builder /opt/aws-xray-agent /opt/aws-xray-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/biocache-service/biocache-service.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/biocache-service/i18n/crowdin /opt/atlas/i18n/biocache-service \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/biocache-service/i18n/override /var/opt/atlas/i18n/biocache-service

ARG VERSION=3.7.0-SNAPSHOT
ARG COMMIT=adde12c7e0dab33b719669511fbc5f31693eb82e
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/biocache-service-${VERSION}-exec.war /biocache-service.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/biocache-service/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /biocache-service.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000

