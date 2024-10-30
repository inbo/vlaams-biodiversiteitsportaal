ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder


WORKDIR /project

# RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/alerts.git /project

ARG VERSION=fix-invalid-characters-for-alb-in-biocache-query-urls
ARG t=2
RUN git clone --branch ${VERSION} --depth 1 https://github.com/StefanVanDyck/alerts.git /project

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
        --parallel

ARG t=2
RUN ls -la build/libs

FROM openjdk:11

ARG VERSION=4.3.0-SNAPSHOT

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && chown app:app /data
VOLUME /data

USER app
WORKDIR /app

COPY --from=builder --chown=app \
    /project/build/libs/alerts-${VERSION}.war /app/app.war

ENTRYPOINT ["java", "-jar", "/app/app.war"]

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/actuator/health || exit 1