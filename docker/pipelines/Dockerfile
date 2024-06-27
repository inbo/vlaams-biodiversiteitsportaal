FROM maven:3.8-openjdk-8 as builder

ARG VERSION=pipelines-parent-2.18.5

RUN mkdir ~/.m2
COPY settings.xml /root/.m2/settings.xml

RUN git clone --branch ${VERSION} --depth 1 https://github.com/gbif/pipelines.git /app
WORKDIR /app

RUN --mount=type=cache,target=/root/.m2/repository\
    cd livingatlas && mvn clean package -P livingatlas-artifacts -DskipTests -DskipITs -T 10 -U

# ARG test=2
# RUN ls -la livingatlas/pipelines/target/pipelines-2.18.6-SNAPSHOT.jar
#
# FROM openjdk:8
#
# ARG VERSION=2.18.6-SNAPSHOT

RUN apt-get update && apt-get -y install \
    nano \
    file

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && chown app:app /data
VOLUME /data
#
# RUN apt-get update &&\
#     apt-get install -y yq

RUN curl -o /usr/bin/yq -LJO https://github.com/mikefarah/yq/releases/download/v4.9.6/yq_linux_386 \
    && chmod +x /usr/bin/yq
RUN curl -o /usr/bin/docopts -LJO https://github.com/docopt/docopts/releases/download/v0.6.3-rc2/docopts_linux_amd64 &&\
    chmod +x /usr/bin/docopts


COPY config/la-pipelines.yaml /app/livingatlas/configs/la-pipelines.yaml

RUN chown -Rv app:app /app

USER app

WORKDIR /app/livingatlas/scripts

ENTRYPOINT ["bash", "-c"]

