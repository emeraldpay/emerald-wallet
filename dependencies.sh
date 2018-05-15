#!/usr/bin/env bash

EMERALD_CLI_VER=0.22.0

set -e

exit_if_emerald_installed() {
    echo "Asserting correct version of emerald is installed"

    # emerald command exists in path?
    if [ -x "$(command -v emerald)" ]; then

        # emerald is the correct version?
        if [ "emerald --version" = EMERALD_CLI_VER ]; then
            echo "emerald $EMERALD_CLI_VER is already installed. Skipping."
            exit 0
        fi
    fi
}

ensure_cargo_installed() {
    if ! [ -x "$(command -v cargo)" ]; then
        echo "Rusting up (non-interactively; accepting defaults)..."
        curl https://sh.rustup.rs -sSf | sh -s -- -y
        echo "Cargo installed Successfully."
    fi
}

install_emerald() {
    echo "Installing emerald with cargo..."
    echo "$ cargo install --vers $EMERALD_CLI_VER emerald-cli"
    export RUSTFLAGS="-C target-feature=+crt-static"
    cargo install --vers $EMERALD_CLI_VER emerald-cli -f
    unset RUSTFLAGS

    # Get location of emerald.
    # Should be ~/.cargo/bin/emerald, hopefully.
    emerald_path=$(which emerald)
    echo "Emerald installed to [$emerald_path]"

    # We'll just put it in the project base dir for now.
    # Note that this assumes CI's $CWD is in the project root.
    echo "Copying emerald from [$emerald_path] to project directory [$(pwd)]..."
    cp "$emerald_path" ./emerald
    chmod +x emerald

    unset emerald_path
}

exit_if_emerald_installed

ensure_cargo_installed
install_emerald
