# syntax=docker/dockerfile:1.14.0
FROM --platform=${BUILDPLATFORM} custom-gradle AS builder

# ARG VERSION=2.1.5
# ARG SOURCE=https://github.com/AtlasOfLivingAustralia/spatial-service.git

ARG VERSION=fix-bbox-for-certain-fields
ARG COMMIT=d2bbec302551fc3b9b77ee5b7e9ead2dfad4df45
ARG SOURCE=https://github.com/StefanVanDyck/spatial-service.git
LABEL ala.version=inbo-${VERSION}

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
FROM amazoncorretto:11

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/spatial-service/spatial-service.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/spatial-service/i18n/crowdin /opt/atlas/i18n/spatial-service \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/spatial-service/i18n/override /var/opt/atlas/i18n/spatial-service

# ARG VERSION=2.1.5
ARG VERSION=2.2.0-SNAPSHOT
ARG COMMIT=d2bbec302551fc3b9b77ee5b7e9ead2dfad4df45
ARG PIPELINES_VERSION=2.19.0-SNAPSHOT
LABEL ala.version=inbo-${COMMIT}
LABEL pipelines.version=${PIPELINES_VERSION}

RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum -y install \
    libtiff \
    libpng \
    gettext \
    unzip \
    sqlite \
    shadow-utils

# Install GDAL using self built RPMs (check rpm folder for script used to generate them)
ARG PROJ_VERSION=6.1.1
ARG GDAL_VERSION=3.2.1
ARG TARGETARCH
ARG CACHE_BUSTING=1
RUN yum -y install https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/spatial-service/gdal/proj-${PROJ_VERSION}-1.amzn2.$TARGETARCH.rpm &&\
    yum -y install https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/spatial-service/gdal/gdal-${GDAL_VERSION}-1.amzn2.$TARGETARCH.rpm

RUN mkdir -p /opt/vbp/pipelines/shp && \
    curl https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/spatial-service/pipelines-shapefiles.zip -o /opt/vbp/pipelines/shp/pipelines-shapefiles.zip && \
    unzip /opt/vbp/pipelines/shp/pipelines-shapefiles.zip -d /opt/vbp/pipelines/shp && \
    rm /opt/vbp/pipelines/shp/pipelines-shapefiles.zip

RUN mkdir -p /opt/vbp/spatial-service/libs \
    && curl -L https://nexus.ala.org.au/repository/releases/au/org/ala/spatial/ala-aloc/1.0/ala-aloc-1.0.jar -o /opt/vbp/spatial-service/libs/aloc.jar \
    && curl https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/spatial-service/maxent.zip -o /tmp/maxent.zip \
    && unzip -j /tmp/maxent.zip maxent/maxent.jar -d /opt/vbp/spatial-service/libs \
    && rm /tmp/maxent.zip

RUN curl -f https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/spatial-service/pipelines-2.19.0-SNAPSHOT-shaded.jar -o /opt/vbp/pipelines/pipelines.jar

COPY pipelines/vocabularies/* /opt/vbp/pipelines/vocabularies/

COPY --from=builder /project/build/libs/project-${VERSION}.war /spatial-service.war
COPY link-libs.sh /opt/vbp/spatial-service/link-libs.sh

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/spatial-service/actuator/health || exit 1

# Libraries require linking from <data.dir>/modelling/... because the path is required to be a subfolder of the data directory
ENTRYPOINT ["sh", "-c", "/opt/vbp/spatial-service/link-libs.sh && java ${JAVA_OPTS} -jar /spatial-service.war"]

RUN groupadd --gid 1000 app && useradd --no-create-home --gid 1000 --uid 1000 app
RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data
USER 1000:1000

