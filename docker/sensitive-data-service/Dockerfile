ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-maven AS builder

ARG VERSION=1.1.1
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-sensitive-data-service.git
LABEL ala.version=${VERSION}

WORKDIR /project
RUN git clone --branch v${VERSION} --depth 1 ${SOURCE} .

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn --batch-mode --no-transfer-progress \
        clean package -DskipTests -T 4 -U

FROM openjdk:11

ARG VERSION=1.1.1
LABEL ala.version=${VERSION}

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && mkdir /data/lucene && chown -R app:app /data

USER app
WORKDIR /data/lucene

ARG TAXONOMY_ARCHIVE=https://biodiversiteitsportaal-dev-backups.s3.eu-west-1.amazonaws.com/namematching-gbif-backbone-lucene-8-2024-09-11.tgz
RUN curl ${TAXONOMY_ARCHIVE} -o namematching-nm.tgz \
    && tar -xzf namematching-nm.tgz \
    && mv namematching-gbif-backbone-lucene-8-2024-09-11 namematching-nm \
    && rm namematching-nm.tgz

WORKDIR /app

COPY --from=builder --chown=app \
    /project/ala-sensitive-data-server/target/ala-sensitive-data-server-${VERSION}.jar /app/app.jar

COPY --from=builder --chown=app \
    /project/ala-sensitive-data-server/docker/config.yml /app/config.yml

RUN mkdir /data/ala-sensitive-data-service && mkdir /data/ala-sensitive-data-service/config

ENV CONFIG_LOCATION=/app/config.yml

ENTRYPOINT ["java", "-jar", "/app/app.jar", "server"]
CMD ["${CONFIG_LOCATION}"]

HEALTHCHECK CMD curl --fail --silent http://localhost:9180 || exit 1