# SilverWiki — Agent Guidelines & Project Architecture

Dieses Dokument dient als Orientierung für zukünftige KI-Agenten (wie Gemini), die an diesem Repository arbeiten. Es beschreibt die Architektur, wichtige Designentscheidungen und Richtlinien für die Weiterentwicklung.

---

## 1. Projekt-Übersicht & Philosophie
**SilverWiki** ist ein Premium-Design-Overlay für die Open-Source-Wiki-Software **BookStack**.
* **Ziel:** Redesign des UIs basierend auf der **Google Gemini „Neural Expressive“**-Designsprache (hoher Kontrast, flüssige Cyan-Indigo-Lila Verläufe, minimalistische Typografie mit Outfit/Inter, Glassmorphismus, einstellbare Dichte und anpassbare Hintergründe).
* **Entwicklungs-Richtlinie:** **Zerstörungsfreie Integration (Update-Sicherheit)**. Der geklonte `bookstack/`-Ordner darf außer der (von Git ignorierten) `.env`-Datei **keine** modifizierten oder zusätzlichen Dateien enthalten. Dadurch bleibt BookStack jederzeit über Git aktualisierbar (`git pull`), ohne dass Konflikte entstehen.

---

## 2. Verzeichnisstruktur

```
SilverWiki/
├── .git/                      # Git-Verzeichnis für unser SilverWiki-Repository
├── bookstack/                 # Offizieller BookStack-Klon (auf "release" Branch)
│   ├── .env                   # Datenbank- & Theme-Konfiguration (in .gitignore)
│   └── [restliche BookStack-Dateien]
├── theme/                     # Unser Custom Theme (wird per Docker in BookStack gemountet)
│   ├── public/
│   │   ├── css/
│   │   │   └── silverwiki.css # Premium-Styling & Variablen (dark/light, density)
│   │   └── js/
│   │       └── silverwiki.js  # Tweaks-Panel Logic & localStorage Persistence
│   ├── layouts/
│   │   ├── base.blade.php     # Haupt-Layout (lädt Google Fonts & Custom Assets)
│   │   ├── tri.blade.php      # Drei-Spalten-Layout (Regale = Kategorien)
│   │   └── parts/
│   │       └── header.blade.php # Custom SilverWiki Header
│   └── theme.json             # Theme-Metadaten (falls von BookStack benötigt)
├── docker-compose.yml         # Root Docker-Compose zur Orchestrierung beider Ordner
├── gemini.md                  # Dieses Dokument (Entwickler- & Agenten-Leitfaden)
└── README.md                  # Allgemeine Projekt-Beschreibung
```

---

## 3. Lokale Entwicklung & Docker-Setup

BookStack läuft als PHP/Laravel-App mit einer MySQL-Datenbank. Zur lokalen Ausführung nutzen wir das Docker-Compose-File im **Wurzelverzeichnis** (`SilverWiki/`):

1. **Starten:**
   ```bash
   docker compose up -d
   ```
   *Dieses Compose-File baut den Container aus `./bookstack/dev/docker/Dockerfile` und mountet `./theme` nach `/app/themes/silverwiki`.*

2. **Zugriff:**
   * URL: `http://localhost:8080`
   * Zugangsdaten (Standard für BookStack-Entwicklung): `admin@admin.com` / `password`

---

## 4. Wichtige Regeln für zukünftige Bearbeitungen (für Agenten)

* **Regel 1: Keine Änderungen in `bookstack/`!**
  Verändere niemals Dateien im `bookstack/`-Ordner (Ausnahme: `.env`). Wenn ein Blade-Template angepasst werden muss, kopiere es aus `bookstack/resources/views/[pfad]/[datei].blade.php` nach `theme/[pfad]/[datei].blade.php` und bearbeite es dort.
* **Regel 2: Einhaltung des Design-Systems (Gemini Neural Expressive):**
  Nutze die Variablen und Klassen aus `silverwiki.css`. Verwende die Schriftart **Outfit** für alle großen Überschriften und **Inter** für die Fließtexte. Der Hauptakzent ist das Google Gemini-Gradient (Cyan → Indigo → Lila). Achte auf hohen Kontrast (keine extrem blassen Links/Ränder in den Seitenbereichen – setze `opacity: 1 !important` um BookStacks native Abschwächungen zu umgehen).
* **Regel 3: BookStack Git Updates & Zeilenenden (Windows):**
  Um BookStack zu aktualisieren, wechselt man in den `bookstack/`-Ordner und führt `git fetch` und `git pull` aus. 
  **Wichtig für Windows-Entwickler:** Da die Docker-Shell-Skripte LF-Zeilenenden benötigen, wurde die lokale Datei `bookstack/.git/info/attributes` angelegt, die `*.sh text eol=lf` erzwingt. Diese Datei ist im Git-Klon unsichtbar und update-sicher, verhindert jedoch Startprobleme in Docker auf Windows.
* **Regel 4: Tweaks-Panel:**
  Das Tweaks-Panel wird über `silverwiki.js` gesteuert und fügt dem `<html>`-Element CSS-Klassen wie `.density-dense` oder `.bg-flat` hinzu. Alle Styling-Regeln dafür müssen in `silverwiki.css` definiert sein.

