#!/usr/bin/env bash

CURRENT_GETH=$PWD/bin/geth

set -e

exit_if_geth_installed() {
    echo "Asserting correct version of geth is installed"

    echo "CHECK geth command exists in path $CURRENT_GETH"
    if [[ -x $(command -v $CURRENT_GETH) ]]; then
      echo "PASS"
      exit 0
    else
      echo "FAIL"
    fi
}


install_geth() {
    echo "Installing geth..."

    wget -O $PWD/bin/geth https://github.com/Smilo-platform/go-smilo/releases/download/v1.8.23.2/geth-linux-amd64

    geth_path=$PWD/bin/geth
    # We'll just put it in the project base dir for now.
    # Note that this assumes CI's $CWD is in the project root.
    echo "Installing geth into [$geth_path] project directory [$(pwd)]..."
    chmod +x $geth_path

    exit_if_geth_installed
}

exit_if_geth_installed

install_geth
