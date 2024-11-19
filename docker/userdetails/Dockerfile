ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

ARG VERSION=v3.2.0
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/userdetails.git

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .


ENV GRADLE_RO_DEP_CACHE=/gradle-cache

RUN --mount=type=cache,target=/gradle-cache,ro \
    ls -la /gradle-cache && \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel


FROM tomcat-base

ARG VERSION=3.2.0
COPY --from=builder /project/build/libs/userdetails-${VERSION}-plain.war ${CATALINA_HOME}/webapps/userdetails.war
COPY userdetails.xml ${CATALINA_HOME}/conf/portal/localhost/userdetails.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/userdetails/actuator/health || exit 1