# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-maven AS builder

ARG BACKBONE_VERSION=2026-11-09
ARG VERSION=upgrade-master
ARG SOURCE=https://github.com/inbo/vbp-ala-namematching-service.git
ARG COMMIT=e9a54cd44398f13d479051d6c725ed24f283d13a
LABEL ala.version=inbo-${COMMIT}

RUN curl --fail https://build.natuurdata.dev.inbo.be/taxonomy/namematching-gbif-backbone-lucene-8-${BACKBONE_VERSION}.tgz -o /namematching-nm.tgz \
  && tar -xzf /namematching-nm.tgz \
  && mv namematching-gbif-backbone-lucene-8-${BACKBONE_VERSION} /namematching-nm \
  && rm /namematching-nm.tgz

WORKDIR /project
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

RUN --mount=type=cache,target=/root/.m2/repository \
  mvn --batch-mode --no-transfer-progress \
  clean package -DskipTests -T 4 -U

FROM amazoncorretto:21.0.13-al2023-headless

ARG VERSION=1.8.3
LABEL ala.version=${VERSION}

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

RUN mkdir /data && mkdir /data/lucene && chown -R 1000:1000 /data

COPY --from=builder \
  /namematching-nm /data/lucene/namematching-nm

USER 1000

WORKDIR /app
COPY --from=builder --chown=1000 \
  /project/server/target/ala-namematching-server-${VERSION}.jar /app/app.jar

ENV CONFIG_LOCATIOM=/config/namematching-service/config.yml
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app/app.jar server ${CONFIG_LOCATIOM}"]
CMD ["config.yml"]

HEALTHCHECK CMD curl --fail --silent http://localhost:9180 || exit 1
