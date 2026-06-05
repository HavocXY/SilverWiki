#!/bin/bash
# Setup-Skript für SilverWiki (Bash / Linux / macOS / WSL)
# Führe dieses Skript aus, um die gesamte Entwicklungsumgebung einzurichten und zu prüfen.

set -e

# Farben für die Ausgabe
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

write_header() {
    echo -e "\n${CYAN}===============================================${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}===============================================${NC}"
}

write_success() {
    echo -e "${GREEN}[ERFOLG] $1${NC}"
}

write_info() {
    echo -e "[INFO] $1"
}

write_warning() {
    echo -e "${YELLOW}[WARNUNG] $1${NC}"
}

write_error() {
    echo -e "${RED}[FEHLER] $1${NC}"
}

# ---------------------------------------------------------------------------
write_header "Schritt 1: Voraussetzungen prüfen"

# 1. Git-Installation prüfen
if ! command -v git &> /dev/null; then
    write_error "Git ist nicht installiert oder befindet sich nicht im PATH. Bitte installiere Git."
    exit 1
fi
write_success "Git gefunden."

# 2. Docker-Installation prüfen
if ! command -v docker &> /dev/null; then
    write_error "Docker ist nicht installiert oder befindet sich nicht im PATH. Bitte installiere Docker."
    exit 1
fi
write_success "Docker gefunden."

# 3. Docker-Daemon prüfen
if ! docker info &> /dev/null; then
    write_error "Der Docker-Daemon läuft nicht. Bitte starte Docker Desktop bzw. den Docker-Dienst."
    exit 1
fi
write_success "Docker-Daemon ist aktiv."

# ---------------------------------------------------------------------------
write_header "Schritt 2: BookStack-Repository vorbereiten"
bookstack_dir="bookstack"

if [ ! -d "$bookstack_dir" ]; then
    write_info "Verzeichnis 'bookstack/' wurde nicht gefunden. Klone das offizielle BookStack-Repository..."
    git clone https://github.com/BookStackApp/BookStack.git "$bookstack_dir"
    
    cd "$bookstack_dir"
    write_info "Checke den stabilen 'release'-Branch aus..."
    git checkout release
    cd ..
    write_success "BookStack erfolgreich nach 'bookstack/' geklont und auf 'release'-Branch eingestellt."
else
    write_success "Verzeichnis 'bookstack/' existiert bereits."
    if [ -d "$bookstack_dir/.git" ]; then
        cd "$bookstack_dir"
        branch=$(git branch --show-current)
        write_info "Aktueller BookStack-Branch: $branch"
        cd ..
    fi
fi

# ---------------------------------------------------------------------------
write_header "Schritt 3: Windows Git-Attribute für Zeilenenden setzen"
mkdir -p "$bookstack_dir/.git/info"
attributes_path="$bookstack_dir/.git/info/attributes"
attr_content="*.sh text eol=lf"

if [ -f "$attributes_path" ]; then
    if ! grep -q "*.sh text eol=lf" "$attributes_path"; then
        echo -e "\n$attr_content" >> "$attributes_path"
        write_success "Zeilenendungs-Attribute zu $attributes_path hinzugefügt."
    else
        write_success "LF-Zeilenendungs-Attribute bereits konfiguriert."
    fi
else
    echo "$attr_content" > "$attributes_path"
    write_success "$attributes_path wurde erfolgreich mit LF-Erzwingung erstellt."
fi

# ---------------------------------------------------------------------------
write_header "Schritt 4: Konfigurationsdatei (.env) einrichten"
env_path="$bookstack_dir/.env"
if [ ! -f "$env_path" ]; then
    write_info "bookstack/.env nicht gefunden. Erstelle Standardkonfiguration für SilverWiki..."
    cat <<EOT > "$env_path"
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
EOT
    write_success "Standard-'.env' erfolgreich in 'bookstack/.env' angelegt."
else
    write_success "'bookstack/.env' existiert bereits."
    if ! grep -q "APP_THEME=silverwiki" "$env_path"; then
        write_warning "Achtung: 'APP_THEME=silverwiki' ist nicht in der .env gesetzt. Das SilverWiki-Theme ist möglicherweise inaktiv."
    else
        write_success "Konfiguration 'APP_THEME=silverwiki' ist aktiv."
    fi
fi

# ---------------------------------------------------------------------------
write_header "Schritt 5: Docker Container starten"
write_info "Führe 'docker compose up -d' aus..."
docker compose up -d
write_success "Docker-Container wurden erfolgreich gestartet."

# ---------------------------------------------------------------------------
write_header "Schritt 6: Erreichbarkeit der Dienste prüfen"
web_url="http://localhost:8080"
mail_url="http://localhost:8025"

write_info "Warte auf die Initialisierung von BookStack (dies kann beim ersten Start bis zu 60 Sekunden dauern)..."

web_success=false
for i in {1..30}; do
    # curl check: connect-timeout 2, silent, check http status
    status_code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "$web_url/login" || true)
    if [ "$status_code" = "200" ] || [ "$status_code" = "302" ]; then
        web_success=true
        break
    fi
    write_info "Versuch $i/30: SilverWiki noch nicht bereit. Warte 2 Sekunden..."
    sleep 2
done

if [ "$web_success" = true ]; then
    write_success "SilverWiki ist erfolgreich erreichbar unter: $web_url"
else
    write_warning "SilverWiki war nach 60 Sekunden noch nicht erreichbar. Bitte prüfe die Logs mit: docker compose logs app"
fi

write_info "Prüfe Erreichbarkeit von Mailhog (E-Mail-Überwachung)..."
mail_success=false
status_code_mail=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 2 "$mail_url" || true)
if [ "$status_code_mail" = "200" ]; then
    mail_success=true
    write_success "Mailhog ist erreichbar unter: $mail_url"
else
    write_warning "Mailhog war unter $mail_url nicht erreichbar."
fi

# ---------------------------------------------------------------------------
write_header "Setup-Vorgang abgeschlossen!"
if [ "$web_success" = true ]; then
    echo -e "\n${GREEN}Du kannst dich jetzt mit folgenden Daten anmelden:${NC}"
    echo -e "${CYAN}URL:          ${web_url}${NC}"
    echo -e "${CYAN}Admin-E-Mail: admin@admin.com${NC}"
    echo -e "${CYAN}Passwort:     password${NC}\n"
    
    write_info "Öffne SilverWiki im Standardbrowser..."
    if command -v xdg-open &> /dev/null; then
        xdg-open "$web_url"
    elif command -v open &> /dev/null; then
        open "$web_url"
    elif command -v explorer.exe &> /dev/null; then
        explorer.exe "$web_url"
    fi
else
    echo -e "\n${YELLOW}Das Setup wurde ausgeführt, aber die Webanwendung konnte nicht verifiziert werden.${NC}"
    echo -e "${YELLOW}Bitte überprüfe den Status mit 'docker compose ps' oder die Logs mit 'docker compose logs -f app'.${NC}\n"
fi
