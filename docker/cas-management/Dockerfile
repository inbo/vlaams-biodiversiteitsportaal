FROM gradle:7-jdk11 AS builder

ARG VERSION=6.5.5-2

WORKDIR /project

RUN mkdir /etc/cas

RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/ala-cas-5-services.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble createKeystore --no-daemon \
    -x test \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

RUN ls -la /project/build/libs/*

FROM openjdk:11

ARG VERSION=6.5.5-2

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && chown app:app /data
VOLUME /data

USER app
WORKDIR /app

COPY --from=builder --chown=app \
    /project/build/libs/cas-management-${VERSION}-exec.war /app/app.war

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.war"]
HEALTHCHECK CMD curl --fail --silent http://localhost:8080/cas-management/actuator/health || exit 1
