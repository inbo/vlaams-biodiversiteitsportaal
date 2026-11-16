# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
# Single source of truth for what gets built and labelled (re-declared per stage)
ARG SOURCE=https://github.com/inbo/vbp-data-quality-filter-service
ARG COMMIT=92d2dedb165f5bc0746a257644cb7d7774497322

FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG SOURCE
ARG COMMIT

WORKDIR /project
# Full clone (not shallow): gradle-git-properties reads history via JGit
RUN git clone -q ${SOURCE} . && git checkout -q ${COMMIT}

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

# Pick the executable bootWar (not the -plain.war) without hard-coding the version
RUN set -e; \
    wars=$(find build/libs -maxdepth 1 -name 'data-quality-filter-service-*.war' ! -name '*-plain.war'); \
    [ "$(echo "${wars}" | grep -c .)" -eq 1 ] || { echo "Expected exactly one bootWar, found: ${wars}" >&2; ls -la build/libs >&2; exit 1; }; \
    cp ${wars} /data-quality-filter-service.war

FROM amazoncorretto:17.0.21

ARG COMMIT
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/data-quality-filter-service/data-quality-filter-service.yml"

COPY --from=builder /data-quality-filter-service.war /data-quality-filter-service.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/data-quality-filter-service/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /data-quality-filter-service.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data

RUN mkdir /catalina
RUN chown 1000:1000 /catalina
VOLUME /catalina
ENV CATALINA_BASE=/catalina

USER 1000:1000
