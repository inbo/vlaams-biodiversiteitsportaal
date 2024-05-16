FROM gradle:7-jdk11 as builder

ARG VERSION=5.1.1

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/collectory.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

RUN ls -la /project/build/libs/

FROM tomcat:9.0-jdk11-openjdk

ARG VERSION=5.1.1

COPY --from=builder /project/build/libs/collectory-${VERSION}-plain.war $CATALINA_HOME/webapps/ROOT.war

VOLUME /data
