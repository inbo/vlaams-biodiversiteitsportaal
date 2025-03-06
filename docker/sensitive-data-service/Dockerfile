# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-maven AS builder

ARG VERSION=1.1.1
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-sensitive-data-service.git
LABEL ala.version=${VERSION}

ARG TAXONOMY_ARCHIVE=https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/taxonomy/namematching-gbif-backbone-lucene-8-2024-09-11.tgz
RUN curl ${TAXONOMY_ARCHIVE} -o /gbif-backbone.tgz \
    && tar -xzf /gbif-backbone.tgz \
    && mv /namematching-gbif-backbone-lucene-8-2024-09-11 /gbif-backbone \
    && rm /gbif-backbone.tgz

WORKDIR /project
RUN git clone --branch v${VERSION} --depth 1 ${SOURCE} .

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn --batch-mode --no-transfer-progress \
        clean package -DskipTests -T 4 -U

FROM amazoncorretto:11

ARG VERSION=1.1.1
LABEL ala.version=${VERSION}


RUN mkdir /data && mkdir /data/lucene && chown -R 1000:1000 /data

# Link to hardcoded config location
RUN mkdir -p /data/sds/config \
    && ln -s /config/config/sensitive-data-service/sds-config.properties /data/sds/config/sds-config.properties

COPY --from=builder \
    /gbif-backbone /data/lucene/gbif-backbone

USER 1000
WORKDIR /app

COPY --from=builder --chown=1000 \
    /project/ala-sensitive-data-server/target/ala-sensitive-data-server-${VERSION}.jar /app/app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar", "server"]
CMD ["config.yml"]

HEALTHCHECK CMD curl --fail --silent http://localhost:9180 || exit 1