#!/usr/bin/env bash

set -e

VERSION_BASE=$(janus version -format='v%M.%m.x')
echo "Deploy to http://builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/"

mkdir deploy

mv dist/*.dmg dist/*.zip deploy/

janus deploy -to="builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/" -files="deploy/*" -key=".circleci/gcloud-circleci.json.enc"

echo "Deployed"