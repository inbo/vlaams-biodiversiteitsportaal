FROM maven:3.8-openjdk-17 as builder

ARG VERSION=6.5.6-3

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/ala-cas-5.git /project
# COPY ./i18n/ src/main/resources/


RUN --mount=type=cache,target=/root/.m2/repository\
    mvn clean package spring-boot:repackage -T 10

ARG test=1
RUN ls -la /project/target/*

FROM openjdk:11

ARG VERSION=6.5.6-3

RUN mkdir /certs
COPY rds-truststore.jks $JAVA_HOME/jre/lib/security/cacerts


# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app
RUN mkdir -p /build/tomcat && chown app:app /build/tomcat

RUN mkdir /data && chown app:app /data
VOLUME /data

COPY --from=builder --chown=app \
    /project/target/cas-exec.war /app/cas.war

USER app
WORKDIR app

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/cas.war"]
HEALTHCHECK CMD curl --fail --silent http://localhost:8080/cas/actuator/health || exit 1
