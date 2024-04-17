#!/usr/bin/env bash
set -x -e

vagrant up

export AI=$HOME/Projects/Inbo/ala-install

python -m venv .venv
. .venv/bin/activate
pip install ansible==2.10.3 six

# mkdir generated
# cd generated
# npm install yo generator-living-atlas
# cp ../.yo-rc.json .
# ./node_modules/.bin/yo living-atlas

cd generated/la-flanders-inventories

../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini -i ../la-flanders-pre-deploy/inventory.yml ../la-flanders-pre-deploy/pre-deploy.yml --limit vm-1

../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/collectory-by-type.yml --limit vm-1 ${@}
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/biocache-hub-by-type.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/biocache-service-by-type.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/bie-hub-by-type.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/bie-index-by-type.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/image-service-by-type.yml --limit vm-1 -e postgis_scripts_version=3.2
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/species-list-by-type.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/regions-by-type.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/logger-service-by-type.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/solr7-standalone.yml --limit vm-2
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/solrcloud-by-type.yml --limit vm-2
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/auth-by-type.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/biocache-db.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/biocache-cli.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/nameindexer-standalone.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/pipelines.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/spatial-by-type.yml --limit vm-1
../../.venv/bin/ansible-playbook -u vagrant -e ansible_user=vagrant -i la-flanders-inventory.ini -i la-flanders-local-extras.ini -i la-flanders-local-passwords.ini $AI/ansible/branding.yml --limit vm-1
