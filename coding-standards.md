# Coding Standards

Sprachübergreifende Entwicklungsrichtlinien für den internen Gebrauch.

---

## 1. Benennung & Lesbarkeit

- [ ] Konsistente Namenskonvention (camelCase, PascalCase, snake_case je Kontext) — einheitlich im gesamten Projekt
- [ ] Sprechende Namen — keine Abkürzungen wie `tmp`, `d`, `x` (Ausnahme: Loop-Variablen `i`, `j`)
- [ ] Konstanten klar kennzeichnen (`UPPER_SNAKE_CASE` oder `readonly`)
- [ ] Dateinamen entsprechen dem Hauptinhalt der Datei
- [ ] Keine „magischen Zahlen" — Konstanten mit Namen verwenden (z.B. `MAX_RETRY = 3` statt einfach `3`)

---

## 2. Struktur & Organisation

- [ ] Einfunktionalität pro Funktion / Methode (Single Responsibility) — eine Funktion tut genau eine Sache
- [ ] Funktionen ≤ 30 Zeilen (Richtwert) — längere Funktionen auslagern
- [ ] Dateien ≤ 300–400 Zeilen (Richtwert)
- [ ] Logische Ordnerstruktur, einheitlich im Projekt dokumentiert (z.B. `/src` `/tests` `/docs` `/config`)
- [ ] Zirkuläre Abhängigkeiten vermeiden

---

## 3. Kommentare & Dokumentation

- [ ] Öffentliche Funktionen & Klassen haben Docstrings / XML-Kommentare (Was macht sie, was erwartet sie, was gibt sie zurück)
- [ ] Keine redundanten Kommentare (`i++ // i erhöhen`) — Kommentare erklären das *Warum*, nicht das *Was*
- [ ] TODO/FIXME-Kommentare mit Ticket-Referenz versehen (z.B. `// TODO(#42): Validierung ergänzen`)
- [ ] Changelog oder Versionshistorie in Modulen vorhanden
- [ ] README im Projekt aktuell und vollständig (Setup, Abhängigkeiten, Beispielaufruf)

---

## 4. Fehlerbehandlung

- [ ] Keine leeren catch-Blöcke — mindestens loggen
- [ ] Fehlermeldungen sind aussagekräftig und kontextbezogen (z.B. `Datei nicht gefunden: config.json` statt `Fehler`)
- [ ] Erwartbare Fehlerfälle explizit behandelt (null, leer, out of range)
- [ ] Keine unkontrollierten Abstürze beim Nutzer sichtbar — Fehler abfangen, benutzerfreundlich melden
- [ ] Logging-Level sinnvoll eingesetzt (`DEBUG` / `INFO` / `WARN` / `ERROR`)

---

## 5. Tests & Qualitätssicherung

- [ ] Unit Tests für kritische Kernfunktionen vorhanden
- [ ] Testfälle decken Edge Cases ab (leer, null, Extremwerte)
- [ ] Tests sind unabhängig und wiederholbar — kein geteilter State zwischen Tests
- [ ] CI/CD oder automatischer Test-Run bei Commit/Merge
- [ ] Code-Review vor Merge in Hauptbranch

---

## 6. Versionierung & Git

- [ ] Commit-Messages sind beschreibend (was & warum, nicht wie) — z.B. `Fix: Verbindungsabbruch bei leerer DB behoben`
- [ ] Atomic Commits — eine Änderung pro Commit
- [ ] Feature-Branches, kein direktes Committen auf `main`/`master`
- [ ] `.gitignore` enthält Build-Artefakte, Secrets, lokale Configs
- [ ] Sensible Daten (Passwörter, API-Keys) nie im Repository — Umgebungsvariablen oder Secret-Manager nutzen

---

## 7. Sicherheit & Robustheit

- [ ] Nutzereingaben werden immer validiert / sanitized
- [ ] Abhängigkeiten regelmäßig auf bekannte Sicherheitslücken geprüft (z.B. `npm audit`, `pip-audit`, NuGet-Check)
- [ ] Minimales Rechteprinzip bei Datei- und Datenbankzugriffen
- [ ] Keine hartcodierten Credentials im Quellcode
- [ ] Externe Bibliotheken auf vertrauenswürdige Quellen beschränken

---

## 8. Code-Stil & Formatierung

- [ ] Einheitliche Einrückung (Spaces oder Tabs) — nicht gemischt, im Team einmalig festlegen
- [ ] Linter / Formatter im Projekt konfiguriert und aktiv (z.B. Prettier, Black, EditorConfig)
- [ ] Keine auskommentierten Code-Blöcke im Hauptbranch — löschen, Git speichert die Historie
- [ ] Maximale Zeilenlänge definiert (z.B. 120 Zeichen)
- [ ] Konsistente Import-Reihenfolge (z.B. Stdlib → Extern → Intern)

---

*Letzte Aktualisierung: Juni 2026*
