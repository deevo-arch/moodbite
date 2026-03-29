#!/bin/bash

# MoodBite Zero-Config Setup Script (Unix)

echo "🍷 MoodBite: Initiating Atmospheric Setup..."

# 1. Dependency Checks
check_dep() {
  if command -v $1 &> /dev/null; then
    echo "✅ $1 is already installed."
    return 0
  else
    echo "❌ $1 is missing."
    return 1
  fi
}

check_dep git || { echo "🚀 Installing Git..."; sudo apt-get update && sudo apt-get install -y git || brew install git; }
check_dep node || { echo "🚀 Installing Node.js..."; curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs || brew install node; }
check_dep yarn || { echo "🚀 Installing Yarn..."; npm install -g yarn; }

# 2. Repo Sync
if [ ! -d ".git" ]; then
  echo "📡 Cloning MoodBite repository..."
  git clone https://github.com/deevo-arch/moodbite.git .
else
  echo "🔄 Updating repository..."
  git pull origin main
fi

# 3. NPM
echo "📦 Installing dependencies..."
npm install

# 4. Vault
if [ -f "secrets.vault" ]; then
  echo -e "\n🔒 The environment is locked."
  read -sp "Please enter the Master Password to unlock the vault: " password
  echo -e "\n🔓 Unlocking environment..."
  node scripts/vault.js decrypt $password
else
  echo -e "\n⚠️ Warning: secrets.vault not found."
fi

echo -e "\n🌟 Setup Complete!"
read -p "Press Enter to exit..."
