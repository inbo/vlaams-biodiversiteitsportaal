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

COPY --from=builder /project/target/cas-exec.war /cas.war
RUN mkdir -p /data/cas

EXPOSE 8080
VOLUME /data

ENTRYPOINT ["java", "-jar", "/cas.war"]
HEALTHCHECK CMD "curl --fail --silent http://localhost:8080/cas/actuator/health || exit 1"
