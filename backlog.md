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

### 2. Custom Page Templates (Vorlagen-Bibliothek)
Vordefinierte Design-Layouts für typische Wiki-Einträge im Unternehmen.
* **Inhalt:** Vorlagen für Arbeitsanweisungen, Normen-Zusammenfassungen, Materialdatenblätter und Onboarding-Steckbriefe.
* **Ziel:** Einheitliche Strukturierung und professionelle Formatierung ab der ersten Sekunde der Artikelerstellung.

### 3. KI-Übersetzungs-Plugin
Da in modernen Unternehmen oft Mitarbeiter verschiedener Nationalitäten arbeiten, soll eine automatische Übersetzungsfunktion für Seiten integriert werden.
* **Funktionsweise:** Integration von DeepL oder einer lokalen KI, um Seiteninhalte per Klick in andere Sprachen (z. B. Englisch/Polnisch) zu übersetzen und als Sprachversionen abzuspeichern.

### 4. draw.io Premium Themes & Vorlagen
BookStack hat draw.io nativ für Ablaufdiagramme integriert.
* **Erweiterung:** Bereitstellung von unternehmenseigenen Farbpaletten und Shapes (z. B. im SilverWiki Design-Stil mit Indigo-Cyan-Verläufen) direkt in draw.io für konsistente Diagramme.

### 5. Performance-Optimierung: WSL2 File System Overhead (Windows NTFS Volume-Mounts)
Da sich das Projektverzeichnis standardmäßig auf einem Windows-Laufwerk (z. B. `d:\Antigravity\SilverWiki`) befindet, muss Docker über WSL2 (Windows-Subsystem für Linux) bei jedem Seitenaufruf auf die Dateien auf der Windows-Festplatte zugreifen.
* **Das Problem:** Da PHP-Anwendungen (wie Laravel/BookStack) bei jedem Seitenaufruf Hunderte von PHP-Dateien laden, führt die Übersetzung zwischen dem Windows-Dateisystem (NTFS) und dem Linux-Dateisystem im Container zu einem spürbaren Overhead (I/O Bottleneck).
* **Der Tipp für maximale Performance:** Falls die Anwendung in der Entwicklungsumgebung zu langsam reagiert, empfiehlt es sich, das gesamte Projektverzeichnis direkt in das native WSL2-Dateisystem zu legen (z. B. unter `\\wsl$\Ubuntu\home\<username>\SilverWiki`) und die Docker-Container von dort aus zu starten. Dies beschleunigt die Ladezeiten nochmals um den Faktor 10 bis 20, da der Windows-I/O-Overhead komplett entfällt.

