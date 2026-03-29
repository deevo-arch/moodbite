# MoodBite Zero-Config Setup Script (Windows)

Write-Host "🍷 MoodBite: Initiating Atmospheric Setup..." -ForegroundColor Cyan

function Check-Dependency ($name, $command) {
    $path = Get-Command $command -ErrorAction SilentlyContinue
    if ($path) {
        Write-Host "✅ $name is already installed." -ForegroundColor Green
        return $true
    }
    Write-Host "❌ $name is missing." -ForegroundColor Yellow
    return $false
}

function Install-Winget ($id, $name) {
    Write-Host "🚀 Installing $name via Winget..." -ForegroundColor Cyan
    winget install -e --id $id --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ $name installed successfully." -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install $name. Please install it manually from their official website." -ForegroundColor Red
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
    Write-Host "📡 Cloning MoodBite repository..." -ForegroundColor Cyan
    git clone https://github.com/deevo-arch/moodbite.git .
} else {
    Write-Host "🔄 Updating repository..." -ForegroundColor Cyan
    git pull origin main
}

# 3. Install NPM Packages
Write-Host "📦 Installing dependencies (this may take a minute)..." -ForegroundColor Cyan
npm install

# 4. Decrypt Vault
if (Test-Path "secrets.vault") {
    Write-Host "`n🔒 The environment is locked." -ForegroundColor Magenta
    $password = Read-Host "Please enter the Master Password to unlock the vault" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
    $PlainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
    
    Write-Host "🔓 Unlocking environment..." -ForegroundColor Cyan
    node scripts/vault.js decrypt $PlainPassword
} else {
    Write-Host "`n⚠️ Warning: secrets.vault not found. Manual configuration required." -ForegroundColor Yellow
}

Write-Host "`n🌟 Setup Complete! Run 'npm run dev' to start the MoodBite experience." -ForegroundColor Green
Read-Host "Press Enter to exit..."
