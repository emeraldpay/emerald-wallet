#!/usr/bin/env bash

mkdir deploy

for f in $(ls dist/ | grep -e "dmg" -e "zip" -e "deb" -e "tar.gz" -e "exe" -e "msi");
do
  mv dist/$f deploy/
done

node ./node_modules/gcloud-storage-upload/lib/index.js --path deploy/ --remotePath emerald-wallet/preview/
