FROM gradle:7-jdk11 as builder

ARG VERSION=fix-bbox-from-geoserver

WORKDIR /spatial-service

ARG test=12

RUN git clone --branch ${VERSION} --depth 1 https://github.com/StefanVanDyck/spatial-service.git /spatial-service
COPY ./i18n/ ./grails-app/i18n/

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
        --parallel

FROM openjdk:11

ARG VERSION=2.1.6-SNAPSHOT

RUN apt-get update && apt-get install -y \
    gettext-base \
    gdal-bin

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && chown app:app /data
VOLUME /data

USER app
WORKDIR app

COPY --from=builder --chown=app \
    /spatial-service/build/libs/spatial-service-${VERSION}.war /app/app.war

ENTRYPOINT ["java", "-jar", "/app/app.war"]

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/ws/actuator/health || exit 1