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

---

## 💡 Zukünftige Ideen & Verbesserungen

### 2. KI-Übersetzungs-Plugin
Da in modernen Unternehmen oft Mitarbeiter verschiedener Nationalitäten arbeiten, soll eine automatische Übersetzungsfunktion für Seiten integriert werden.
* **Funktionsweise:** Integration von DeepL oder einer lokalen KI, um Seiteninhalte per Klick in andere Sprachen (z. B. Englisch/Polnisch) zu übersetzen und als Sprachversionen abzuspeichern.

### 3. Performance-Optimierung: WSL2 File System Overhead (Windows NTFS Volume-Mounts)
Da sich das Projektverzeichnis standardmäßig auf einem Windows-Laufwerk (z. B. `d:\Antigravity\SilverWiki`) befindet, muss Docker über WSL2 (Windows-Subsystem für Linux) bei jedem Seitenaufruf auf die Dateien auf der Windows-Festplatte zugreifen.
* **Das Problem:** Da PHP-Anwendungen (wie Laravel/BookStack) bei jedem Seitenaufruf Hunderte von PHP-Dateien laden, führt die Übersetzung zwischen dem Windows-Dateisystem (NTFS) und dem Linux-Dateisystem im Container zu einem spürbaren Overhead (I/O Bottleneck).
* **Der Tipp für maximale Performance:** Falls die Anwendung in der Entwicklungsumgebung zu langsam reagiert, empfiehlt es sich, das gesamte Projektverzeichnis direkt in das native WSL2-Dateisystem zu legen (z. B. unter `\\wsl$\Ubuntu\home\<username>\SilverWiki`) und die Docker-Container von dort aus zu starten. Dies beschleunigt die Ladezeiten nochmals um den Faktor 10 bis 20, da der Windows-I/O-Overhead komplett entfällt.

---

## ➔ Abgeschlossene Optimierungen / Bugfixes

### 1. Überlappende Regallinien ("Striche") in der Bücher-Übersicht entfernt
* **Problem:** In der Bücher-/Regal-Übersicht (`.silverwiki-shelf-bookshelf-grid`) wurden skeuomorphische Regalböden (die horizontalen Linien) über absolute Positionen im CSS gerendert. Dies führte bei dynamischen Höhen der Buch-Karten (z. B. durch längere Titel oder Beschreibungstexte) und verschiedenen Bildschirmgrößen dazu, dass die Linien unschön mitten durch die Karten schnitten.
* **Lösung:** Pseudo-Elemente `::before` und `::after` auf dem Grid gelöscht und den vertikalen Abstand (`row-gap`) auf `24px` verringert, was zu einem sauberen, modernen und robusten Layout führt.
* **Datum:** Juni 2026

### 2. Interaktive, sortierbare & filterbare Datentabellen
* **Beschreibung:** Dynamische Integration der `simple-datatables`-Bibliothek. Tabellen in Wiki-Seiten (sofern sie Kopfzeilen besitzen) werden automatisch interaktiv mit clientseitiger Sortierung, Suche und Pagination. Sehr kleine Tabellen (unter 5 Datenzeilen) werden dezent sortierbar gehalten, während größere Tabellen vollwertige Controls erhalten. Ein premium CSS-Design im Gemini-Farbschema wurde für Light/Dark/Dense-Modi integriert.
* **Datum:** Juni 2026

### 3. Custom Page Templates (Vorlagen-Bibliothek)
* **Beschreibung:** Bereitstellung von vier professionell gestalteten Vorlagen (Arbeitsanweisungen/SOPs, Normen-Zusammenfassungen, Materialdatenblätter und Onboarding-Steckbriefe) in einem eigenen Buch "SilverWiki Vorlagen". Importiert über ein custom Artisan Command (`silverwiki:import-templates`) und nahtlos integriert.
* **Datum:** Juni 2026

### 4. draw.io Premium Themes & Custom Farbpalette
* **Beschreibung:** Dynamische Konfiguration des integrierten draw.io-Diagrammeditors via Frontend-Event (`editor-drawio::configure`). Eigene Gemini-Farbpalette (Cyan-Indigo-Lila-Coral) und Standard-Schriftarten (Outfit/Inter) wurden im Editor hinterlegt.
* **Datum:** Juni 2026


