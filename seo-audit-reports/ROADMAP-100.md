# Roadmap: SEO-Score 88 → 100 für pulk.space

**Erstellt:** 2026-04-23
**Basis:** Action-Plan-Umsetzung von heute — erwarteter Score nach Deploy: **88–92 / 100**
**Ziel:** 95+ in 8 Wochen, 98+ in 6 Monaten

---

## Wo wir aktuell stehen

Die niedrig hängenden Früchte sind gepflückt. Schema, Alt-Texte, Canonicals, Sitemap, Image-Pipeline, interne Links — alles strukturell sauber. Ab hier wird jeder Score-Punkt teurer: Er hängt an **Content-Substanz**, **echten Nutzungssignalen** (Dwell, CTR) und **externer Autorität** (Backlinks, Erwähnungen).

Grob übersetzt:
- **88 → 92 Punkte:** Content-Ausbau + Performance-Feintuning (dieser Monat)
- **92 → 96 Punkte:** Autoritätssignale aufbauen (Monate 2–3)
- **96 → 100 Punkte:** laufendes Content-Momentum + SERP-Eigentum bestimmter Queries (Monate 3–6)

---

## Gap-Analyse: welche Kategorie blockiert 100 %?

Aktuelle Score-Verteilung (prognostiziert nach Deploy, auf Basis der 7 Kategorien im Audit):

| Kategorie | Gewicht | Alt → Neu | Max-Upside | Was kostet die letzten Punkte |
|-----------|---------|-----------|------------|-------------------------------|
| Technical SEO | 22 % | 65 → **90** | +2 | Brotli verifizieren, CWV-Felddaten grün |
| Content Quality | 23 % | 70 → **78** | +5 | Content-Tiefe /about + /anfragen + Journal |
| On-Page SEO | 20 % | 55 → **85** | +3 | H1-Redesign, Query-optimierte H2/H3 |
| Schema | 10 % | 80 → **95** | +0.5 | schon fast Maximum |
| Performance (CWV) | 10 % | 45 → **75** | +2.5 | echte 28-Tage-Felddaten, INP < 200 ms |
| AI Search Readiness | 10 % | 85 → **92** | +0.8 | Brand Mentions + llms.txt Refinement |
| Images | 5 % | 55 → **85** | +0.75 | Lazy-Loading-Pattern + `loading="lazy"` flächendeckend |

**Größte Hebel, in Reihenfolge:** Content (+5), On-Page (+3), Performance-Felddaten (+2.5), Technical (+2).

---

## Phase 1 — kurzfristig (0–4 Wochen)

Ziel: **Score 92+**

### 1. M1 + M3 nachziehen — Content & H1 (offen aus Action Plan)

**M1. Content-Tiefe**
- `/about`: 302 → 500+ Wörter. Neue Blöcke:
  - „Der Raum" — Stuck, Dielen, modulare Möbel (Material-Philosophie, Nachhaltigkeit)
  - „Kröllwitz als Ort" — lokaler Kontext, Anbindung, was die Umgebung bietet
  - „Für wen der Raum gemacht ist" — Workshops, Coachings, kreative Sessions, Teamtage
- `/anfragen`: 142 → 300+ Wörter. Neue Blöcke:
  - „So läuft eine Anfrage ab" — 3 Schritte, transparent
  - „Häufige Fragen vorab" — 3–4 Mini-FAQs direkt auf der Page (nicht als Schema-FAQ, sondern als sichtbarer H3/H4-Content)
  - „Was wir brauchen, um schneller zu antworten" — Checkliste

**M3. H1-Redesign**
- `/preise`: „Preise und Pakete" → **„Preise für den Workshopraum PULK in Halle (Saale)"** (sichtbar oben, alter Text kann als Sub-H2 bleiben)
- `/anfragen`: „Planst du was?" → **„Workshopraum anfragen – PULK in Halle (Saale)"** (sichtbar oben); „Planst du was?" als Sub-H2 behält den Charakter

**Warum:** Content-Tiefe pusht Category Content (+3), H1-Keywords pushen On-Page (+2). Gemeinsam ~**+5 Score-Punkte**.

### 2. Performance-Felddaten einsammeln

Lighthouse-Lab-Score misst statisch. Google rankt mit CrUX-Felddaten (echte Nutzer).
- 14 Tage nach Deploy: **PageSpeed Insights** für `/` und `/preise` laufen lassen
- **Search Console → Seitenindexierung → Core Web Vitals** checken — falls rot: LCP-Hauptbild weiter komprimieren, Above-the-Fold minimieren
- Ziel: LCP < 2.5s, INP < 200ms, CLS < 0.1 auf Mobile

**Warum:** Performance-Felddaten sind die einzige Performance-Messung, die Google tatsächlich benutzt. **+2.5 Punkte.**

### 3. Lazy-Loading-Pattern prüfen

Aktuell: Hero-Image wird preloaded (korrekt), aber viele Below-the-Fold-Images haben evtl. nicht `loading="lazy"`.
- Quick Check: `grep -c 'loading="lazy"' dist/**/*.html` vs. Gesamtzahl `<img>`-Tags
- Alle Images außerhalb des ersten Viewports: `loading="lazy"` + `decoding="async"`

**Warum:** +0.5 Images, +0.5 Performance.

---

## Phase 2 — mittelfristig (1–3 Monate)

Ziel: **Score 95+**

### 4. Content-Marketing-Start: „Journal"-Section

**Die härteste Hebelwirkung für SEO ist neuer Content, der echte Suchanfragen beantwortet.**

Konzept: ein schlanker Blog/Journal auf `/journal/` mit 1 Artikel/Monat. Thema-Archetypen:
- **Workshop-Formate** — „Design Sprint in 2 Tagen — ein Raum-Setup-Guide" (long-tail: „Design Sprint Raum mieten Halle")
- **Raum-Deep-Dives** — „Warum modulare Möbel produktive Workshops machen" (B2B-Decider lesen das)
- **Location-Content** — „Kröllwitz: Warum unser Raum nicht in der Innenstadt liegt" (hyper-local, Link-magnet)
- **Case-Studies** — „Das Pulk für ein Teamretreat: ein Tag bei uns" (mit Fotos, Review-Schema)

Jeder Artikel: 800–1200 Wörter, 2–3 interne Links zu `/preise` oder `/anfragen`, eigener JSON-LD (`Article` mit `author`, `datePublished`), beschreibende Bilder mit Alt.

**Wirkung:**
- Content Quality: +3
- AI Search Readiness: +2 (LLMs zitieren datierten, strukturierten Content)
- Internal Graph: neue Link-Knoten stärken `/preise` und `/anfragen`

**Aufwand:** 1 Artikel ≈ 3–4 h inkl. Bildern + Upload. Sustainbar monatlich.

### 5. Backlinks & Brand Mentions

Das ist die Kategorie, die man nicht selbst im Code ändert — aber 100 % ohne externe Autorität geht nicht.

**Setup (einmalig, ~2 h):**
- **Google Business Profile** komplett: Fotos (10+), Öffnungszeiten, Website-Link, wöchentlich 1 Post für die ersten 8 Wochen
- **OpenStreetMap:** Eintrag prüfen, Talstraße 7 → `amenity=coworking_space` o.ä. taggen
- **Branchenverzeichnisse:** Workshopraum-Finder, Coworking-Listen, Eventlocation-Portale in Sachsen-Anhalt
- **Halle (Saale) Stadtportal:** Kontakt aufnehmen für redaktionelle Erwähnung

**Inbound:**
- Kundinnen (z.B. „Die Linke Halle") um einen Link von **ihrer** Website bitten
- Partnerschaften mit Coaches/Moderator:innen, die PULK buchen → Gegenseitige Verlinkung

**Wirkung:**
- AI Search Readiness: +2 (Brand-Mention-Signal für LLMs ist heute fast gleichwertig mit Backlink)
- Indirekt: Local Pack Rankings in Google Maps für „Workshopraum Halle"

### 6. Review-Akquise

Aktuell 1 Review im Schema (Die Linke). Ziel: **5–10 echte Reviews** auf Google Maps + Website.

**Plan:**
- Nach jeder gebuchten Veranstaltung: 24h später E-Mail mit Review-Link (Google Maps)
- Die besten 3–5 Zitate strukturiert als `Review`-Schema auf der Homepage ergänzen (analog zum bestehenden Die-Linke-Review)

**Wirkung:** +1 Schema, +1 AI Readiness, messbar Local-SEO-Push.

---

## Phase 3 — langfristig (3–6 Monate)

Ziel: **Score 98+**

### 7. Topic Cluster zum SERP-Eigentum

Sobald ein paar Journal-Artikel existieren: **Topic-Cluster bauen**.

Beispiel „Workshopraum":
- Pillar Page: `/workshopraum-halle/` (2500+ Wörter, alle relevanten Fragen)
- Clusters (verlinken zur Pillar):
  - `/journal/workshopraum-checkliste/`
  - `/journal/workshopformat-design-sprint/`
  - `/journal/team-retreat-raum-suche/`
- Internal Linking zwischen Clustern + zu `/preise` + `/anfragen`

**Wirkung:** Google versteht dich als Autorität zum Thema „Workshopraum Halle" und rankt dich für das ganze Feld, nicht nur einzelne Keywords.

### 8. Strukturierte Daten weiter ausbauen

- **Event-Schema** für regelmäßige eigene Formate (Offene Workshop-Tage, Kreativ-Meetups)
- **HowTo-Schema** auf ausgewählten Journal-Artikeln
- **Speakable-Schema** für FAQ-Antworten (Voice-Search-Ready)

### 9. Monitoring etablieren

- **Wöchentlich:** GSC Search Performance checken — welche Queries wachsen, welche stagnieren
- **Monatlich:** SEO-Audit erneut laufen lassen, Baseline-Vergleich in `seo-audit-reports/April 2026/`-Struktur
- **Vierteljährlich:** Backlink-Profil-Check (z.B. Ahrefs/SEMrush-Free-Tier oder Moz)

---

## Warum 100 / 100 ein Moving Target ist

Score-Tools (Lighthouse, Audit-Frameworks) gewichten, was **heute** messbar ist. Morgen kommt eine neue Metrik (AI-Citability, Web Vitals v3, …). Praktisch heißt das:

- **98 ist erreichbar, 100 selten.** Der letzte Punkt scheitert oft an hart messbaren externen Faktoren (Domain-Age, Backlink-Profile einer Marke wie Adobe).
- **Wichtiger als der Score ist der Trend.** Wenn die Kernmetriken (Impressions, CTR, Position in GSC) Monat für Monat wachsen → Score ist nur noch Reporting.

Unser realistisches Ziel-Szenario:
- **Heute (nach Deploy):** 88–92
- **Monat 1:** 92–94 (M1/M3 + Performance-Felddaten)
- **Monat 3:** 94–96 (Journal + Backlinks wirken)
- **Monat 6:** 96–98 (Topic-Cluster + stabile Review-Pipeline)

**100 ist kein Muss. Top-3-Ranking für „Workshopraum Halle" ist das, was Umsatz bringt.**

---

## Zusammenfassung als Einzeiler

> Content-Tiefe jetzt, Autoritäts-Signale in Q2, Topic-Cluster ab Q3 — dann hat die Seite 2026 eine dominante SERP-Position für den lokalen Workshopraum-Markt.
