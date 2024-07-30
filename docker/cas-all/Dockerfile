######################################### CAS #########################################
FROM maven:3.8-openjdk-11 AS cas-builder

ARG CAS_VERSION=6.5.6-3

WORKDIR /project
RUN git clone --branch ${CAS_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/ala-cas-5.git /project
# COPY ./i18n/ src/main/resources/

RUN --mount=type=cache,target=/root/.m2/repository\
    mvn clean package spring-boot:repackage -T 10

RUN ls -la /project/target/*

######################################### CAS MANAGEMENT #########################################
FROM gradle:7-jdk11 AS cas-management-builder

ARG CAS_MANAGEMENT_VERSION=6.5.5-2

WORKDIR /project

RUN mkdir /etc/cas

RUN git clone --branch ${CAS_MANAGEMENT_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/ala-cas-5-services.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble createKeystore --no-daemon \
    -x test \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

######################################### CAS APIKEY #########################################
FROM gradle:7-jdk11 AS cas-apikey-builder

ARG CAS_APIKEY_VERSION=1.7.0

WORKDIR /project
RUN git clone --branch ${CAS_APIKEY_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/apikey.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

RUN ls -la /project/build/libs/

######################################### USERDETAILS #########################################
FROM gradle:7-jdk11 AS userdetails-builder

ARG USERDETAILS_VERSION=3.0.3

WORKDIR /project
RUN git clone --branch v${USERDETAILS_VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/userdetails.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel


RUN ls -la /project/build/libs/

######################################### TOMCAT SERVER #########################################
FROM tomcat:9.0-jdk11-openjdk

ARG CAS_VERSION=6.5.6-3
ARG CAS_MANAGEMENT_VERSION=6.5.5-2
ARG CAS_APIKEY_VERSION=1.7.0
ARG USERDETAILS_VERSION=3.0.3

COPY --from=cas-builder \
    /project/target/cas.war ${CATALINA_HOME}/webapps/cas.war
COPY --from=cas-management-builder \
    /project/build/libs/cas-management-${CAS_MANAGEMENT_VERSION}-exec.war ${CATALINA_HOME}/webapps/cas-management.war
COPY --from=cas-apikey-builder \
    /project/build/libs/apikey-${CAS_APIKEY_VERSION}-plain.war ${CATALINA_HOME}/webapps/cas-apikey.war
COPY --from=userdetails-builder \
    /project/build/libs/userdetails-${USERDETAILS_VERSION}-plain.war ${CATALINA_HOME}/webapps/userdetails.war

COPY conf ${CATALINA_HOME}/conf

VOLUME /data



HEALTHCHECK CMD curl --fail --silent http://localhost:8080/cas/actuator/health || exit 1

# Create the user
ENV UID 1000
ENV GID 1000
RUN groupadd --gid ${GID} tomcat \
    && useradd --uid ${UID} --gid ${GID} -m -d /tomcat tomcat

RUN mkdir /data
RUN chown tomcat:tomcat /data
VOLUME /data

COPY docker-entrypoint.sh /docker-entrypoint.sh
ENTRYPOINT ["/docker-entrypoint.sh"]