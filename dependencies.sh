#!/usr/bin/env bash

EMERALD_CLI_VER=0.15.0

set -e

# Get cargo.
if command -v cargo 2>/dev/null; then
    # Have cargo already.
    echo "Cargo already installed."
else
    # No cargo yet.
    echo "Rusting up (non-interactively; accepting defaults)..."
    curl https://sh.rustup.rs -sSf | sh -s -- -y

    # Ensure cargo bin is added to PATH, but only if it's not already there.
    # So developers don't have to worry about a PATH that's miles long
    # with repetitious cargo pathos.
    KARGO_PATH=~/.cargo/bin
    export PATH="${PATH:+"$PATH:"}$KARGO_PATH"
    echo "Added cargo to path..."
    echo "PATH -> $PATH"
fi

# Install and move emerald.
echo "Installing emerald with cargo..."
echo "$ cargo install --vers $EMERALD_CLI_VER emerald-cli"
export RUSTFLAGS="-C target-feature=+crt-static"
cargo install --vers $EMERALD_CLI_VER emerald-cli -f

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
