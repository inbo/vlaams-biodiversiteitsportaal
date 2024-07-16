FROM gradle:7-jdk11 as builder

ARG VERSION=3.0.0
WORKDIR /project
RUN git clone --branch v${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/image-service.git /project
COPY build.gradle /project/build.gradle
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assetCompile assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

ARG t=5
RUN ls -la  /project/build/libs/


FROM openjdk:11

ARG VERSION=3.1.0-SNAPSHOT
# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && chown app:app /data
VOLUME /data

USER app
WORKDIR app

COPY --from=builder --chown=app \
    /project/build/libs/image-service-${VERSION}.war /app/app.war

ENTRYPOINT ["java", "-jar", "/app/app.war"]

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/actuator/health || exit 1