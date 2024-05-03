FROM gradle:7-jdk11 as builder

ARG VERSION=2.1.2

WORKDIR /project
# RUN git clone --branch ${VERSION} --depth 1 https://github.com/AtlasOfLivingAustralia/spatial-service.git /project
RUN git clone --branch develop --depth 1 https://github.com/StefanVanDyck/spatial-service.git /project
RUN --mount=type=cache,target=/home/gradle/.gradle/caches \
    gradle build assemble --no-daemon \
    -x test -x integrationTest \
    # -Dorg.gradle.debug=true -Dorg.gradle.debug.suspend=no --debug \
    --parallel

FROM openjdk:11

ARG VERSION=2.1.2

RUN apt-get update && apt-get install -y \
    gettext-base \
    gdal-bi
# COPY --from=builder /project/build/libs/project-${VERSION}.war spatial-service.war
COPY --from=builder /project/build/libs/project-2.1.1-SNAPSHOT.war spatial-service.war

VOLUME /data
ENTRYPOINT ["java", "-jar", "/spatial-service.war"]