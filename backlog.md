# SilverWiki — Feature Backlog & Roadmap

Dieses Dokument enthält Ideen, Erweiterungen und zukünftige Features für SilverWiki, die zu einem späteren Zeitpunkt implementiert werden können.

---

## 🚀 Priorisierte Features

### 1. Automatische PDF-Textextraktion & OCR (KI/Suche)
BookStack indexiert standardmäßig keine Inhalte von hochgeladenen Dateianhängen (PDF, Word etc.). Um das Firmenwissen vollständig durchsuchbar zu machen, soll ein Extraktions-Service integriert werden.

* **Funktionsweise:**
  1. Registrierung eines Eloquent-Event-Listeners in `theme/functions.php` auf das Model `\BookStack\Uploads\Attachment::created`.
  2. Bei Upload einer PDF-Datei wird der Text extrahiert:
     - **Digitale PDFs:** Direktes Auslesen mittels einer PHP-Bibliothek wie `smalot/pdfparser`.
     - **Gescannte PDFs/Bilder:** Texterkennung via **Tesseract OCR** (muss im Docker-Container installiert sein) oder einer Cloud-OCR-API.
  3. Der extrahierte Text wird vollautomatisch am Ende der entsprechenden Wiki-Seite in einem eingeklappten HTML `<details>`-Element angehängt.
* **Vorteil:** Der Text stört optisch nicht, wird aber von BookStacks Suchmaschine vollständig erfasst. Hochgeladene Dokumente sind sofort über die normale Wiki-Suche auffindbar.
* **Status:** Bereit für Konzeption / Implementierung.

### 2. Dynamisches Theme-Kompilierungssystem aus Markdown-Dateien (.md)
Designer sollen neue Themes definieren können, indem sie einfach eine `.md`-Datei mit YAML-Frontmatter (z. B. `DESIGN-custom.md`) in das Projekt legen.

* **Funktionsweise (Build-Time Compilation):**
  1. **Theme-Dateien**: Die Markdown-Design-Dateien (wie `DESIGN_linear.md`, `DESIGN-claude.md`) werden in einem Verzeichnis gesammelt (z. B. `theme/presets/`).
  2. **Node.js Compiler-Skript**: Ein JavaScript-Skript unter `scripts/compile-themes.js` scannt diesen Ordner. Es liest das YAML-Frontmatter aus und extrahiert die Abschnitte `colors`, `typography` und `rounded`.
  3. **CSS-Generierung**: Das Skript generiert daraus die CSS-Variablen und die spezifischen Override-Klassen (z. B. `html.theme-preset-linear`) und schreibt sie vollautomatisch in eine eigene Presets-CSS-Datei `theme/public/css/silverwiki-presets.css` (oder hängt sie an `silverwiki.css` an).
  4. **HTML-Generierung (base.blade.php)**: Das Skript aktualisiert die HTML-Struktur des Tweaks-Panels in `theme/layouts/base.blade.php` (oder generiert ein Sub-Blade-Template `theme/layouts/parts/tweaks-presets.blade.php`), um die Theme-Schaltflächen dynamisch basierend auf den vorhandenen Dateien auszugeben.
  5. **Automatisierung**: Das Skript wird als npm-Script in der `package.json` hinterlegt (z. B. `npm run compile-themes`), sodass es leicht in CI/CD-Pipelines oder beim lokalen Speichern ausgeführt werden kann.
* **Vorteil**: Absolute FOUC-Freiheit (kein Flackern beim Laden, da statisches CSS), keine Laufzeit- und Serverlast auf PHP-Ebene und extrem einfache Erweiterbarkeit (nur eine neue `.md`-Datei hinzufügen und kompilieren).
* **Status**: Konzipiert, wartet auf Implementierung.

---

## 💡 Zukünftige Ideen & Verbesserungen

### 1. KI-Übersetzungs-Plugin
Da in modernen Unternehmen oft Mitarbeiter verschiedener Nationalitäten arbeiten, soll eine automatische Übersetzungsfunktion für Seiten integriert werden.
* **Funktionsweise:** Integration von DeepL oder einer lokalen KI, um Seiteninhalte per Klick in andere Sprachen (z. B. Englisch/Polnisch) zu übersetzen und als Sprachversionen abzuspeichern.

### 2. Performance-Optimierung: WSL2 File System Overhead (Windows NTFS Volume-Mounts)
Da sich das Projektverzeichnis standardmäßig auf einem Windows-Laufwerk (z. B. `d:\Antigravity\SilverWiki`) befindet, muss Docker über WSL2 (Windows-Subsystem für Linux) bei jedem Seitenaufruf auf die Dateien auf der Windows-Festplatte zugreifen.
* **Das Problem:** Da PHP-Anwendungen (wie Laravel/BookStack) bei jedem Seitenaufruf Hunderte von PHP-Dateien laden, führt die Übersetzung zwischen dem Windows-Dateisystem (NTFS) und dem Linux-Dateisystem im Container zu einem spürbaren Overhead (I/O Bottleneck).
* **Der Tipp für maximale Performance:** Falls die Anwendung in der Entwicklungsumgebung zu langsam reagiert, empfiehlt es sich, das gesamte Projektverzeichnis direkt in das native WSL2-Dateisystem zu legen (z. B. unter `\\wsl$\Ubuntu\home\<username>\SilverWiki`) und die Docker-Container von dort aus zu starten. Dies beschleunigt die Ladezeiten nochmals um den Faktor 10 bis 20, da der Windows-I/O-Overhead komplett entfällt.


