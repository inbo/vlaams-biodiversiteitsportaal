# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

ARG VERSION=250_setup_data_quality_filter_service
ARG SOURCE=https://github.com/katya-shaleninova/data-quality-filter-service
ARG COMMIT=83e9fe873398a88c6d50a195c932b0a3fb70d2ff
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:11

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/data-quality-filter-service/data-quality-filter-service.yml"

ARG VERSION=2.0.0-SNAPSHOT
ARG COMMIT=83e9fe873398a88c6d50a195c932b0a3fb70d2ff
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/data-quality-filter-service-${VERSION}.war /data-quality-filter-service.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/data-quality-filter-service/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /data-quality-filter-service.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000
