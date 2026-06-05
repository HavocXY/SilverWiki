# Setup-Skript für SilverWiki (PowerShell / Windows)
# Führe dieses Skript aus, um die gesamte Entwicklungsumgebung einzurichten und zu prüfen.

$ErrorActionPreference = "Continue"

function Write-Header {
    param([string]$text)
    Write-Host "`n===============================================" -ForegroundColor Cyan
    Write-Host "  $text" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$text)
    Write-Host "[ERFOLG] $text" -ForegroundColor Green
}

function Write-Info {
    param([string]$text)
    Write-Host "[INFO] $text" -ForegroundColor Gray
}

function Write-Warning {
    param([string]$text)
    Write-Host "[WARNUNG] $text" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$text)
    Write-Host "[FEHLER] $text" -ForegroundColor Red
}

# ---------------------------------------------------------------------------
Write-Header "Schritt 1: Voraussetzungen prüfen"

# 1. Git-Installation prüfen
Write-Info "Prüfe Git-Installation..."
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if ($null -eq $gitPath) {
    Write-ErrorMsg "Git ist nicht installiert oder befindet sich nicht im PATH. Bitte installiere Git."
    exit 1
}
Write-Success "Git gefunden: $($gitPath.Source)"

# 2. Docker-Installation prüfen
Write-Info "Prüfe Docker-Installation..."
$dockerPath = Get-Command docker -ErrorAction SilentlyContinue
if ($null -eq $dockerPath) {
    Write-ErrorMsg "Docker ist nicht installiert oder befindet sich nicht im PATH. Bitte installiere Docker."
    exit 1
}
Write-Success "Docker gefunden: $($dockerPath.Source)"

# 3. Docker-Daemon prüfen
Write-Info "Prüfe, ob der Docker-Daemon läuft..."
& cmd.exe /c "docker info >nul 2>&1"
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Der Docker-Daemon läuft nicht. Bitte starte Docker Desktop."
    exit 1
}
Write-Success "Docker-Daemon ist aktiv."

# ---------------------------------------------------------------------------
Write-Header "Schritt 2: BookStack-Repository vorbereiten"
$bookstackDir = Join-Path $PSScriptRoot "bookstack"

if (-not (Test-Path $bookstackDir)) {
    Write-Info "Verzeichnis 'bookstack/' wurde nicht gefunden. Klone das offizielle BookStack-Repository..."
    & git clone https://github.com/BookStackApp/BookStack.git $bookstackDir
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Fehler beim Klonen von BookStack."
        exit 1
    }
    
    Push-Location $bookstackDir
    Write-Info "Checke den stabilen 'release'-Branch aus..."
    & git checkout release
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "Fehler beim Auschecken des 'release'-Branches."
        Pop-Location
        exit 1
    }
    Pop-Location
    Write-Success "BookStack erfolgreich nach 'bookstack/' geklont und auf 'release'-Branch eingestellt."
} else {
    Write-Success "Verzeichnis 'bookstack/' existiert bereits."
    if (Test-Path (Join-Path $bookstackDir ".git")) {
        Push-Location $bookstackDir
        $branch = & git branch --show-current
        Write-Info "Aktueller BookStack-Branch: $branch"
        Pop-Location
    }
}

# ---------------------------------------------------------------------------
Write-Header "Schritt 3: Windows Git-Attribute für Zeilenenden setzen"
$gitInfoDir = Join-Path $bookstackDir ".git\info"
if (-not (Test-Path $gitInfoDir)) {
    New-Item -ItemType Directory -Path $gitInfoDir -Force | Out-Null
}
$attributesPath = Join-Path $gitInfoDir "attributes"
$attrContent = "*.sh text eol=lf"

if (Test-Path $attributesPath) {
    $currentContent = Get-Content $attributesPath -Raw
    if ($currentContent -notmatch "\*\.sh\s+text\s+eol=lf") {
        Add-Content -Path $attributesPath -Value "`n$attrContent"
        Write-Success "Zeilenendungs-Attribute zu $attributesPath hinzugefügt."
    } else {
        Write-Success "LF-Zeilenendungs-Attribute für Windows bereits konfiguriert."
    }
} else {
    Set-Content -Path $attributesPath -Value $attrContent
    Write-Success "$attributesPath wurde erfolgreich mit LF-Erzwingung erstellt."
}

# ---------------------------------------------------------------------------
Write-Header "Schritt 4: Konfigurationsdatei (.env) einrichten"
$envPath = Join-Path $bookstackDir ".env"
if (-not (Test-Path $envPath)) {
    Write-Info "bookstack/.env nicht gefunden. Erstelle Standardkonfiguration für SilverWiki..."
    $envContent = @"
# BookStack Environment Configuration for SilverWiki Local Dev

# Application key (valid 32-character key generated for development)
APP_KEY=base64:c2lsdmVyd2lraWRldmtleTEyMzQ1Njc4OTAxMjM0NTY=

# Application URL
APP_URL=http://localhost:8080

# Database details matching docker-compose
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=bookstack-dev
DB_USERNAME=bookstack-test
DB_PASSWORD=bookstack-test

# Theme
APP_THEME=silverwiki

# Storage system to use
STORAGE_TYPE=local

# Mail configuration
MAIL_DRIVER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_FROM_NAME="SilverWiki Mailer"
MAIL_FROM=silverwiki@local.dev

# Language settings
APP_LANG=de
APP_AUTO_LANG_PUBLIC=false
"@
    Set-Content -Path $envPath -Value $envContent
    Write-Success "Standard-'.env' erfolgreich in 'bookstack/.env' angelegt."
} else {
    Write-Success "'bookstack/.env' existiert bereits."
    $envFileContent = Get-FileHash -Path $envPath -Algorithm SHA1 | Out-Null # Nur um sicherzustellen, dass wir lesen
    $envFileContent = Get-Content $envPath -Raw
    if ($envFileContent -notmatch "APP_THEME=silverwiki") {
        Write-Warning "Achtung: 'APP_THEME=silverwiki' ist nicht in der .env gesetzt. Das SilverWiki-Theme ist möglicherweise inaktiv."
    } else {
        Write-Success "Konfiguration 'APP_THEME=silverwiki' ist aktiv."
    }
}

# ---------------------------------------------------------------------------
Write-Header "Schritt 5: Docker Container starten"
Write-Info "Führe 'docker compose up -d' aus..."
& docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-ErrorMsg "Fehler beim Ausführen von 'docker compose up -d'."
    exit 1
}
Write-Success "Docker-Container wurden erfolgreich gestartet."

# ---------------------------------------------------------------------------
Write-Header "Schritt 6: Erreichbarkeit der Dienste prüfen"
$webUrl = "http://localhost:8080"
$mailUrl = "http://localhost:8025"

Write-Info "Warte auf die Initialisierung von BookStack (dies kann beim ersten Start bis zu 60 Sekunden dauern)..."

$maxAttempts = 30
$attempt = 1
$webSuccess = $false

# Deaktiviere standardmäßige Fortschrittsanzeige für schnellere Requests
$ProgressPreference = 'SilentlyContinue'

while ($attempt -le $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "$webUrl/login" -UseBasicParsing -TimeoutSec 2
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
            $webSuccess = $true
            break
        }
    } catch {
        # Server fährt noch hoch, fange Verbindungsfehler ab
    }
    
    Write-Info "Versuch $attempt/$($maxAttempts): SilverWiki noch nicht bereit. Warte 2 Sekunden..."
    Start-Sleep -Seconds 2
    $attempt++
}

if ($webSuccess) {
    Write-Success "SilverWiki ist erfolgreich erreichbar unter: $webUrl"
} else {
    Write-Warning "SilverWiki war nach 60 Sekunden noch nicht erreichbar. Bitte prüfe die Logs mit: docker compose logs app"
}

Write-Info "Prüfe Erreichbarkeit von Mailhog (E-Mail-Überwachung)..."
$mailSuccess = $false
try {
    $responseMail = Invoke-WebRequest -Uri $mailUrl -UseBasicParsing -TimeoutSec 2
    if ($responseMail.StatusCode -eq 200) {
        $mailSuccess = $true
    }
} catch {}

if ($mailSuccess) {
    Write-Success "Mailhog ist erreichbar unter: $mailUrl"
} else {
    Write-Warning "Mailhog war unter $mailUrl nicht erreichbar."
}

# ---------------------------------------------------------------------------
Write-Header "Setup-Vorgang abgeschlossen!"
if ($webSuccess) {
    Write-Host "`nDu kannst dich jetzt mit folgenden Daten anmelden:" -ForegroundColor Green
    Write-Host "URL:          $webUrl" -ForegroundColor Cyan
    Write-Host "Admin-E-Mail: admin@admin.com" -ForegroundColor Cyan
    Write-Host "Passwort:     password`n" -ForegroundColor Cyan
    
    Write-Info "Öffne SilverWiki im Standardbrowser..."
    Start-Process "$webUrl"
} else {
    Write-Host "`nDas Setup wurde ausgeführt, aber die Webanwendung konnte nicht verifiziert werden." -ForegroundColor Yellow
    Write-Host "Bitte überprüfe den Status mit 'docker compose ps' oder die Logs mit 'docker compose logs -f app'.`n" -ForegroundColor Yellow
}
