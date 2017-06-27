#!/usr/bin/env bash

# Get cargo.
curl https://sh.rustup.rs -sSf | sh

# Ensure cargo bin is added to PATH.
export PATH=$PATH:~/.cargo/bin

# Install emerald.
cargo install emerald-cli

# Get location of emerald.
# Should be ~/.cargo/bin/emerald, hopefully.
local emerald_path=$(which emerald)

# We'll just put it in the project base dir for now.
# Note that this assumes CI's $CWD is in the project root.
mv "$emerald_path" ./emerald
