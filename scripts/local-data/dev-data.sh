#!/usr/bin/env bash
# Use DEV data in the local stack (docker/docker-compose.yaml), either live or as a copy.
#
#   dev-data.sh forward solr        Replace the local Solr with a tunnel to the DEV Solr (live, nothing copied)
#   dev-data.sh forward stop        Remove the tunnel and start the local Solr again
#   dev-data.sh import [mysql] [postgres] [solr]
#                                   Copy DEV data into the local MySQL, PostGIS and Solr (default: all three).
#                                   Replaces the local databases/collections it imports.
#
# Environment:
#   AWS_PROFILE       profile with the developer role (default: inbo-dev); asks for MFA once
#   MYSQL_DBS         default: "collectory apikey alerts logger specieslists"
#   POSTGRES_DBS      default: "layersdb images dataqualityfilter"
#   SOLR_COLLECTIONS  default: "bie biocache"
#   SOLR_MAX_DOCS     max documents per collection, 0 = all (default: 100000)
#   SOLR_QUERY        which documents to copy (default: *:*)
#   DUMP_DIR          where dumps are kept (default: ~/.cache/vbp-dev-data); they contain personal data
#
# Works through SSM port-forwarding sessions via running ECS tasks (see docker/dev-tunnel). Each tunnel
# runs as a container on the compose network, so the services and dump tools reach DEV by hostname.
set -euo pipefail

REPO_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
COMPOSE=(docker compose -f "${REPO_DIR}/docker/docker-compose.yaml")
NETWORK=${NETWORK:-docker_default}
CLUSTER=inbo-vbp-cluster
TUNNEL_IMAGE=local/inbo-vbp-dev-tunnel:dev
LOCAL_PASSWORD=my-super-secret-password   # local stack passwords (config/local-db-init)
MYSQL_CLIENT_IMAGE=mysql:8.4              # same major version as DEV (Aurora MySQL 8.4)
POSTGRES_CLIENT_IMAGE=postgis/postgis:16-3.4-alpine

export AWS_PROFILE=${AWS_PROFILE:-inbo-dev}
export AWS_REGION=${AWS_REGION:-eu-west-1}
MYSQL_DBS=${MYSQL_DBS:-collectory apikey alerts logger specieslists}
POSTGRES_DBS=${POSTGRES_DBS:-layersdb images dataqualityfilter}
SOLR_COLLECTIONS=${SOLR_COLLECTIONS:-bie biocache}
SOLR_MAX_DOCS=${SOLR_MAX_DOCS:-100000}
SOLR_QUERY=${SOLR_QUERY:-*:*}
DUMP_DIR=${DUMP_DIR:-${HOME}/.cache/vbp-dev-data}

DEV_SOLR_HOST=solr-efs-1.vbp.internal

# Per database: DEV secret holding its credentials, and the local owner
declare -A SECRET=(
    [collectory]=/inbo/vbp/collectory [apikey]=/inbo/vbp/apikey [alerts]=/inbo/vbp/alerts
    [logger]=/inbo/vbp/logger [specieslists]=/inbo/vbp/species-list
    [layersdb]=/inbo/vbp/spatial-service [images]=/inbo/vbp/image-service
    [dataqualityfilter]=/inbo/vbp/data-quality-filter-service
)
declare -A LOCAL_OWNER=([layersdb]=spatial [images]=images [dataqualityfilter]=dataqualityfilter)

log() { echo "==> $*" >&2; }
die() { echo "ERROR: $*" >&2; exit 1; }

ENV_FILE=""
TUNNELS=()
cleanup() {
    for t in "${TUNNELS[@]}"; do docker rm -f "${t}" >/dev/null 2>&1 || true; done
    [[ -n "${ENV_FILE}" ]] && rm -f "${ENV_FILE}"
}
trap cleanup EXIT

aws_login() {
    [[ -n "${ENV_FILE}" ]] && return
    log "Getting temporary credentials for profile ${AWS_PROFILE} (MFA prompt)"
    eval "$(aws configure export-credentials --profile "${AWS_PROFILE}" --format env)"
    unset AWS_PROFILE   # use the exported credentials from here on, without asking for MFA again
    ENV_FILE=$(mktemp)
    chmod 600 "${ENV_FILE}"
    printf 'AWS_ACCESS_KEY_ID=%s\nAWS_SECRET_ACCESS_KEY=%s\nAWS_SESSION_TOKEN=%s\nAWS_REGION=%s\n' \
        "${AWS_ACCESS_KEY_ID}" "${AWS_SECRET_ACCESS_KEY}" "${AWS_SESSION_TOKEN}" "${AWS_REGION}" > "${ENV_FILE}"
}

build_tunnel_image() {
    docker image inspect "${TUNNEL_IMAGE}" >/dev/null 2>&1 && return
    log "Building ${TUNNEL_IMAGE}"
    docker build --load -q -t "${TUNNEL_IMAGE}" "${REPO_DIR}/docker/dev-tunnel" >/dev/null
}

# SSM target of the first running task of an ECS service: ecs:<cluster>_<task id>_<runtime id>
ssm_target() {
    local service=$1 task runtime
    task=$(aws ecs list-tasks --cluster "${CLUSTER}" --service-name "${service}" --desired-status RUNNING \
        --query 'taskArns[0]' --output text)
    [[ -n "${task}" && "${task}" != None ]] || die "no running ECS task for ${service}"
    runtime=$(aws ecs describe-tasks --cluster "${CLUSTER}" --tasks "${task}" \
        --query "tasks[0].containers[?name=='${service}'].runtimeId | [0]" --output text)
    [[ -n "${runtime}" && "${runtime}" != None ]] || die "no runtime id for container ${service}"
    echo "ecs:${CLUSTER}_${task##*/}_${runtime}"
}

# Host part of the dataSource.url env var in a service's task definition (RDS cluster endpoint)
datasource_host() {
    local service=$1 url
    url=$(aws ecs describe-task-definition --task-definition "inbo-vbp-${service}" \
        --query "taskDefinition.containerDefinitions[?name=='${service}'] | [0].environment[?name=='dataSource.url'] | [0].value" \
        --output text)
    [[ "${url}" == jdbc:* ]] || die "no dataSource.url in the ${service} task definition"
    url=${url#jdbc:*://}
    echo "${url%%[:/]*}"
}

# start_tunnel NAME VIA_SERVICE REMOTE_HOST REMOTE_PORT [docker run options...]
start_tunnel() {
    local name=vbp-dev-tunnel-$1 via=$2 host=$3 port=$4
    shift 4
    docker rm -f "${name}" >/dev/null 2>&1 || true
    log "Tunnel ${name}: ${host}:${port} via ECS service ${via}"
    docker run -d --name "${name}" --network "${NETWORK}" --env-file "${ENV_FILE}" \
        -e SSM_TARGET="$(ssm_target "${via}")" -e REMOTE_HOST="${host}" -e REMOTE_PORT="${port}" \
        "$@" "${TUNNEL_IMAGE}" >/dev/null
    for _ in $(seq 1 60); do
        docker logs "${name}" 2>&1 | grep -q "Tunnel ready" && return
        [[ "$(docker inspect -f '{{.State.Running}}' "${name}")" == true ]] || break
        sleep 1
    done
    docker logs "${name}" >&2 || true
    die "tunnel ${name} did not come up"
}

secret_field() {  # secret_field SECRET_ID JSON_KEY
    aws secretsmanager get-secret-value --secret-id "$1" --query SecretString --output text |
        python3 -c "import json,sys; print(json.load(sys.stdin)['$2'])"
}

new_dump_dir() {
    local dir
    dir="${DUMP_DIR}/$(date +%Y%m%d-%H%M%S)"
    mkdir -p "${dir}"
    chmod 700 "${DUMP_DIR}" "${dir}"
    echo "${dir}"
}

import_mysql() {
    local dir=$1 db user password
    start_tunnel mysql collectory "$(datasource_host collectory)" 3306
    for db in ${MYSQL_DBS}; do
        [[ -n "${SECRET[$db]:-}" ]] || die "unknown MySQL database ${db}"
        user=$(secret_field "${SECRET[$db]}" mysql_username)
        password=$(secret_field "${SECRET[$db]}" mysql_password)
        log "MySQL ${db}: dumping from DEV"
        docker run --rm --network "${NETWORK}" -e MYSQL_PWD="${password}" "${MYSQL_CLIENT_IMAGE}" \
            mysqldump --host=vbp-dev-tunnel-mysql --user="${user}" \
            --single-transaction --routines --triggers --events --set-gtid-purged=OFF --no-tablespaces \
            "${db}" |
            sed -E 's/DEFINER=`[^`]+`@`[^`]+`//g' > "${dir}/${db}.sql"
        log "MySQL ${db}: replacing the local database ($(du -h "${dir}/${db}.sql" | cut -f1))"
        docker run --rm -i --network "${NETWORK}" -e MYSQL_PWD="${LOCAL_PASSWORD}" "${MYSQL_CLIENT_IMAGE}" \
            mysql --host=mysql --user=root \
            -e "DROP DATABASE IF EXISTS \`${db}\`; CREATE DATABASE \`${db}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
        docker run --rm -i --network "${NETWORK}" -e MYSQL_PWD="${LOCAL_PASSWORD}" "${MYSQL_CLIENT_IMAGE}" \
            mysql --host=mysql --user=root "${db}" < "${dir}/${db}.sql"
    done
}

import_postgres() {
    local dir=$1 db user password owner extensions
    start_tunnel postgres spatial-service "$(datasource_host spatial-service)" 5432
    for db in ${POSTGRES_DBS}; do
        [[ -n "${SECRET[$db]:-}" ]] || die "unknown PostgreSQL database ${db}"
        user=$(secret_field "${SECRET[$db]}" postgres_username)
        password=$(secret_field "${SECRET[$db]}" postgres_password)
        owner=${LOCAL_OWNER[$db]}
        log "PostgreSQL ${db}: dumping from DEV"
        docker run --rm --network "${NETWORK}" -e PGPASSWORD="${password}" "${POSTGRES_CLIENT_IMAGE}" \
            pg_dump --host=vbp-dev-tunnel-postgres --username="${user}" --dbname="${db}" \
            --format=custom --no-owner --no-privileges > "${dir}/${db}.dump"
        log "PostgreSQL ${db}: replacing the local database ($(du -h "${dir}/${db}.dump" | cut -f1)), owner ${owner}"
        # Extensions need a superuser, so create them first; the rest is restored as the local owner.
        # Skip what the extensions create themselves (PostGIS: spatial_ref_sys rows, the topology schema).
        docker run --rm -i "${POSTGRES_CLIENT_IMAGE}" pg_restore --list < "${dir}/${db}.dump" > "${dir}/${db}.list"
        extensions=$(sed -nE 's/^[0-9]+; [0-9]+ [0-9]+ EXTENSION - ([a-z_0-9]+) .*/\1/p' "${dir}/${db}.list")
        grep -vE ' (EXTENSION|COMMENT - EXTENSION|SCHEMA - topology|COMMENT - SCHEMA topology|TABLE DATA public spatial_ref_sys|TABLE DATA topology|SEQUENCE SET topology) ' \
            "${dir}/${db}.list" > "${dir}/${db}.restore-list"
        {
            echo "DROP DATABASE IF EXISTS ${db} WITH (FORCE);"
            echo "CREATE DATABASE ${db} OWNER ${owner};"
            echo "\\connect ${db}"
            for ext in ${extensions}; do echo "CREATE EXTENSION IF NOT EXISTS ${ext} CASCADE;"; done
        } | docker run --rm -i --network "${NETWORK}" -e PGPASSWORD="${LOCAL_PASSWORD}" "${POSTGRES_CLIENT_IMAGE}" \
            psql --quiet --host=postgis --username=postgres --dbname=postgres --set=ON_ERROR_STOP=1
        docker run --rm --network "${NETWORK}" -e PGPASSWORD="${LOCAL_PASSWORD}" -v "${dir}:/dump:ro,z" "${POSTGRES_CLIENT_IMAGE}" \
            pg_restore --host=postgis --username=postgres --dbname="${db}" --role="${owner}" \
            --no-owner --no-privileges --use-list="/dump/${db}.restore-list" "/dump/${db}.dump" ||
            log "PostgreSQL ${db}: pg_restore reported errors (see above); check whether they matter"
    done
}

import_solr() {
    local collection
    "${COMPOSE[@]}" ps --status running solr | grep -q solr ||
        die "the local solr container is not running (dev-data.sh forward stop, or docker compose up -d solr)"
    start_tunnel solr-source biocache-service "${DEV_SOLR_HOST}" 8983 -p 127.0.0.1:18983:8983
    for collection in ${SOLR_COLLECTIONS}; do
        python3 "${REPO_DIR}/scripts/local-data/solr-copy.py" http://127.0.0.1:18983/solr http://localhost:8983/solr \
            "${collection}" --query "${SOLR_QUERY}" --max-docs "${SOLR_MAX_DOCS}"
    done
}

forward_solr() {
    cat >&2 <<EOF
WARNING: the local services will use the DEV Solr directly. Anything that writes to Solr
(bie-index imports, sandbox uploads, ...) changes DEV. Stop with: $0 forward stop
EOF
    "${COMPOSE[@]}" stop solr
    # Same alias as the local solr container, so the services need no config change.
    # Not removed on exit: it keeps running until "forward stop".
    start_tunnel solr biocache-service "${DEV_SOLR_HOST}" 8983 \
        --network-alias solr.vbp.internal -p 127.0.0.1:8983:8983 --restart no
    log "DEV Solr is now solr.vbp.internal:8983 for the services and http://localhost:8983/solr for you."
    log "The temporary AWS credentials expire (usually after 1 hour); run this again when the tunnel exits."
}

forward_stop() {
    docker rm -f vbp-dev-tunnel-solr >/dev/null 2>&1 || true
    "${COMPOSE[@]}" up -d --no-deps solr
    log "Local Solr is back"
}

main() {
    local cmd=${1:-}
    shift || true
    case "${cmd}" in
        forward)
            case "${1:-}" in
                solr) build_tunnel_image; aws_login; forward_solr ;;
                stop) forward_stop ;;
                *) die "usage: $0 forward solr|stop" ;;
            esac
            ;;
        import)
            local targets=("$@") dir
            [[ ${#targets[@]} -gt 0 ]] || targets=(mysql postgres solr)
            build_tunnel_image
            aws_login
            dir=$(new_dump_dir)
            log "Dumps go to ${dir}"
            TUNNELS=(vbp-dev-tunnel-mysql vbp-dev-tunnel-postgres vbp-dev-tunnel-solr-source)
            for t in "${targets[@]}"; do
                case "${t}" in
                    mysql) import_mysql "${dir}" ;;
                    postgres) import_postgres "${dir}" ;;
                    solr) import_solr ;;
                    *) die "unknown import target ${t} (mysql, postgres, solr)" ;;
                esac
            done
            log "Done. Restart the services so they pick up the new data:"
            log "  docker compose -f docker/docker-compose.yaml restart portal-full portal-full-jdk17 alerts"
            ;;
        *) sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; exit 1 ;;
    esac
}

main "$@"
