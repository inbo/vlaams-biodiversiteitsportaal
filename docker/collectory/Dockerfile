ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} gradle:7-jdk11 AS builder

WORKDIR /project

# ARG VERSION=5.1.1
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/collectory.git

ARG VERSION=fix-use-occurenceid-as-default-unique-id-when-scanning-ipt
ARG SOURCE=https://github.com/StefanVanDyck/collectory

RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY ./i18n/ ./grails-app/i18n/

RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    --parallel


FROM tomcat-base

ARG VERSION=5.2.0-SNAPSHOT

COPY --from=builder /project/build/libs/collectory-${VERSION}-plain.war ${CATALINA_HOME}/webapps/collectory.war
COPY collectory.xml ${CATALINA_HOME}/conf/portal/localhost/collectory.xml

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/collectory/actuator/health || exit 1