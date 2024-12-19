ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

# ARG VERSION=2.1.5
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/spatial-service.git

ARG VERSION=vbp-develop
ARG COMMIT=a85a6b51abb2203d3e242e726965eb7f59eb98c1
ARG SOURCE=https://github.com/StefanVanDyck/spatial-service.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache/ \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    gettext-base \
    gdal-bin

# Libraries require linking from <data.dir>/modelling/maxent because the path is required to be a subfolder of the data directory
RUN mkdir -p /libs \
    && curl -L https://nexus.ala.org.au/repository/releases/au/org/ala/spatial/ala-aloc/1.0/ala-aloc-1.0.jar -o /libs/aloc.jar \
    && curl https://biodiversiteitsportaal-dev-backups.s3.eu-west-1.amazonaws.com/maxent.zip -o /libs/maxent.zip \
    && unzip -p /libs/maxent.zip maxent/maxent.jar -d libs \
    && rm /libs/maxent.zip

# ARG VERSION=2.1.5
ARG VERSION=2.1.6-SNAPSHOT
ARG COMMIT=a85a6b51abb2203d3e242e726965eb7f59eb98c1
LABEL ala.version=inbo-${COMMIT}

COPY --from=builder /project/build/libs/project-${VERSION}-plain.war ${CATALINA_HOME}/webapps/spatial-service.war
COPY spatial-service.xml ${CATALINA_HOME}/conf/portal/localhost/spatial-service.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/config/spatial-service/i18n/crowdin /opt/atlas/i18n/spatial-service \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/config/spatial-service/i18n/override /var/opt/atlas/i18n/spatial-service

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/spatial-service/actuator/health || exit 1