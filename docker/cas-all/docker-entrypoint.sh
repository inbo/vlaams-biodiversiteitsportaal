#!/usr/bin/env bash

# Create initial data folders
mkdir -p /data/cas && chown ${UID}:${GID} /data/cas
mkdir -p /data/cas-management && chown ${UID}:${GID} /data/cas-management

# Starts the tomcat as the given user, set by UID and GID env variables
# Accepts any number of directories as arguments to change their ownership

# Traps the SIGTERM and shuts down tomcat gracefully
trap_term () {
    /usr/local/tomcat/bin/catalina.sh stop
}

trap trap_term SIGTERM

# Check if UID is given
if [ ! -z "${UID}" ]; then
    echo "Trying to start Tomcat as user ${UID}"
    # Check if a user exists with the given UID
    if ! id -u ${UID} > /dev/null 2>&1; then
        echo "The user ${UID} does not exist, trying to create it"
        # Adding group
        addgroup --gid ${GID} tomcat-users
        # Adding user
        adduser --disabled-password --gecos "" --no-create-home --gid ${GID} --uid ${UID} tomcat-user
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
