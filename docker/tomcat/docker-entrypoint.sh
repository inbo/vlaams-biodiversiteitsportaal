#!/usr/bin/env bash

# Create initial data folders
mkdir -p /data/ala-bie-hub && chown ${UID}:${GID} /data/ala-bie-hub
mkdir -p /data/bie-index && chown ${UID}:${GID} /data/bie-index
mkdir -p /data/ala-hub && chown ${UID}:${GID} /data/ala-hub
mkdir -p /data/biocache-service && chown ${UID}:${GID} /data/biocache-service
mkdir -p /data/collectory && chown ${UID}:${GID} /data/collectory
mkdir -p /data/spatial-data && chown ${UID}:${GID} /data/spatial-data
mkdir -p /data/specieslist-webapp && chown ${UID}:${GID} /data/specieslist-webapp

# Starts the tomcat as the given user, set by UID and GID env variables
# Accepts any number of directories as arguments to change their ownership

# Traps the SIGTERM and shuts down tomcat gracefully
trap_term () {
    /usr/local/tomcat/bin/catalina.sh stop
}

trap trap_term SIGTERM


if [ ! -z "${REMOTE_DEBUGGER_PORT}" ]; then
    echo "Enabling remote debugging on port ${REMOTE_DEBUGGER_PORT}"
    export CATALINA_OPTS="${CATALINA_OPTS} -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:${REMOTE_DEBUGGER_PORT}"
fi

if [ ! -z "${REMOTE_JMX_PORT}" ]; then
    echo "Enabling remote JMX on port ${REMOTE_JMX_PORT}"

    echo "vbp_jmx readwrite" > jmxremote.access
    echo "vbp_jmx ${REMOTE_JMX_PASSWORD}" > jmxremote.password
    chmod 600 jmxremote.access jmxremote.password

    export CATALINA_OPTS="${CATALINA_OPTS} -Dcom.sun.management.jmxremote=true -Dcom.sun.management.jmxremote.port=${REMOTE_JMX_PORT} -Dcom.sun.management.jmxremote.rmi.port=${REMOTE_JMX_PORT} -Dcom.sun.management.jmxremote.ssl=false -Dcom.sun.management.jmxremote.authenticate=true -Dcom.sun.management.jmxremote.local.only=false -Dcom.sun.management.jmxremote.access.file=jmxremote.access -Dcom.sun.management.jmxremote.password.file=jmxremote.password -Dspring.jmx.enabled=true"
fi

# Check if UID is given
if [ ! -z "${UID}" ]; then
    echo "Trying to start Tomcat as user ${UID}"
    # Check if a user exists with the given UID
    if ! id -u ${UID} > /dev/null 2>&1; then
        echo "The user ${UID} does not exist, trying to create it"
        # Adding group
        groupadd --gid ${GID} tomcat-users
        # Adding user
        useradd --no-create-home --gid ${GID} --uid ${UID} tomcat-user
    fi
    # Change ownership of tomcat
    chown -R ${UID}:${GID} /usr/local/tomcat
    # Change ownership of volume mapped directiories given as arguments, fails silently
    for dir in "$@"
    do
        chown -f -R ${UID}:${GID} $dir
    done

    # Change ownership of spatial-data
    chown -R ${UID}:${GID} /data/spatial-data

    # Starting tomcat
    echo "Starting Tomcat as user ${UID}"
    su -m `id -run ${UID}` -c "/usr/local/tomcat/bin/catalina.sh run" &
else
    echo "No UID specified, starting Tomcat as root"
    /usr/local/tomcat/bin/catalina.sh run &
fi

CHILD=$!
wait ${CHILD}
