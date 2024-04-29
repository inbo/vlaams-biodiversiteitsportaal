FROM gradle:7-jdk11 as builder

ARG VERSION=4.5.3

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/specieslist-webapp.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

ARG test=t
RUN ls -la /project/build/libs/

FROM tomcat:9.0-jdk11-openjdk

ARG VERSION=4.5.3

COPY --from=builder /project/build/libs/specieslist-webapp-${VERSION}-plain.war $CATALINA_HOME/webapps/ROOT.war

VOLUME /data