# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-maven AS builder

ARG VERSION=1.8.1
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/ala-namematching-service.git
LABEL ala.version=${VERSION}

RUN curl https://inbo-vbp-global-public-artifacts.s3.eu-west-1.amazonaws.com/taxonomy/namematching-gbif-backbone-lucene-8-2024-09-11.tgz -o /namematching-nm.tgz \
    && tar -xzf /namematching-nm.tgz \
    && mv namematching-gbif-backbone-lucene-8-2024-09-11 /namematching-nm \
    && rm /namematching-nm.tgz

WORKDIR /project
RUN git clone --branch v${VERSION} --depth 1 ${SOURCE} .

# Add custom dependencies to the server POM
RUN sed -i '/<\/dependencies>/i \
        <dependency>\n\
            <groupId>com.amazonaws</groupId>\n\
            <artifactId>aws-xray-recorder-sdk-slf4j</artifactId>\n\
            <version>2.20.0</version>\n\
        </dependency>' server/pom.xml

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn --batch-mode --no-transfer-progress \
        clean package -DskipTests -T 4 -U

FROM amazoncorretto:11

ARG VERSION=1.8.1
LABEL ala.version=${VERSION}

COPY --from=builder /opt/aws-xray-agent /opt/aws-xray-agent

RUN mkdir /data && mkdir /data/lucene && chown -R 1000:1000 /data

COPY --from=builder \
    /namematching-nm /data/lucene/namematching-nm

USER 1000

WORKDIR /app
COPY --from=builder --chown=1000 \
    /project/server/target/ala-namematching-server-${VERSION}.jar /app/app.jar

RUN mkdir /data/ala-namematching-service && mkdir /data/ala-namematching-service/config
COPY groups.json /data/ala-namematching-service/config/groups.json
COPY subgroups.json /data/ala-namematching-service/config/subgroups.json

ENV CONFIG_LOCATIOM=/config/namematching-service/config.yml
ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -jar /app/app.jar server ${CONFIG_LOCATIOM}"]
CMD ["config.yml"]

HEALTHCHECK CMD curl --fail --silent http://localhost:9180 || exit 1