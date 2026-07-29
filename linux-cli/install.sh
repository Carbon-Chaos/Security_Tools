#!/usr/bin/env bash
set -euo pipefail

repo="https://raw.githubusercontent.com/your-org/cyber-security-ops/main/linux-cli/"
install_dir="${HOME}/.local/bin"
mkdir -p "$install_dir"

curl -fsSL "${repo}bin/cyber-sec.js" -o "$install_dir/cyber-sec"
chmod +x "$install_dir/cyber-sec"

echo "Installed to $install_dir/cyber-sec"
echo "Run: cyber-sec overview"
