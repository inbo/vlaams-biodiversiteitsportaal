#!/usr/bin/env bash
set -e

# Runs as the image user (UID/GID 1000, see Dockerfile).

# Create initial data folders
mkdir -p /data/ala-bie-hub /data/bie-index /data/ala-hub /data/biocache-service /data/collectory \
         /data/spatial-data /data/specieslist-webapp

# Locally the public URLs are http://localhost/<service> (common.domain), and the services also call
# those URLs server-side. Forward port 80 inside the container to nginx, so localhost means the same
# thing to the services as to the browser. Needs net.ipv4.ip_unprivileged_port_start <= 80 (see compose).
if [ -n "${LOCALHOST_PROXY_TARGET}" ]; then
    echo "Forwarding localhost:80 to ${LOCALHOST_PROXY_TARGET}"
    socat TCP-LISTEN:80,fork,reuseaddr "TCP:${LOCALHOST_PROXY_TARGET}" &
fi

# needed to find spatial-service libraries due to hardcoded paths in /data
if [ -x /opt/vbp/spatial-service/link-libs.sh ]; then
    /opt/vbp/spatial-service/link-libs.sh
fi

if [ -n "${REMOTE_DEBUGGER_PORT}" ]; then
    echo "Enabling remote debugging on port ${REMOTE_DEBUGGER_PORT}"
    export CATALINA_OPTS="${CATALINA_OPTS} -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:${REMOTE_DEBUGGER_PORT}"
fi

if [ -n "${REMOTE_JMX_PORT}" ]; then
    echo "Enabling remote JMX on port ${REMOTE_JMX_PORT}"

    echo "vbp_jmx readwrite" > /tmp/jmxremote.access
    echo "vbp_jmx ${REMOTE_JMX_PASSWORD}" > /tmp/jmxremote.password
    chmod 600 /tmp/jmxremote.access /tmp/jmxremote.password

    export CATALINA_OPTS="${CATALINA_OPTS} -Dcom.sun.management.jmxremote=true -Dcom.sun.management.jmxremote.port=${REMOTE_JMX_PORT} -Dcom.sun.management.jmxremote.rmi.port=${REMOTE_JMX_PORT} -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.authenticate=true -Dcom.sun.management.jmxremote.local.only=false -Dcom.sun.management.jmxremote.access.file=/tmp/jmxremote.access -Dcom.sun.management.jmxremote.password.file=/tmp/jmxremote.password -Dspring.jmx.enabled=true"
fi

# exec so tomcat receives SIGTERM directly and shuts down gracefully
exec "${CATALINA_HOME}/bin/catalina.sh" run
