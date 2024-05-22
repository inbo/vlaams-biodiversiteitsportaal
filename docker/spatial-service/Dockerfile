FROM gradle:7-jdk11 as builder

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

RUN ls -la /project/build/libs

# FROM openjdk:8 as builder-maxent
#
# ARG MAXENT_VERSION=v3.4.3
#
# WORKDIR /project
#
# RUN apt-get update && apt-get install -y \
#     make \
#     zip
#
# RUN git clone --branch ${MAXENT_VERSION} --depth 1 https://github.com/mrmaxent/Maxent.git /project
#
# RUN make distribution

FROM tomcat:9.0-jdk11-openjdk
ARG VERSION=2.1.2

ENV UID=1000
ENV GID=1000

RUN apt-get update && apt-get install -y \
    gettext-base \
    gdal-bin

COPY --from=builder /project/build/libs/project-${VERSION}-plain.war $CATALINA_HOME/webapps/ws.war
# COPY --from=builder-maxent /project/maxent.jar /maxent.jar

#
# RUN groupadd -r -g 1000 ala && useradd -u 1000 -g ala ala
# RUN mkdir /usr/local/tomcat/webapps/ws && chown ala:ala /usr/local/tomcat/webapps/ws
# USER ala

VOLUME /data

COPY docker-entrypoint.sh /
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD []

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/ws/actuator/health/liveness || exit 1