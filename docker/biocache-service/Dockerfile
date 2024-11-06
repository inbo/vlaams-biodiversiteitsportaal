ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=3.5.1
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/biocache-service.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/messages-nl.properties ./src/main/webapp/WEB-INF/messages.properties

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test \
    --parallel

FROM tomcat-base

ARG VERSION=3.5.1

COPY --from=builder /project/build/libs/biocache-service-${VERSION}.war ${CATALINA_HOME}/webapps/biocache-service.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/biocache-service/actuator/health || exit 1