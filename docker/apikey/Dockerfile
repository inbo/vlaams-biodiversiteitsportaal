ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=1.7.0

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/apikey.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

FROM openjdk:11

ARG VERSION=1.7.0

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && chown app:app /data
VOLUME /data

USER app
WORKDIR /app

COPY --from=builder --chown=app\
    /project/build/libs/apikey-${VERSION}-exec.war /app/app.war

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.war"]
HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1
