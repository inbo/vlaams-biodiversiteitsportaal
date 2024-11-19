ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


ARG VERSION=v4.3
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/logger-service.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

# Remove absolutely ridiculous and annoying "security" check
RUN rm /project/grails-app/controllers/au/org/ala/logger/IpAddressInterceptor.groovy


RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

ARG VERSION=4.3

COPY --from=builder /project/build/libs/logger-service-${VERSION}-plain.war ${CATALINA_HOME}/webapps/logger.war
COPY logger.xml ${CATALINA_HOME}/conf/portal/localhost/logger.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/logger/actuator/health || exit 1