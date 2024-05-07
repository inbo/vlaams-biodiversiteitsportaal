FROM gradle:7-jdk8 as builder

ARG VERSION=2.1.2

WORKDIR /project

RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/spatial-service.git /project
COPY ./i18n/ ./grails-app/i18n/

RUN gradle \
        build assemble \
        -x test -x integrationTest \
        --no-daemon \
        # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
        --parallel

ARG test=1
RUN ls -la /project/build/libs

# FROM tomcat:9.0-jdk11-openjdk
FROM tomcat:9.0-jdk8-openjdk
ARG VERSION=2.1.2

RUN apt-get update && apt-get install -y \
    gettext-base \
    gdal-bin

COPY --from=builder /project/build/libs/spatial-service-${VERSION}.war $CATALINA_HOME/webapps/ws.war
VOLUME /data
