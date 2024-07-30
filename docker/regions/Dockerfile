FROM gradle:7-jdk11 AS builder

ARG VERSION=4.0.0
WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/regions.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assetCompile assemble --no-daemon \
    -x test \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

FROM openjdk:11

ARG VERSION=4.0.0
# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && chown app:app /data
VOLUME /data

USER app
WORKDIR /app

COPY --from=builder --chown=app \
    /project/build/libs/regions-${VERSION}.war /app/app.war

ENTRYPOINT ["java", "-jar", "/app/app.war"]

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/actuator/health || exit 1