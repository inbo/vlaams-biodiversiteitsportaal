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

FROM tomcat-base

ARG VERSION=2.0.0-SNAPSHOT
ARG COMMIT=83e9fe873398a88c6d50a195c932b0a3fb70d2ff
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/data-quality-filter-service-${VERSION}-plain.war ${CATALINA_HOME}/webapps/data-quality-filter-service.war
COPY data-quality-filter-service.xml ${CATALINA_HOME}/conf/portal/localhost/data-quality-filter-service.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/data-quality-filter-service/actuator/health || exit 1
