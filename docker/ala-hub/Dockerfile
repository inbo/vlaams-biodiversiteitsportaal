FROM gradle:7-jdk11 AS builder

ARG VERSION=7.0.0

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/ala-hub.git /project

# # TODO: ugly fix for config values being overwritten by ala defaults
RUN sed -i '10d' grails-app/conf/application.yml
RUN cat grails-app/conf/application.yml

# TODO: Fix explore your area not loading properly because of global
COPY alaBs.js /project/grails-app/assets/javascripts/alaBs.js

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

FROM openjdk:11

ARG VERSION=7.0.0

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && chown app:app /data
VOLUME /data

USER app
WORKDIR /app

COPY --from=builder --chown=app \
    /project/build/libs/ala-hub-${VERSION}.war /app/app.war

ENTRYPOINT ["java", "-jar", "/app/app.war"]

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/actuator/health || exit 1