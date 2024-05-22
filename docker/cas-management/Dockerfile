FROM gradle:7-jdk11 as builder

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

COPY --from=builder /project/build/libs/cas-management-${VERSION}-exec.war /app.war
RUN mkdir -p /data/cas-management

EXPOSE 9000
VOLUME /data

ENTRYPOINT ["java", "-jar", "/app.war"]
HEALTHCHECK CMD "curl --fail --silent http://localhost:9000/actuator/health/liveness || exit 1"
