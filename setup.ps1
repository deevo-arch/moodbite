# MoodBite Zero-Config Setup Script (Windows)

Write-Host "MoodBite: Initiating Atmospheric Setup..." -ForegroundColor Cyan

function Check-Dependency ($name, $command) {
    try {
        $path = Get-Command $command -ErrorAction SilentlyContinue
        if ($path) {
            Write-Host "[OK] $name is already installed." -ForegroundColor Green
            return $true
        }
    } catch { }
    Write-Host "[!!] $name is missing." -ForegroundColor Yellow
    return $false
}

function Install-Winget ($id, $name) {
    Write-Host "Installing $name via Winget..." -ForegroundColor Cyan
    winget install -e --id $id --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] $name installed successfully." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Failed to install $name. Please install it manually." -ForegroundColor Red
        exit 1
    }
}

# 1. Check/Install Dependencies
$hasGit = Check-Dependency "Git" "git"
$hasNode = Check-Dependency "Node.js" "node"
$hasYarn = Check-Dependency "Yarn" "yarn"

if (-not $hasGit) { Install-Winget "Git.Git" "Git" }
if (-not $hasNode) { Install-Winget "OpenJS.NodeJS" "Node.js" }
if (-not $hasYarn) { Install-Winget "Yarn.Yarn" "Yarn" }

# 2. Clone/Update Repository
if (-not (Test-Path ".git")) {
    Write-Host "Cloning MoodBite repository..." -ForegroundColor Cyan
    git clone https://github.com/deevo-arch/moodbite.git .
} else {
    Write-Host "Updating repository..." -ForegroundColor Cyan
    git pull origin main
}

# 3. Install NPM Packages
Write-Host "Installing dependencies... this may take a moment." -ForegroundColor Cyan
npm install

# 4. Decrypt Vault
if (Test-Path "secrets.vault") {
    Write-Host ""
    Write-Host "--- LOCKBOX DETECTED ---" -ForegroundColor Magenta
    $password = Read-Host "Please enter the Master Password to unlock the environment"
    
    Write-Host "Unlocking environment..." -ForegroundColor Cyan
    node scripts/vault.js decrypt $password
} else {
    Write-Host "Warning: secrets.vault not found. Manual configuration required." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Setup Complete! Run 'npm run dev' to start the application." -ForegroundColor Green
Write-Host ""
