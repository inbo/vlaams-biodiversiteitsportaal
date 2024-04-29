FROM gradle:7-jdk11 as builder

ARG VERSION=2.1.2

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/spatial-service.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

FROM tomcat:9.0-jdk11-openjdk

ARG VERSION=2.1.2

COPY --from=builder /project/build/libs/project-${VERSION}-plain.war $CATALINA_HOME/webapps/ROOT.war

VOLUME /data