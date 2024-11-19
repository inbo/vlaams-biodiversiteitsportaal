ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=v4.3
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/logger-service.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

# Remove absolutely ridiculous and annoying "security" check
RUN rm /project/grails-app/controllers/au/org/ala/logger/IpAddressInterceptor.groovy


ENV GRADLE_RO_DEP_CACHE=/gradle-cache

RUN --mount=type=cache,target=/gradle-cache,ro \
    ls -la /gradle-cache && \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    cp -rv /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && ls -la /gradle-cache

FROM tomcat-base

ARG VERSION=4.3

COPY --from=builder /project/build/libs/logger-service-${VERSION}-plain.war ${CATALINA_HOME}/webapps/logger.war
COPY logger.xml ${CATALINA_HOME}/conf/portal/localhost/logger.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/logger/actuator/health || exit 1