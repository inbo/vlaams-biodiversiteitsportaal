# syntax=docker/dockerfile:1.14.0
ARG BUILDPLATFORM=linux/amd64

# What is built: one source of truth, used for the checkout AND the labels of the final image.
# COMMIT must be a full commit SHA (branches/tags fail the checkout verification).
ARG SOURCE=https://github.com/AtlasOfLivingAustralia/image-service.git
ARG COMMIT=a985729fd00f985a127e50ecace3190715001f2d
# App version at COMMIT (root gradle.properties). Only used for labels, which cannot be derived
# inside a Dockerfile: the build fails if it differs from the version gradle built.
ARG APP_VERSION=4.2.0-SNAPSHOT

FROM --platform=${BUILDPLATFORM} custom-gradle-jdk21 AS builder

ARG SOURCE
ARG COMMIT
ARG APP_VERSION

# The image-utils sub-project is compiled with a java 11 toolchain, gradle auto-detects it in /usr/lib/jvm
# trivy:ignore:DS-0015  # using BuildKit yum cache
RUN --mount=type=cache,target=/var/cache/yum,sharing=locked \
  yum install -y java-11-amazon-corretto-devel \
  && gradle --version | grep -E '^Launcher JVM: +21\.'

WORKDIR /project
# Fetch only the pinned commit and verify that is what got checked out
RUN git init --quiet . \
  && git remote add origin ${SOURCE} \
  && git fetch --depth 1 origin ${COMMIT} \
  && git checkout --detach FETCH_HEAD \
  && test "$(git rev-parse HEAD)" = "${COMMIT}"

# Locale resolver override (default locale nl, vbp-lang cookie).
# Fail instead of silently replacing/duplicating if upstream starts defining its own.
RUN test ! -e image-service/grails-app/conf/spring/resources.xml \
  && test -d image-service/grails-app && test -d image-service/src/main \
  && ! grep -rn "localeResolver" image-service/grails-app image-service/src/main
COPY resources.xml ./image-service/grails-app/conf/spring/resources.xml

COPY vbp.init.gradle /opt/vbp/vbp.init.gradle
# Upstream depends on the moving images-client-plugin 1.6-SNAPSHOT: use the copy kept in this repo (git lfs) instead
COPY maven-repo /opt/vbp/maven-repo
RUN unzip -tq /opt/vbp/maven-repo/au/org/ala/plugins/grails/images-client-plugin/*/*.jar \
  || { echo "ERROR: images-client-plugin jar is not a jar, was the repo checked out without git lfs?" >&2; exit 1; }

# skipNativeDzBridgeBuild: do not compile/bundle the optional native libvips tiler bridge (disabled by default at runtime)
RUN --mount=type=cache,target=/gradle-cache,ro \
  gradle --init-script /opt/vbp/vbp.init.gradle \
  :image-service:assetCompile :image-service:bootWar \
  -PskipNativeDzBridgeBuild=true

# Copy dependencies to shared read-only cache
RUN --mount=type=cache,target=/gradle-cache,sharing=locked \
  rsync -a /home/gradle/.gradle/caches/modules-2 /gradle-cache \
  && rm /gradle-cache/modules-2/*.lock && rm /gradle-cache/modules-2/gc.properties

RUN ls -la /project/image-service/build/libs

# Resolve the built artifact to a fixed path and verify what is in it
RUN <<EOR
set -eu
fail() { echo "ERROR: $*" >&2; exit 1; }

wars=$(ls /project/image-service/build/libs/*.war | grep -v -- '-plain\.war$')
test "$(echo "${wars}" | wc -l)" -eq 1 || fail "expected exactly 1 executable war, found: ${wars}"
test "$(basename "${wars}")" = "image-service-${APP_VERSION}.war" \
  || fail "built ${wars}, which is not version APP_VERSION=${APP_VERSION}"
mv "${wars}" /image-service.war

jar tf /image-service.war > /tmp/war-contents.txt
grep -qx "WEB-INF/classes/spring/resources.xml" /tmp/war-contents.txt || fail "locale resolver override is not in the war"
grep -qx "assets/manifest.properties" /tmp/war-contents.txt || fail "compiled assets are not in the war"
# No moving snapshot dependencies from a remote repository:
# only image-utils (built from this same commit) and the images-client-plugin kept in this repo
if grep -E "^WEB-INF/lib/.*SNAPSHOT" /tmp/war-contents.txt \
  | grep -vE "^WEB-INF/lib/(image-utils-${APP_VERSION}|images-client-plugin-[0-9.]+-SNAPSHOT)\.jar$"; then
  fail "unpinned snapshot dependencies in the war (listed above)"
fi
EOR

FROM amazoncorretto:21.0.12

ARG SOURCE
ARG COMMIT
ARG APP_VERSION

COPY --from=builder /opt/opentelemetry-agent /opt/opentelemetry-agent

# Default based on repo structure, can be overridden at runtime
ENV SPRING_CONFIG_ADDITIONAL-LOCATION="file:/config/common/common.yml,file:/config/image-service/image-service.yml"
# Symlink to i18n files location, unfortunately hard-coded at docker image build time
RUN mkdir -p /opt/atlas/i18n \
  && ln -s /config/image-service/i18n/crowdin /opt/atlas/i18n/image-service \
  && mkdir -p /var/opt/atlas/i18n \
  && ln -s /config/image-service/i18n/override /var/opt/atlas/i18n/image-service

LABEL ala.version=${APP_VERSION}
LABEL org.opencontainers.image.source=${SOURCE}
LABEL org.opencontainers.image.revision=${COMMIT}
LABEL org.opencontainers.image.version=${APP_VERSION}

COPY --from=builder /image-service.war /image-service.war

HEALTHCHECK CMD curl --fail --silent http://localhost:8080/image-service/actuator/health || exit 1

ENV JAVA_RELECT_OPTS="--add-opens java.base/java.lang=ALL-UNNAMED --add-opens java.base/java.lang.reflect=ALL-UNNAMED"

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} ${JAVA_RELECT_OPTS} -jar /image-service.war"]

RUN mkdir /data
RUN chown 1000:1000 /data
VOLUME /data

USER 1000:1000
