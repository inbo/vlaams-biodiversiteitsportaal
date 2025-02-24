#!/usr/bin/env bash

REMOTE_HOST=${1:?First argument "remote host" must be provided}
REMOTE_PORT=${2:?Second argument "remote port" must be provided}
LOCAL_PORT=${3:?Third argument "local port" must be provided}

# find the instance ID based on Tag Name
INSTANCE_ID=$(aws ec2 describe-instances \
               --filter "Name=tag:Name,Values=bastion" \
               --query "Reservations[].Instances[?State.Name == 'running'].InstanceId[]" \
               --output text)

# Issue with ssm only binding on 127.0.0.1, making the port unavailable to docker containers
# https://github.com/aws/session-manager-plugin/issues/14
# Fixed by forwarding using socat on a port with a 1 pre-pended
if [[ "$(uname -s)" == "Linux" ]]; then
  socat TCP-LISTEN:${LOCAL_PORT},fork,reuseaddr TCP:127.0.0.1:1${LOCAL_PORT} &
  LOCAL_PORT="1${LOCAL_PORT}"
fi

# create the port forwarding tunnel
aws ssm start-session --target "${INSTANCE_ID}" \
                       --document-name AWS-StartPortForwardingSessionToRemoteHost \
                       --parameters "host=${REMOTE_HOST},portNumber=${REMOTE_PORT},localPortNumber=${LOCAL_PORT}"
