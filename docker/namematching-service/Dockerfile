# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-maven AS builder

ARG VERSION=1.8.1
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-namematching-service.git
LABEL ala.version=${VERSION}

WORKDIR /project
RUN git clone --branch v${VERSION} --depth 1 ${SOURCE} .

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn --batch-mode --no-transfer-progress \
        clean package -DskipTests -T 4 -U

FROM openjdk:11

ARG VERSION=1.8.1
LABEL ala.version=${VERSION}

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && mkdir /data/lucene && chown -R app:app /data

USER app
WORKDIR /data/lucene

RUN curl https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/taxonomy/namematching-gbif-backbone-lucene-8-2024-09-11.tgz -o namematching-nm.tgz \
    && tar -xzf namematching-nm.tgz \
    && mv namematching-gbif-backbone-lucene-8-2024-09-11 namematching-nm \
    && rm namematching-nm.tgz

WORKDIR /app

COPY --from=builder --chown=app \
    /project/server/target/ala-namematching-server-${VERSION}.jar /app/app.jar

COPY --from=builder --chown=app \
    /project/server/config.yml /app/config.yml

RUN mkdir /data/ala-namematching-service && mkdir /data/ala-namematching-service/config
COPY groups.json /data/ala-namematching-service/config/groups.json
COPY subgroups.json /data/ala-namematching-service/config/subgroups.json

ENTRYPOINT ["java", "-jar", "/app/app.jar", "server", "config.yml"]

HEALTHCHECK CMD curl --fail --silent http://localhost:9180 || exit 1