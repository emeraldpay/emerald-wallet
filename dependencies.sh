#!/usr/bin/env bash

# Get cargo.
echo "Rusting up (non-interactively; accepting defaults)..."
curl https://sh.rustup.rs -sSf | sh -s -- -y

# Ensure cargo bin is added to PATH.
export PATH=$PATH:~/.cargo/bin
echo "Added cargo to path..."
echo "PATH -> $PATH"

# Install emerald.
echo "Installing emerald with cargo..."
echo "$ cargo install emerald-cli"
cargo install emerald-cli -f

# Get location of emerald.
# Should be ~/.cargo/bin/emerald, hopefully.
emerald_path=$(which emerald)
echo "Emerald installed to [$emerald_path]"

# We'll just put it in the project base dir for now.
# Note that this assumes CI's $CWD is in the project root.
echo "Moving emerald from [$emerald_path] to project directory [$(pwd)]..."
mv "$emerald_path" ./emerald

unset emerald_path
