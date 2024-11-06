ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=1.7.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/apikey.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel


FROM tomcat-base

ARG VERSION=1.7.0

COPY --from=builder /project/build/libs/apikey-${VERSION}-plain.war ${CATALINA_HOME}/webapps/apikey.war
COPY apikey.xml ${CATALINA_HOME}/conf/portal/localhost/apikey.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/apikey/actuator/health || exit 1
