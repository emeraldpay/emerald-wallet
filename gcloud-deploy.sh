#!/usr/bin/env bash

VERSION_BASE=$(janus version -format='v%M.%m.x')
echo "Deploy to http://builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/"

mkdir deploy
mv ./dist/*.dmg ./dist/*.tar.gz ./dist/*.deb ./dist/*.zip ./deploy/

janus deploy -to="builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/" -files="./deploy/*" -key="./gcloud-travis.json.enc"

echo "Deployed"