#!/usr/bin/env bash
set -x -e

#vagrant up

export AI=$HOME/Projects/Inbo/ala-install

python3.11 -m venv .venv
. .venv/bin/activate
pip install ansible==2.10.3 six

# mkdir generated
# cd generated
# npm install yo generator-living-atlas
# cp ../.yo-rc.json .
# ./node_modules/.bin/yo living-atlas --replay-dont-ask

#cd generated/la-flanders-branding
#git submodule update --init --recursive --depth=1
#cd ../..

cd generated/la-flanders-inventories

../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini -i ../la-flanders-pre-deploy/inventory.yml  --limit vm-3 ../la-flanders-pre-deploy/pre-deploy.yml

# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/branding.yml --limit la-flanders.org

# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/collectory-by-type.yml --limit vm-1
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/biocache-hub-by-type.yml --limit vm-1
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/biocache-service-by-type.yml --limit vm-1
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/bie-hub-by-type.yml --limit vm-1
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/bie-index-by-type.yml --limit vm-1
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/image-service-by-type.yml --limit vm-1
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/species-list-by-type.yml --limit vm-1
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/regions-by-type.yml --limit vm-1
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/logger-service-by-type.yml --limit vm-1
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/solr7-standalone.yml --limit vm-2
#../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/auth-by-type.yml --limit vm-1
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/biocache-db.yml --limit vm-3
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/biocache-cli.yml --limit vm-3
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/nameindexer-standalone.yml --limit vm-3
 ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/spatial-by-type.yml --limit vm-3 -e postgis_scripts_version=3.2 -e spatial_hub_oidc_client_id=spatial_hub -e spatial_hub_oidc_secret=spatial-hub-oidc-super-secret
# ../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/branding.yml --limit vm-3
