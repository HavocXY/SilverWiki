# SilverWiki — Modernes Google Gemini „Neural Expressive“ Overlay für BookStack

SilverWiki ist ein hochmodernes, firmeninternes Wiki für den Eigengebrauch. Es basiert auf der stabilen Open-Source-Software **BookStack**, verpasst dieser jedoch ein komplett neues, premium-gestaltetes Design-Overlay basierend auf der **Google Gemini „Neural Expressive“**-Designsprache (hoher Kontrast, flüssige Cyan-Indigo-Lila Verläufe, minimalistische Typografie mit Outfit/Inter, Glassmorphismus, einstellbare Layoutdichte).

Die Integration ist **update-sicher** aufgebaut: Das originale BookStack bleibt als Git-Repository unberührt, während unser Theme getrennt gelagert und per Docker-Volume hineingemountet wird.

---

## Features

- **Gemini „Neural Expressive“ UI/UX:** Minimalistisches, hochauflösendes Interface mit der Schriftart **Outfit** (Überschriften) und **Inter** (Body), flüssigen Brand-Gradients und optimalem Kontrast für beste Lesbarkeit in den Seitenbereichen.
- **Zerstörungsfreie Architektur:** BookStack kann jederzeit via `git pull` aktualisiert werden, ohne dass unser Custom-Theme überschrieben wird oder Merge-Konflikte auftreten.
- **Integriertes Tweaks-Panel:** Nutzer können Layout-Dichte (Normal vs. Kompakt), Layout-Typ (Karten vs. Liste) und Hintergrund-Stile (Gradient + Grid vs. Flat) direkt im UI einstellen. Die Einstellungen werden im LocalStorage persistiert.
- **Regale als Kategorien:** BookStacks Regale (Shelves) werden nahtlos als Hauptkategorien in der linken Sidebar dargestellt.

---

## Verzeichnisstruktur

- `/bookstack` — Das originale BookStack-Subverzeichnis (Git-Klon auf dem `release`-Branch).
- `/theme` — Unser Custom Theme. Enthält alle modifizierten Blade-Templates, CSS und JavaScript-Dateien für das SilverWiki-Overlay.
- `/docker-compose.yml` — Die zentrale Docker-Konfiguration im Wurzelverzeichnis zur Ausführung der Anwendung.

---

## Schnellstart (Lokale Entwicklung)

### Voraussetzungen
- [Docker & Docker Compose](https://www.docker.com/) müssen installiert und aktiv sein.

### 1. Konfiguration einrichten
Kopiere die `.env.example` in den `bookstack`-Ordner und benenne sie in `.env` um. Ergänze die Datenbank-Details und setze das Theme auf `silverwiki`:

```env
APP_KEY=base64:SilverWikiDevelopmentKeyForBookStack123=
DB_HOST=db
DB_DATABASE=bookstack-dev
DB_USERNAME=bookstack-test
DB_PASSWORD=bookstack-test
APP_THEME=silverwiki
APP_URL=http://localhost:8080
```

### 2. Container starten
Führe im Wurzelverzeichnis des Projekts folgenden Befehl aus:

```bash
docker compose up -d
```

Der Container lädt alle Abhängigkeiten herunter, führt die Datenbank-Migrationen aus und startet den Webserver.

### 3. Wiki aufrufen
Öffne [http://localhost:8080](http://localhost:8080) in deinem Browser.
* **Standard-Admin-Login:** `admin@admin.com`
* **Passwort:** `password`

---

## BookStack aktualisieren (Schritt-für-Schritt-Anleitung)

Da unser Custom Theme vollständig vom `bookstack/`-Verzeichnis isoliert ist, kannst du BookStack jederzeit gefahrlos auf den neuesten Stand bringen, ohne dass es zu Merge-Konflikten kommt.

### 1. Schritt (Empfohlen): Datenbank-Backup erstellen
Vor jedem Update sollte die Datenbank gesichert werden. Führe dazu folgenden Befehl im Wurzelverzeichnis aus:

```bash
docker compose exec db mysqldump -u bookstack-test -pbookstack-test bookstack-dev > backup.sql
```
*Die Datei `backup.sql` wird in deinem lokalen Projektordner erstellt und kann im Notfall wieder eingespielt werden.*

### 2. Schritt: Neuesten BookStack-Code holen
Wechsle in das `bookstack`-Verzeichnis und lade die stabilen Codeänderungen vom offiziellen `release`-Branch herunter:

```bash
cd bookstack
git fetch
git pull
cd ..
```

### 3. Schritt: Docker-Container neu starten
Starte die Container neu. Beim Booten des Anwendungs-Containers werden im Hintergrund automatisch die Abhängigkeiten (`composer install`) und eventuelle Datenbank-Migrationen (`php artisan migrate`) ausgeführt:

```bash
docker compose down
docker compose up -d
```

### 4. Schritt: Logs prüfen (Optional)
Du kannst überprüfen, ob das Update erfolgreich durchgelaufen ist und der Webserver aktiv ist:

```bash
docker compose logs -f app
```
*Sobald dort `Apache/2.x.x ... configured -- resuming normal operations` steht, ist deine Instanz auf dem neuesten Stand und betriebsbereit.*

---

## Entwickler-Informationen
Für detaillierte Informationen zur Architektur, den Design-Entscheidungen und Richtlinien für KI-Agenten, siehe [gemini.md](file:///d:/Antigravity/SilverWiki/gemini.md).
