ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder


#ARG VERSION=v3.2.0
#ARG SOURCE=https://github.com/AtlasOfLivingAustralia/userdetails.git
#LABEL ala.version=${VERSION}

ARG VERSION=attempt-userdetails-cognito-fix
ARG COMMIT=6a498f276dcaa5e1b26acbcf29b7dbe40cc9c2fa
ARG SOURCE=https://github.com/StefanVanDyck/userdetails.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

COPY resources.xml ./grails-app/conf/spring/resources.xml

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle build assemble \
    -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

RUN ls -la /project/build/libs/

FROM amazoncorretto:11

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/userdetails/userdetails.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/userdetails/i18n/crowdin /opt/atlas/i18n/userdetails \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/userdetails/i18n/override /var/opt/atlas/i18n/userdetails

ARG VERSION=3.3.0-SNAPSHOT
ARG COMMIT=6a498f276dcaa5e1b26acbcf29b7dbe40cc9c2fa
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/userdetails-${VERSION}-exec.war /userdetails.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/userdetails/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /userdetails.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000
