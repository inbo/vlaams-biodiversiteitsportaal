ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=3.5.1

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/biocache-service.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

FROM tomcat:9.0-jdk11-openjdk

ARG VERSION=3.5.1

COPY --from=builder /project/build/libs/biocache-service-${VERSION}.war $CATALINA_HOME/webapps/ROOT.war

RUN mkdir -p /data/biocache/config

VOLUME /data/biocache-service

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/actuator/health || exit 1