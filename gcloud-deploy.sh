#!/usr/bin/env bash

VERSION_BASE="v$(./gitversion /showvariable Major).$(./gitversion /showvariable Minor).x"
echo "Deploy to http://builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/"

mkdir deploy
mv ./packages/desktop/dist/*.dmg ./packages/desktop/dist/*.tar.gz ./packages/desktop/dist/*.deb ./packages/desktop/dist/*.zip ./packages/desktop/dist/*.AppImage ./deploy/

janus deploy -to="builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/" -files="./deploy/*" -key="./gcloud-travis.json.enc"

echo "Deployed"