FROM gradle:7-jdk11 as builder

ARG VERSION=2.1.0

RUN apt-get update && apt-get -y install \
    npm

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/spatial-hub.git /project
COPY ./i18n/ ./grails-app/i18n/
COPY ./layouts/* ./grails-app/views/layouts/

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
        --parallel


FROM openjdk:11

ARG VERSION=2.1.0

COPY --from=builder /project/build/libs/project-${VERSION}.war /app.war

VOLUME /data
ENTRYPOINT ["java", "-jar", "/app.war"]

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/actuator/health/liveness || exit 1