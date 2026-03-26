# See https://aka.ms/vscode-remote/devcontainerbase for a reference
FROM mcr.microsoft.com/vscode/devcontainers/base:0-focal

# Install common development tools
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
 && apt-get -y install --no-install-recommends \
    git curl build-essential ca-certificates \
    python3 python3-pip nodejs npm \
 && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN python3 -m pip install --no-cache-dir --upgrade pip setuptools
