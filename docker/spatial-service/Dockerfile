# syntax=docker/dockerfile:1.14.0
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

# ARG VERSION=2.1.5
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/spatial-service.git

ARG VERSION=develop
ARG COMMIT=b5dd4042a1ffce035111dc7c709d77055e576289
ARG SOURCE=https://github.com/katya-shaleninova/spatial-service.git
LABEL ala.version=inbo-${VERSION}

WORKDIR /project
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} .

RUN --mount=type=cache,target=/gradle-cache,ro \
    gradle \
        build assemble \
        -x test -x integrationTest

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
    rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache/ \
    && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

FROM tomcat-base

# ARG VERSION=2.1.5
ARG VERSION=2.2.0-SNAPSHOT
ARG COMMIT=a85a6b51abb2203d3e242e726965eb7f59eb98c1
ARG PIPELINES_VERSION=2.19.0-SNAPSHOT
LABEL ala.version=inbo-${COMMIT}
LABEL pipelines.version=${PIPELINES_VERSION}

RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    amazon-linux-extras install epel -y && \
    yum update -y && \
    yum -y install --skip-broken \
    gettext \
    unzip \
    gdal \
    proj \
    proj-data \
    proj-data-be

RUN mkdir /data/pipelines-shp && \
    curl https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/spatial-service/pipelines-shapefiles.zip -o /data/pipelines-shp/pipelines-shapefiles.zip && \
    unzip /data/pipelines-shp/pipelines-shapefiles.zip -d /data/pipelines-shp && \
    rm /data/pipelines-shp/pipelines-shapefiles.zip

# Libraries require linking from <data.dir>/modelling/maxent because the path is required to be a subfolder of the data directory
RUN mkdir -p /libs \
    && curl -L https://nexus.ala.org.au/repository/releases/au/org/ala/spatial/ala-aloc/1.0/ala-aloc-1.0.jar -o /libs/aloc.jar \
    && curl https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/spatial-service/maxent.zip -o /tmp/maxent.zip \
    && unzip -j /tmp/maxent.zip maxent/maxent.jar -d /libs \
    && rm /tmp/maxent.zip

RUN curl https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/spatial-service/pipelines-2.19.0-SNAPSHOT-shaded.jar -o /pipelines.jar

RUN mkdir /data/pipelines-vocabularies && mkdir /data/pipelines-data

COPY pipelines/vocabularies/* /data/pipelines-vocabularies/

COPY --from=builder /project/build/libs/project-${VERSION}-plain.war ${CATALINA_HOME}/webapps/spatial-service.war

COPY spatial-service.xml ${CATALINA_HOME}/conf/portal/localhost/spatial-service.xml

# Symlink to i18n files location
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/config/spatial-service/i18n/crowdin /opt/atlas/i18n/spatial-service \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/config/spatial-service/i18n/override /var/opt/atlas/i18n/spatial-service

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/spatial-service/actuator/health || exit 1

