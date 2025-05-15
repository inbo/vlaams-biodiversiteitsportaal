# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-maven AS image-utils-builder

ARG VERSION=memory-leak-debug
ARG COMMIT=4f667c9ca21d47db62c5706d730029f2962fe560
ARG SOURCE=https://github.com/inbo/image-utils.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project/image-utils
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

RUN mkdir -p /.m2/repository
RUN --mount=type=cache,target=/root/.m2/repository \
     mvn clean install -DskipTests -T 10 -U -Dmaven.repo.local=/.m2/repository

# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder
ARG VERSION=tiling-image-memory-leak
ARG COMMIT=4b4f318fe68d392027d600ed0d7b3bb942ff5571
ARG SOURCE=https://github.com/inbo/image-service.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project/image-service
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY build.gradle /project/image-service/build.gradle
COPY resources.xml ./grails-app/conf/spring/resources.xml

COPY --from=image-utils-builder /.m2/repository /root/.m2/repository

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assetCompile assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM amazoncorretto:11

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/image-service/image-service.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/image-service/i18n/crowdin /opt/atlas/i18n/image-service \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/image-service/i18n/override /var/opt/atlas/i18n/image-service

ARG VERSION=3.1.0-SNAPSHOT
LABEL ala.version=${VERSION}

COPY --from=builder /project/image-service/build/libs/image-service-${VERSION}.war /image-service.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/image-service/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /image-service.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000
