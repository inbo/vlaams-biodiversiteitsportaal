#!/usr/bin/env bash

set -x

SERVICE_NAME=${1:?First argument "service name" must be provided}
CONTAINER_NAME=${2:?Second argument "container name" must be provided}

CLUSTER="inbo-vbp-cluster"

# Find a running task for the given service
TASK_ARN=$(aws ecs list-tasks \
  --cluster "${CLUSTER}" \
  --service-name "${SERVICE_NAME}" \
  --desired-status RUNNING \
  --query "taskArns[0]" \
  --output text)

if [[ -z "${TASK_ARN}" || "${TASK_ARN}" == "None" ]]; then
  echo "ERROR: No running ECS task found for service '${SERVICE_NAME}' in cluster '${CLUSTER}'." >&2
  exit 1
fi

# Get the runtime ID of the named container and the task's private IP in one call.
# The task ENI IP is in the same network namespace as the container, so it works
# where "localhost" is rejected by the SSM agent.
# (List query, not a map: --output text sorts map keys alphabetically, which would
# swap the two columns.)
read -r RUNTIME_ID TASK_IP < <(aws ecs describe-tasks \
  --cluster "${CLUSTER}" \
  --tasks "${TASK_ARN}" \
  --query "[tasks[0].containers[?name=='${CONTAINER_NAME}'].runtimeId | [0], tasks[0].attachments[0].details[?name=='privateIPv4Address'].value | [0]]" \
  --output text)

if [[ -z "${RUNTIME_ID}" || "${RUNTIME_ID}" == "None" ]]; then
  echo "ERROR: Could not retrieve runtimeId for container '${CONTAINER_NAME}' in task '${TASK_ARN}'." >&2
  exit 1
fi

# REMOTE_HOST defaults to the task IP (set below); the SSM agent forbids "localhost".
# If the third argument is a number, treat it as REMOTE_PORT.
if [[ "${3}" =~ ^[0-9]+$ ]]; then
  REMOTE_HOST="${TASK_IP}"
  REMOTE_PORT=${3:?Third argument "remote port" must be provided}
  LOCAL_PORT=${4:?Fourth argument "local port" must be provided}
else
  REMOTE_HOST=${3:-${TASK_IP}}
  REMOTE_PORT=${4:?Fourth argument "remote port" must be provided}
  LOCAL_PORT=${5:?Fifth argument "local port" must be provided}
fi

if [[ -z "${REMOTE_HOST}" || "${REMOTE_HOST}" == "None" ]]; then
  echo "ERROR: Could not determine task private IP for '${TASK_ARN}' (is the task awsvpc/Fargate?)." >&2
  exit 1
fi

TASK_ID=$(basename "${TASK_ARN}")
SSM_TARGET="ecs:${CLUSTER}_${TASK_ID}_${RUNTIME_ID}"

# Try making sure all child processes are killed when the script exits
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

# create the port forwarding tunnel
aws ssm start-session --target "${SSM_TARGET}" \
  --document-name AWS-StartPortForwardingSessionToRemoteHost \
  --parameters "host=${REMOTE_HOST},portNumber=${REMOTE_PORT},localPortNumber=${LOCAL_PORT}"
