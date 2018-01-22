#!/usr/bin/env bash

echo "Removing previous Janus"
rm -rf $PWD/janusbin

echo "Installing Janus"
curl -sL https://raw.githubusercontent.com/ethereumproject/janus/master/get.sh | bash

export APP_VERSION_GIT_TAG="$($PWD/janusbin/janus version -format 'TAG_OR_NIGHTLY')"