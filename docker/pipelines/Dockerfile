# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} maven:3.9-amazoncorretto-17 AS custom-maven-17

RUN mkdir ~/.m2
COPY settings.xml /root/.m2/settings.xml

RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum -y install git unzip

# Download and unzip aws x-ray agent for easy copy to runtime images
RUN mkdir /opt/aws-xray-agent \
    && curl -fL https://github.com/aws/aws-xray-java-agent/releases/latest/download/xray-agent.zip -o /opt/aws-xray-agent/xray-agent.zip \
    && unzip /opt/aws-xray-agent/xray-agent.zip -d /opt/aws-xray-agent \
    && rm /opt/aws-xray-agent/xray-agent.zip

# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-maven-17 as builder

ARG VERSION=dev
ARG COMMIT=d9b134f738416ee34f41dc116b5c106795fc487f
ARG SOURCE=https://github.com/gbif/pipelines.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /app
RUN git clone --branch ${VERSION} ${SOURCE} . && git checkout ${COMMIT}

RUN --mount=type=cache,target=/root/.m2/repository \
    mvn --batch-mode --no-transfer-progress \
        clean install -DskipTests -DskipITs -T 10 -U \
    && cd livingatlas \
    && mvn --batch-mode --no-transfer-progress \
        clean package -P livingatlas-artifacts -DskipTests -DskipITs -T 10 -U

# ARG VERSION=pipelines-parent-2.18.5
# RUN git clone --branch ${VERSION} --depth 1 https://github.com/gbif/pipelines.git /app
# WORKDIR /app
#
# RUN --mount=type=cache,target=/root/.m2/repository \
#     cd livingatlas && mvn clean package -P livingatlas-artifacts -DskipTests -DskipITs -T 10 -U

# ARG test=2
# RUN ls -la livingatlas/pipelines/target/pipelines-2.18.6-SNAPSHOT.jar
#
FROM amazoncorretto:17

ARG COMMIT=d9b134f738416ee34f41dc116b5c106795fc487f
LABEL ala.version=inbo-${COMMIT}
#
# ARG VERSION=2.18.6-SNAPSHOT
RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
    yum update -y && \
    yum install -y \
    nano \
    file \
    curl \
    unzip \
    which \
    shadow-utils

RUN mkdir /data && chown 1000:1000 /data
VOLUME /data

ARG TARGETARCH

RUN curl -o /usr/bin/yq -LJO https://github.com/mikefarah/yq/releases/download/v4.44.3/yq_linux_$TARGETARCH \
    && chmod +x /usr/bin/yq

RUN if [ $TARGETARCH = "amd64" ] ; then curl -o /usr/bin/docopts -LJO https://github.com/docopt/docopts/releases/download/v0.6.3-rc2/docopts_linux_amd64 ; fi
RUN if [ $TARGETARCH = "arm64" ] ; then curl -o /usr/bin/docopts -LJO https://github.com/docopt/docopts/releases/download/v0.6.3-rc2/docopts_linux_arm ; fi
RUN chmod +x /usr/bin/docopts

RUN if [ $TARGETARCH = "amd64" ] ; then curl https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o "awscliv2.zip" ; fi
RUN if [ $TARGETARCH = "arm64" ] ; then curl https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip -o "awscliv2.zip" ; fi
RUN unzip -q awscliv2.zip && \
    ./aws/install

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

USER 1000

COPY --from=builder --chown=1000:1000 /app /app

WORKDIR /app/livingatlas/scripts

ENTRYPOINT ["bash", "-c"]
