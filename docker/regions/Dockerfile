FROM gradle:7-jdk11 as builder

ARG VERSION=4.0.0

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/regions.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

FROM openjdk:11

ARG VERSION=4.0.0

COPY --from=builder /project/build/libs/regions-${VERSION}.war /app.war

VOLUME /data
ENTRYPOINT ["java", "-jar", "/app.war"]

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/actuator/health/liveness || exit 1