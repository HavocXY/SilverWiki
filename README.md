# SilverWiki — Modernes Google Gemini „Neural Expressive“ Overlay für BookStack

SilverWiki ist ein hochmodernes, firmeninternes Wiki für den Eigengebrauch. Es basiert auf der stabilen Open-Source-Software **BookStack**, verpasst dieser jedoch ein komplett neues, premium-gestaltetes Design-Overlay basierend auf der **Google Gemini „Neural Expressive“**-Designsprache (hoher Kontrast, flüssige Cyan-Indigo-Lila Verläufe, minimalistische Typografie mit Outfit/Inter, Glassmorphismus, einstellbare Layoutdichte).

Die Integration ist **update-sicher** aufgebaut: Das originale BookStack bleibt als Git-Repository unberührt, während unser Theme getrennt gelagert und per Docker-Volume hineingemountet wird.

---

## 📸 Screenshots & Vorschau

Hier siehst du das moderne, Google Gemini "Neural Expressive"-Design in Aktion:

### Haupt-Dashboard (Wiki-Home)
![Haupt-Dashboard](dashboard_preview.png)

### Anpassungs- und Darstellungs-Einstellungen
![Customization Settings](settings_preview.png)

---

## 1. 🚀 Schnellstart & Installation

Dieses Projekt enthält vollautomatische Setup-Skripte, die alle notwendigen Konfigurations- und Startschritte in einem einzigen Durchlauf für dich erledigen, Fehler prüfen, die Container starten und die Anwendung direkt im Browser öffnen.

### A. Voraussetzungen (Download-Links)
Stelle vor dem Start sicher, dass folgende Software auf deinem System installiert und aktiv ist:
1. **Docker Desktop:** [Docker Desktop herunterladen](https://www.docker.com/products/docker-desktop/) (Erforderlich, um die Container-Umgebung auszuführen).
2. **Git:** [Git herunterladen](https://git-scm.com/downloads) (Erforderlich für das Klonen und Updaten der Repositories).

> [!IMPORTANT]
> **Docker-Daemon starten:** Stelle sicher, dass Docker Desktop gestartet ist, bevor du das Installationsskript ausführst.
>
> **Auto-Start konfiguriert:** Die Container sind im `docker-compose.yml` mit `restart: unless-stopped` konfiguriert. Sie starten automatisch mit dem Docker-Dienst oder bei Systemneustarts, sofern sie nicht manuell gestoppt wurden.

---

### B. Installation mit einem Klick (Ein-Klick-Setup)

Führe einfach das entsprechende Skript für dein Betriebssystem im Projekt-Wurzelverzeichnis aus:

#### 💻 Unter Windows (PowerShell):
Öffne eine PowerShell-Konsole im Projektverzeichnis und führe aus:
```powershell
powershell -ExecutionPolicy Bypass -File .\setup.ps1
```

#### 🐧 Unter Linux / macOS / WSL (Bash):
Öffne ein Terminal im Projektverzeichnis und führe aus:
```bash
chmod +x setup.sh
./setup.sh
```

**Was das Skript vollautomatisch für dich tut:**
* Prüft die Voraussetzungen (Git, Docker und laufender Daemon).
* Kloniert das originale BookStack in das Unterverzeichnis `/bookstack` (auf dem stabilen `release`-Branch).
* Richtet die Windows-kompatiblen Zeilenenden (LF) ein, um Startprobleme in Docker zu verhindern.
* Erstellt die Konfigurationsdatei `.env` mit vorkonfigurierten Datenbank- und E-Mail-Einstellungen.
* Startet die Docker-Container (mit konfigurierter Auto-Start-Policy).
* Überprüft die Erreichbarkeit und öffnet SilverWiki **automatisch in deinem Standardbrowser**.

---

## 2. 🔐 Admin-Erstanmeldung

Nach erfolgreichem Durchlauf des Skripts öffnet sich die Anwendung in deinem Browser. Du kannst dich mit folgenden Standarddaten anmelden:

* **URL:** [http://localhost:8080/login](http://localhost:8080/login)
* **E-Mail-Adresse:** `admin@admin.com`
* **Passwort:** `password`

> [!WARNING]
> **Sicherheitshinweis für den Betrieb:**
> Ändere diese Standard-Zugangsdaten unverzüglich nach der ersten Anmeldung im Administrationsbereich unter **Nutzerprofil** -> **Profil bearbeiten**. Generiere außerdem für den Produktivbetrieb einen sicheren Application-Key via `php artisan key:generate`.

---

## 3. 🛠️ Manuelle Installation (Schritt-für-Schritt)

Falls du die Einrichtung lieber manuell vornehmen möchtest, führe folgende Schritte nacheinander aus:

#### Schritt A: Repository klonen
```bash
git clone https://github.com/HavocXY/SilverWiki.git
cd SilverWiki
```

#### Schritt B: BookStack klonen & Branch wählen
Klone BookStack in das Unterverzeichnis `bookstack/` und checke den stabilen `release`-Branch aus:
```bash
git clone https://github.com/BookStackApp/BookStack.git bookstack
cd bookstack
git checkout release
cd ..
```

#### Schritt C: Windows Git-Attribute setzen (Wichtig auf Windows)
Erstelle die Datei `bookstack/.git/info/attributes` und füge folgende Zeile hinzu, um Shell-Skript-Startfehler in Docker zu verhindern:
```text
*.sh text eol=lf
```

#### Schritt D: Konfiguration (`.env`) erstellen
Erstelle eine `.env`-Datei im Ordner `bookstack/` mit folgenden Einstellungen:
```env
APP_KEY=base64:c2lsdmVyd2lraWRldmtleTEyMzQ1Njc4OTAxMjM0NTY=
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=bookstack-dev
DB_USERNAME=bookstack-test
DB_PASSWORD=bookstack-test
APP_THEME=silverwiki
APP_URL=http://localhost:8080
MAIL_DRIVER=smtp
MAIL_HOST=mailhog
MAIL_PORT=1025
MAIL_FROM_NAME="SilverWiki Mailer"
MAIL_FROM=silverwiki@local.dev
APP_LANG=de
```

#### Schritt E: Container starten
```bash
docker compose up -d
```
Die Anwendung ist nun unter [http://localhost:8080](http://localhost:8080) und die E-Mail-Überwachung (Mailhog) unter [http://localhost:8025](http://localhost:8025) erreichbar.

---

## 4. ⚙️ Betrieb & Docker-Befehle

* **Container stoppen:**
  ```bash
  docker compose down
  ```
* **Container starten:**
  ```bash
  docker compose up -d
  ```
* **Container neu bauen:**
  ```bash
  docker compose up -d --build
  ```
* **Live-Logs einsehen:**
  ```bash
  docker compose logs -f app
  ```
* **Datenbank sichern (Backup):**
  ```bash
  docker compose exec db mysqldump -u bookstack-test -pbookstack-test bookstack-dev > backup.sql
  ```
* **Datenbank wiederherstellen:**
  ```bash
  docker compose exec -T db mysql -u bookstack-test -pbookstack-test bookstack-dev < backup.sql
  ```

---

## 🐳 Konfliktvermeidung & Container-Isolierung

Um sicherzustellen, dass SilverWiki reibungslos läuft und nicht mit anderen Docker-Containern oder Systempfaden kollidiert, greifen folgende Mechanismen:

### 1. Port-Konflikte lösen (Flexible Ports)
Falls Port `8080` (Webanwendung) oder `8025` (Mailhog) bereits von einem anderen Dienst auf deinem Rechner belegt sind, blockiert Docker den Start.
* **Die Lösung:** Erstelle im **Projekt-Wurzelverzeichnis** (`SilverWiki/`, nicht im Unterordner `bookstack/`) eine Datei namens `.env` und definiere freie Wunsch-Ports:
  ```env
  DEV_PORT=9090
  DEV_MAIL_PORT=9025
  ```
  Docker-Compose liest diese Werte automatisch aus. Die Anwendung startet dann unter `http://localhost:9090` und BookStack passt seine internen Redirects vollautomatisch an diese neue URL an.

### 2. Netzwerk-Isolierung (Keine Datenbank-Konflikte)
* **Die Funktionsweise:** Docker Compose erstellt beim Start ein isoliertes virtuelles Netzwerk (z. B. `silverwiki_default`). 
* Alle Container innerhalb dieses Projekts (`app`, `db`, `mailhog`) kommunizieren verschlüsselt über dieses interne Netzwerk und sprechen sich über ihre Service-Namen (z. B. `db` als Hostname) an.
* **Vorteil:** Selbst wenn auf deinem Host-Rechner bereits ein anderer MySQL-Server oder ein anderes Docker-Projekt läuft, kommen sich die Datenbanken nicht in die Quere. Der SilverWiki-App-Container greift garantiert immer auf die zugehörige SilverWiki-Datenbank zu.

### 3. Absolute Portabilität (Relative Pfade)
* **Die Funktionsweise:** In der Datei `docker-compose.yml` sind alle Volume-Mounts mit relativen Pfaden (z. B. `./theme` und `./bookstack`) definiert.
* **Vorteil:** Das bedeutet, dass der physische Pfad auf deiner Festplatte vollkommen egal ist. Du kannst den Ordner `SilverWiki/` beliebig verschieben, umbenennen oder kopieren – Docker Compose löst die Pfade immer relativ zum Standort der `docker-compose.yml` auf, sodass die Verknüpfungen stets auf die korrekten Ordner verweisen.

---

## 5. 📋 Features

* **Gemini „Neural Expressive“ UI/UX:** Minimalistisches, hochauflösendes Interface mit der Schriftart **Outfit** (Überschriften) und **Inter** (Body), flüssigen Brand-Gradients und optimalem Kontrast für beste Lesbarkeit in den Seitenbereichen.
* **Zerstörungsfreie Architektur:** BookStack kann jederzeit via `git pull` aktualisiert werden, ohne dass unser Custom-Theme überschrieben wird oder Merge-Konflikte auftreten.
* **Integriertes Tweaks-Panel:** Nutzer können Layout-Dichte (Normal vs. Kompakt), Layout-Typ (Karten vs. Liste) und Hintergrund-Stile (Gradient + Grid vs. Flat) direkt im UI einstellen. Die Einstellungen werden im LocalStorage persistiert.
* **Regale als Kategorien:** BookStacks Regale (Shelves) werden nahtlos als Hauptkategorien in der linken Sidebar dargestellt.

---

## 📂 Verzeichnisstruktur

- `/bookstack` — Das originale BookStack-Subverzeichnis (Git-Klon).
- `/theme` — Unser Custom Theme (Blade-Templates, CSS, JS).
- `/docker-compose.yml` — Die zentrale Docker-Konfiguration im Wurzelverzeichnis.

---

## 🔄 BookStack aktualisieren (Schritt-für-Schritt-Anleitung)

Da unser Custom Theme vollständig vom `bookstack/`-Verzeichnis isoliert ist, kannst du BookStack jederzeit gefahrlos auf den neuesten Stand bringen, ohne dass es zu Merge-Konflikten kommt.

### Schnellbefehle (Copy & Paste)
```bash
# 1. Datenbank-Backup erstellen
docker compose exec db mysqldump -u bookstack-test -pbookstack-test bookstack-dev > backup.sql

# 2. In den BookStack-Ordner wechseln, neuesten Code ziehen und zurückkehren
cd bookstack
git fetch && git pull
cd ..

# 3. Container neu starten (führt composer install & DB-Migrationen aus)
docker compose down
docker compose up -d

# 4. Logs kontrollieren
docker compose logs -f app
```

---

## 💻 Entwickler-Informationen
Für detaillierte Informationen zur Architektur, den Design-Entscheidungen und Richtlinien für KI-Agenten, siehe [gemini.md](file:///d:/Antigravity/SilverWiki/gemini.md).
