#!/usr/bin/env bash

REMOTE_HOST=${1:?First argument "remote host" must be provided}
REMOTE_PORT=${2:?Second argument "remote port" must be provided}
LOCAL_PORT=${3:?Third argument "local port" must be provided}

# find the instance ID based on Tag Name
INSTANCE_ID=$(aws ec2 describe-instances \
               --filter "Name=tag:Name,Values=bastion" \
               --query "Reservations[].Instances[?State.Name == 'running'].InstanceId[]" \
               --output text)

# create the port forwarding tunnel
aws ssm start-session --target "${INSTANCE_ID}" \
                       --document-name AWS-StartPortForwardingSessionToRemoteHost \
                       --parameters "host=${REMOTE_HOST},portNumber=${REMOTE_PORT},localPortNumber=${LOCAL_PORT}"
