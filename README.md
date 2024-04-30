# Vlaams biodiversiteit portaal

## Run locally

```commandline
cd containerized
COMPOSE_PARALLEL_LIMIT=1 docker-compose up --build -d

python -m venv .venv
. .venv/bin/activate
pip install requests
python ./cas-management/register-oid-clients.py
```