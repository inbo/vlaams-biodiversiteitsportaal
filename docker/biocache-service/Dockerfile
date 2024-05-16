FROM gradle:7-jdk11 as builder

ARG VERSION=3.4.1

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/biocache-service.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

FROM tomcat:9.0-jdk11-openjdk

ARG VERSION=3.4.1

COPY --from=builder /project/build/libs/biocache-service-${VERSION}.war $CATALINA_HOME/webapps/ROOT.war

VOLUME /data