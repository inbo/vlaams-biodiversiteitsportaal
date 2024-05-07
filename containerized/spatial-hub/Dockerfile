FROM gradle:7-jdk11 as builder

ARG VERSION=2.1.0

RUN apt-get update && apt-get -y install \
    npm

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/spatial-hub.git /project
COPY ./i18n/ ./grails-app/i18n/

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
        --parallel

ARG Test=1
RUN ls -la /project/build/libs/

FROM tomcat:9.0-jdk11-openjdk

ARG VERSION=2.1.0

COPY --from=builder /project/build/libs/project-${VERSION}-plain.war $CATALINA_HOME/webapps/ROOT.war

VOLUME /data