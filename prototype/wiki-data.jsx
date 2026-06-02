// SilverWiki — Sample data for the prototype
const WIKI_CATEGORIES = [
  { id: 'prozesse', name: 'Arbeitsanweisungen', icon: 'description', count: 24 },
  { id: 'normen', name: 'Normen & Vorschriften', icon: 'gavel', count: 18 },
  { id: 'material', name: 'Materialdaten', icon: 'inventory_2', count: 31 },
  { id: 'maschinen', name: 'Maschinenanleitungen', icon: 'precision_manufacturing', count: 12 },
  { id: 'kunden', name: 'Kunden & Projekte', icon: 'business', count: 9 },
  { id: 'onboarding', name: 'Onboarding', icon: 'school', count: 7 },
];

const WIKI_TAGS = [
  'Schweißen', 'EN-1090', 'Plasma', 'S355', 'Montage', 'Sicherheit',
  'CNC', 'Qualität', 'DIN-18800', 'Feuerverzinkung', 'Brandschutz',
  'Arbeitsvorbereitung', 'Prüfung', 'Transport', 'IPE', 'HEA',
];

const WIKI_ARTICLES = [
  {
    id: 1, title: 'Schweißnahtprüfung nach EN 1090-2',
    excerpt: 'Anforderungen an die zerstörungsfreie Prüfung von Schweißnähten im Stahlbau gemäß EN 1090-2, Tabelle 24.',
    author: 'Stefan Dohr', category: 'normen',
    tags: ['EN-1090', 'Schweißen', 'Prüfung', 'Qualität'],
    updated: 'heute', views: 142, versions: 5,
  },
  {
    id: 2, title: 'Arbeitsanweisung: Plasma-Brennschneiden',
    excerpt: 'Schritt-für-Schritt Anleitung für den Plasmaschnitt an der Messer Oxytherm Anlage inkl. Parametertabelle.',
    author: 'Klaus Berger', category: 'maschinen',
    tags: ['Plasma', 'CNC', 'Sicherheit', 'Arbeitsvorbereitung'],
    updated: '1h', views: 89, versions: 3,
  },
  {
    id: 3, title: 'Materialübersicht: S355J2+N',
    excerpt: 'Mechanische Eigenschaften, Schweißeignung und Einsatzgebiete für Baustahl S355J2+N nach EN 10025-2.',
    author: 'Maria Huber', category: 'material',
    tags: ['S355', 'Schweißen', 'Material', 'EN-1090'],
    updated: '2h', views: 234, versions: 8,
  },
  {
    id: 4, title: 'Feuerverzinkung — Vorbereitung & Prozess',
    excerpt: 'Anforderungen an die Oberflächenvorbereitung vor dem Verzinken und Kontrolle der Schichtdicke nach DIN EN ISO 1461.',
    author: 'Thomas Keller', category: 'prozesse',
    tags: ['Feuerverzinkung', 'Qualität', 'DIN-18800'],
    updated: '3d', views: 67, versions: 2,
  },
  {
    id: 5, title: 'Montageanleitung: Hallenkonstruktion Typ A',
    excerpt: 'Standardablauf für die Montage von Einfeld-Hallentragwerken mit Pendelstützen und Satteldachbindern.',
    author: 'Stefan Dohr', category: 'prozesse',
    tags: ['Montage', 'Sicherheit', 'Transport', 'IPE'],
    updated: '1w', views: 178, versions: 6,
  },
  {
    id: 6, title: 'Brandschutzanforderungen R30/R60',
    excerpt: 'Übersicht der Feuerwiderstandsklassen für Stahlkonstruktionen und Maßnahmen zur Erreichung von R30 bzw. R60.',
    author: 'Maria Huber', category: 'normen',
    tags: ['Brandschutz', 'Sicherheit', 'Normen'],
    updated: '1w', views: 95, versions: 4,
  },
  {
    id: 7, title: 'Einführung für neue Mitarbeiter',
    excerpt: 'Willkommensseite mit Links zu allen relevanten Arbeitsanweisungen, Sicherheitsunterweisungen und Ansprechpartnern.',
    author: 'Klaus Berger', category: 'onboarding',
    tags: ['Onboarding', 'Sicherheit'],
    updated: '2w', views: 312, versions: 11,
  },
  {
    id: 8, title: 'Profilübersicht: IPE & HEA Reihen',
    excerpt: 'Tabellarische Übersicht aller IPE- und HEA-Profile mit Querschnittswerten, Gewichten und Trägheitsmomenten.',
    author: 'Thomas Keller', category: 'material',
    tags: ['IPE', 'HEA', 'Material', 'S355'],
    updated: '3d', views: 421, versions: 14,
  },
];

// Sample article content (markdown-ish)
const SAMPLE_ARTICLE_MD = `# Schweißnahtprüfung nach EN 1090-2

## 1. Geltungsbereich

Diese Arbeitsanweisung regelt die **zerstörungsfreie Prüfung (ZfP)** von Schweißnähten an tragenden Stahlbauteilen gemäß EN 1090-2, Abschnitt 12.4.

Die Prüfung ist für alle Ausführungsklassen (EXC1–EXC4) verbindlich, wobei der Prüfumfang je nach Klasse variiert.

## 2. Prüfumfang nach Ausführungsklasse

| Ausführungsklasse | Sichtprüfung (VT) | Oberfläche (MT/PT) | Volumen (UT/RT) |
|---|---|---|---|
| EXC1 | 100 % | 0 % | 0 % |
| EXC2 | 100 % | 10 % | 5 % |
| EXC3 | 100 % | 20 % | 10 % |
| EXC4 | 100 % | 100 % | 20 % |

## 3. Prüfzeitpunkt

- **Sichtprüfung**: unmittelbar nach dem Schweißen und vor jeder weiteren Bearbeitung
- **MT/PT-Prüfung**: frühestens 24h nach Abschluss der Schweißung (bei Stählen ≥ S355: 48h)
- **UT/RT-Prüfung**: nach Freigabe durch MT/PT

## 4. Bewertungsgruppen

Schweißnähte sind nach **EN ISO 5817** zu bewerten:

- Bewertungsgruppe **B** (streng) für EXC3 und EXC4
- Bewertungsgruppe **C** (normal) für EXC2
- Bewertungsgruppe **D** (grob) für EXC1

## 5. Dokumentation

Jede Prüfung ist im **Schweißprüfprotokoll** (Formular QM-SP-001) zu dokumentieren mit:
- Prüfer-ID und Qualifikation
- Prüfverfahren und -gerät
- Prüfergebnis und Bewertung
- Datum und Unterschrift

> **Hinweis**: Bei Mängeln der Bewertungsgruppe wird der Schweißfachingenieur (SFI) informiert. Nacharbeiten sind erneut zu prüfen.

---

*Letzte Aktualisierung: 12.05.2026 · Version 5 · Freigabe: Stefan Dohr (SFI)*`;

Object.assign(window, { WIKI_CATEGORIES, WIKI_TAGS, WIKI_ARTICLES, SAMPLE_ARTICLE_MD });
