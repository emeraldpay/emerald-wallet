#!/usr/bin/env bash

VERSION_BASE=$(janus version -format='v%M.%m.x')
echo "Deploy to http://builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/"

janus deploy -to="builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/" -files="./dist/*.zip" -key="./gcloud-travis.json.enc"
janus deploy -to="builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/" -files="./dist/*.dmg" -key="./gcloud-travis.json.enc"
janus deploy -to="builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/" -files="./dist/*.tar.gz" -key="./gcloud-travis.json.enc"
janus deploy -to="builds.etcdevteam.com/emerald-wallet/$VERSION_BASE/" -files="./dist/*.deb" -key="./gcloud-travis.json.enc"

echo "Deployed"