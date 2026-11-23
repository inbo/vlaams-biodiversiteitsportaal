#!/usr/bin/env bash
# Opens an SSM port-forwarding session to REMOTE_HOST:REMOTE_PORT through SSM_TARGET (an ECS task
# container, "ecs:<cluster>_<task id>_<runtime id>") and makes it reachable on LISTEN_PORT of this
# container. The session manager plugin only listens on 127.0.0.1, so socat relays it.
# AWS credentials come from the environment (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKEN).
set -euo pipefail

: "${SSM_TARGET:?SSM_TARGET must be set}"
: "${REMOTE_HOST:?REMOTE_HOST must be set}"
: "${REMOTE_PORT:?REMOTE_PORT must be set}"
LISTEN_PORT=${LISTEN_PORT:-${REMOTE_PORT}}
SESSION_PORT=${SESSION_PORT:-40000}

echo "Opening SSM session to ${REMOTE_HOST}:${REMOTE_PORT} via ${SSM_TARGET}"
aws ssm start-session \
    --target "${SSM_TARGET}" \
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters "host=${REMOTE_HOST},portNumber=${REMOTE_PORT},localPortNumber=${SESSION_PORT}" &
ssm_pid=$!

for _ in $(seq 1 60); do
    if (exec 3<>"/dev/tcp/127.0.0.1/${SESSION_PORT}") 2>/dev/null; then
        break
    fi
    if ! kill -0 "${ssm_pid}" 2>/dev/null; then
        echo "SSM session exited before the tunnel was up" >&2
        exit 1
    fi
    sleep 1
done

socat "TCP-LISTEN:${LISTEN_PORT},fork,reuseaddr" "TCP:127.0.0.1:${SESSION_PORT}" &
socat_pid=$!
echo "Tunnel ready on port ${LISTEN_PORT}"

# Stop as soon as either side stops, so a dead session is visible (container exits)
wait -n "${ssm_pid}" "${socat_pid}"
echo "Tunnel stopped" >&2
exit 1
