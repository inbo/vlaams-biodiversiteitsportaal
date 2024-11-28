ARG BUILDPLATFORM=linux/amd64
FROM --platform=${BUILDPLATFORM} custom-maven AS builder

ARG VERSION=fixed-stuff
ARG COMMIT=3b99dedb91cd8a9ed3b8dc0af3b6028d9d138e24
ARG SOURCE=https://github.com/StefanVanDyck/pipelines.git
LABEL ala.version=inbo-${COMMIT}

WORKDIR /app
RUN git clone --branch ${VERSION} --depth 1 ${SOURCE} . && git checkout ${COMMIT}

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
FROM openjdk:8

ARG COMMIT=3b99dedb91cd8a9ed3b8dc0af3b6028d9d138e24
LABEL ala.version=inbo-${COMMIT}
#
# ARG VERSION=2.18.6-SNAPSHOT
RUN rm -f /etc/apt/apt.conf.d/docker-clean; echo 'Binary::apt::APT::Keep-Downloaded-Packages "true";' > /etc/apt/apt.conf.d/keep-cache
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt,sharing=locked \
    apt-get update && apt-get install -y --no-install-recommends \
    nano \
    file

# Create the user
RUN groupadd --gid 1000 app \
    && useradd --uid 1000 --gid 1000 -m -d /app app

RUN mkdir /data && chown app:app /data
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

USER app

COPY --from=builder --chown=app:app /app /app

WORKDIR /app/livingatlas/scripts

ENTRYPOINT ["bash", "-c"]
