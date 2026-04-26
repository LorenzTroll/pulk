# Full SEO Audit – pulk.space

**Datum:** 2026-04-23
**URL:** https://pulk.space/
**Crawled routes:** `/`, `/about/`, `/preise/`, `/anfragen/`, `/impressum/`, `/datenschutz/`
**Business-Typ:** Local Service (Raumvermietung, stationär, Halle/Saale)

---

## Executive Summary

**SEO Health Score: 65 / 100**

| Kategorie | Weight | Score | Gewichtet |
|-----------|--------|-------|-----------|
| Technical SEO | 22 % | 65 | 14.3 |
| Content Quality | 23 % | 70 | 16.1 |
| On-Page SEO | 20 % | 55 | 11.0 |
| Schema / Structured Data | 10 % | 80 | 8.0 |
| Performance (CWV Lab) | 10 % | 45 | 4.5 |
| AI Search Readiness | 10 % | 85 | 8.5 |
| Images | 5 % | 55 | 2.75 |

### Top 5 kritische Findings

1. **`/preise` canonical zeigt auf `/`** → Google dedupliziert die Preise-Seite als Variante der Homepage. Sie kann NICHT für "Preise", "Pakete", "Miete" ranken. **Blocker.**
2. **`<picture>` liefert keine AVIF/WEBP** → 45 AVIF + 45 WEBP werden gebaut, aber die `<source>`-Tags sind leer (`<source data-v-xxxx="">`). Browser laden die JPEG/PNG-Fallbacks (9.5 MB vs. 2.3 MB AVIF) → LCP massiv beeinträchtigt.
3. **Broken Preload-Hint `href="[object Object]"`** → `LandingPage.vue:88` preloadet `staticGalleryImg` direkt statt `staticGalleryImg.img.src`. Der Browser wirft 404 für einen nicht-existenten Pfad.
4. **Sitemap vs. Canonical vs. Serving-URL inkonsistent** → Sitemap listet `/about`, Canonical sagt `/about`, Apache 301-redirectet zu `/about/`. Jede Unterseite erzeugt einen unnötigen Redirect-Hop und Crawl-Budget-Overhead.
5. **Aggressive `modulepreload` für Modal-Bundles** → 14 modulepreload-Hints ziehen Calendar (135 KB), GL (55 KB), alle Modale (~40 KB) beim ersten Besuch, obwohl `defineAsyncComponent` Lazy-Loading suggeriert. Verschwendet ~400 KB Bandbreite vor LCP.

### Top 5 Quick Wins

1. **Canonical in `PricingPage.vue` nachrüsten** — eine Zeile: `{ rel: 'canonical', href: 'https://pulk.space/preise' }` im useHead.
2. **Preload-Bug fixen** — `staticGalleryImg` → `staticGalleryImg.img.src` in LandingPage.vue:88.
3. **Sitemap mit Trailing-Slashes** — alle 6 URLs auf `/about/`, `/preise/` usw. umstellen; Canonicals parallel auf Trailing-Slash anpassen.
4. **FAQPage-Schema aus Legal-Pages entfernen** — Impressum/Datenschutz haben keinen sichtbaren FAQ-Content; das Schema dort ist Spam-Risiko.
5. **Doppeltes FAQPage auf `/preise` deduplizieren** — zwei identische FAQPage-Blöcke im Markup (JSON-LD-Index [1] und [3]).

---

## Technical SEO

### ✅ Was funktioniert

- **HTTPS** überall, HSTS `max-age=31536000; includeSubDomains`
- **Security-Header komplett:** X-Content-Type-Options nosniff, X-Frame-Options SAMEORIGIN, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (geo/mic/cam/cohort deaktiviert)
- **CSP gesetzt** — `default-src 'self'`, Script-Whitelist für Sitesights-Tracking
- **robots.txt** strukturiert, Sitemap-Referenz vorhanden, AI-Crawler whitelist
- **Sitemap.xml** gültig XML, alle 6 Kernrouten vertreten, `lastmod`/`changefreq`/`priority` gesetzt
- **www → apex Redirect** (301) funktioniert
- **Legacy `/miete` → `/anfragen`** Redirect funktioniert (siehe Anmerkung unten)
- **Cache-Control perfekt:** `immutable, max-age=31536000` für Assets, `no-cache` für HTML
- **Gzip-Compression** aktiv für HTML (8.7 KB statt 35 KB)
- **404-Status** korrekt als `HTTP 404` (nicht Soft-404)

### ⚠️ Probleme

| Problem | Detail | Impact |
|---------|--------|--------|
| **Canonical `/preise` zeigt auf `/`** | `PricingPage.vue` setzt keinen Canonical im useHead → Fallback aus `index.html` bleibt `https://pulk.space/` | **CRITICAL — blockiert Indexierung der Preise-Seite** |
| **Trailing-Slash Redirect auf allen Unterseiten** | Apache 301: `/about` → `/about/`. Sitemap hat `/about`, Canonical hat `/about`. | Crawl-Budget-Verschwendung, Signal-Dilution |
| **Doppelter 301 auf `/miete`** | `/miete` → `/anfragen` → `/anfragen/` (zwei Hops statt einer) | Minor, aber unnötig |
| **Kein Brotli** | Nur Gzip aktiv (Hetzner Shared hat wohl kein `mod_brotli`) | ~20 % schlechtere Kompression als möglich |
| **Aggressive modulepreload** | 14 Hints im `<head>` inkl. Calendar/GL/Modale, die vor LCP nicht gebraucht werden | Verlangsamt LCP |
| **Broken `<link rel="preload" href="[object Object]">`** | JS-Objekt als URL serialisiert → 404-Fetch | Kaputte Optimierung, Konsolen-Warnung |

---

## Content Quality

### Prerendered Word Count pro Seite

| Route | Words | Bewertung |
|-------|-------|-----------|
| `/` | 549 | ✅ gut für Landing |
| `/about/` | 302 | ⚠️ thin — sollte 500+ werden (Story, Location, Team) |
| `/preise/` | 471 | ✅ |
| `/anfragen/` | 142 | ⚠️ sehr thin — Kontaktseite, aber mehr Kontext wäre hilfreich |
| `/impressum/` | nicht geprüft | Legal — OK |
| `/datenschutz/` | nicht geprüft | Legal — OK |

### E-E-A-T Assessment

- **Experience:** schwach — keine sichtbaren Kundenstimmen-Cases, keine Fallbeispiele mit Ergebnissen
- **Expertise:** mittel — Produkt-Schema zeigt Pakete, LocalBusiness deckt Fakten ab
- **Authoritativeness:** schwach — kein Team-Bereich mit Bios, keine Referenz-Logos/Kunden
- **Trustworthiness:** gut — Impressum + Datenschutz vorhanden, Kontaktdaten sichtbar, SSL, klare NAP

### Duplicate Content Risk

- `robots.txt` blockt `?modal=*` Querystring-Varianten ✅
- Modals und ihre Deep-Link-Pages (`/about` Modal vs `/about` Seite) könnten als Duplikate wirken, **aber** die Prerendering-Routes sind die indexierten Versionen und die Modals werden per `defineAsyncComponent` erst bei Interaktion geladen — d.h. nur eine Variante landet im Index ✅

---

## On-Page SEO

### Title-Tags

| Route | Title | Länge |
|-------|-------|-------|
| `/` | PULK – Workshop- und Seminarraum in Halle (Saale) | 50 ✅ |
| `/about/` | Der Raum PULK – Creative Space mieten in Halle-Kröllwitz | 57 ✅ |
| `/preise/` | Preise & Pakete · PULK Raum Halle (Saale) | 41 ✅ |
| `/anfragen/` | PULK anfragen – Workshopraum mieten in Halle (Saale) | 53 ✅ |
| `/impressum/` | Impressum · PULK – Raum in Halle (Saale) | 41 ✅ |
| `/datenschutz/` | Datenschutz · PULK – Raum in Halle (Saale) | 43 ✅ |

✅ Alle Titles unique, unter 60 Zeichen, Brand + Keyword + Location.

### Meta Descriptions

Alle Descriptions vorhanden, zwischen 140-200 Zeichen, Keywords + CTA enthalten. ✅

### H1 pro Seite

| Route | H1 | Bewertung |
|-------|------|-----------|
| `/` | Unser Seminarraum in Halle: 100 Quadratmeter bis zu 40 Personen | ✅ strong |
| `/about/` | Creative Space in Halle Saale mieten | ✅ keyword-rich |
| `/preise/` | Preise und Pakete | ⚠️ generisch, kein Location-Keyword |
| `/anfragen/` | Planst du was? | ⚠️ kreativ aber SEO-schwach; könnte "Workshopraum anfragen" sein |
| `/impressum/` | Impressum | ✅ ok (Legal) |
| `/datenschutz/` | Datenschutz | ✅ ok (Legal) |

### Heading Hierarchy

| Route | H1 | H2 | H3 |
|-------|----|----|----|
| `/` | 1 | 7 | 4 |
| `/about/` | 1 | 2 | 4 |
| `/preise/` | 1 | 7 | 4 |
| `/anfragen/` | 1 | 1 | 4 |
| `/impressum/` | 1 | 1 | 4 |
| `/datenschutz/` | 1 | 8 | 4 |

- `/about/`: zu wenig H2 (2) bei 4 H3 → Hierarchie-Sprung. Sollte mehr Content-Sektionen mit H2 bekommen.

### Canonical Audit

| Route | Canonical | Bewertung |
|-------|-----------|-----------|
| `/` | `https://pulk.space/` | ✅ |
| `/about/` | `https://pulk.space/about` | ⚠️ Slash-Mismatch (serviert wird `/about/`) |
| `/preise/` | `https://pulk.space/` | **❌ CRITICAL — falsche Canonical** |
| `/anfragen/` | `https://pulk.space/anfragen` | ⚠️ Slash-Mismatch |
| `/impressum/` | `https://pulk.space/impressum` | ⚠️ Slash-Mismatch |
| `/datenschutz/` | `https://pulk.space/datenschutz` | ⚠️ Slash-Mismatch |

### Internal Linking

Homepage hat 8 interne Links (zu allen Kernrouten + 2× Datenschutz via Cookie-Banner). Relativ sparse; Content-Body hat keine inline-Textlinks zu anderen Seiten. Quick-Win: in FAQs kontextuelle Links einfügen (z.B. "→ Siehe [Preise und Pakete](/preise)" im FAQ "Wie läuft die Buchung ab?").

---

## Schema / Structured Data

| Route | Schema Types |
|-------|--------------|
| `/` | LocalBusiness+MeetingRoom+EventVenue, FAQPage |
| `/about/` | LocalBusiness+MeetingRoom+EventVenue, FAQPage, AboutPage, BreadcrumbList, 2× Person |
| `/preise/` | LocalBusiness+MeetingRoom+EventVenue, FAQPage, Product, **FAQPage (duplicate)** |
| `/anfragen/` | LocalBusiness+MeetingRoom+EventVenue, FAQPage, ContactPage, BreadcrumbList |
| `/impressum/` | LocalBusiness+MeetingRoom+EventVenue, **FAQPage (kein FAQ auf Seite)**, LegalService |
| `/datenschutz/` | LocalBusiness+MeetingRoom+EventVenue, **FAQPage (kein FAQ auf Seite)** |

### LocalBusiness — Detail-Check (auf Home)

- `@type: [LocalBusiness, MeetingRoom, EventVenue]` ✅
- `@id: https://pulk.space/#pulk` ✅ (eindeutige Entity-ID)
- `name`, `description`, `image`, `url` ✅
- `sameAs: [Instagram, Google Maps]` ✅
- `address` (PostalAddress, Talstraße 7, 06120 Halle/Saale, DE) ✅
- `geo` (GeoCoordinates 51.4958, 11.9338) ✅
- `telephone`, `email`, `contactPoint` ✅
- `openingHoursSpecification` ✅
- `amenityFeature` (Whiteboard, Fernseher, Workshopmaterialien, …) ✅
- `knowsAbout` (Workshops, Seminars, …) ✅

**Bewertung:** Eines der vollständigsten LocalBusiness-Markups, die ich sehe. Sehr gut.

### Probleme

1. **FAQPage auf Legal-Pages** (Impressum/Datenschutz) — dort ist kein FAQ-Content sichtbar → Google kann dies als Markup-Spam werten. Rich-Result-Entzug möglich.
2. **FAQPage duplicate auf `/preise`** — zwei identische `<script type="application/ld+json">{@type: FAQPage}`-Blöcke. Entweder einen entfernen oder IDs vergeben.
3. **BreadcrumbList fehlt auf `/preise`** — alle anderen Content-Pages haben Breadcrumbs, Preise nicht.

---

## Performance (CWV Lab-Schätzung)

**Keine Lighthouse-Messung möglich in diesem Audit** (kein Playwright/Chrome-Headless im Audit-Run). Schätzung anhand statischer Analyse:

### Bundle-Struktur (Initial Load)

| Chunk | Raw | Gzip |
|-------|-----|------|
| index.js | 73 KB | 25 KB |
| vue.js | 106 KB | 42 KB |
| head.js | 18 KB | 7 KB |
| scroll.js | 17 KB | 5 KB |
| icons.js | 61 KB | 19 KB |
| gsap.js | 70 KB | 28 KB |
| **Initial Path** | **345 KB** | **126 KB** |
| calendar.js (modal-lazy) | 135 KB | 47 KB |
| gl.js (modal-lazy) | 55 KB | 16 KB |
| Modal-Bundles (3 Modale) | ~34 KB | ~13 KB |

**Problem:** Alle Modal-Bundles + Calendar + GL werden via `<link rel="modulepreload">` im `<head>` vor-geladen, obwohl sie per `defineAsyncComponent` lazy geladen werden sollten. Das negiert die Lazy-Optimierung und zieht ~400 KB extra vor LCP.

### Images

- **9.5 MB PNG/JPEG + 4.1 MB WEBP + 2.3 MB AVIF** im dist/
- Browser laden aktuell nur die PNG/JPEG-Fallbacks weil `<source>`-Tags in Picture leer sind (Vue + vite-imagetools Rendering-Bug im Prerender)
- Hero-Chair PNG: 288 KB — LCP-relevanter Kandidat
- Pricing-Image PNG: 469 KB

### LCP-Kandidat

Auf `/` ist das Hero-Chair-Arrangement oder `pulk_room_image-A.jpeg` (Fallback-Source, sichtbar als erstes `<img loading="eager" fetchpriority="high">`) der LCP. Geschätzt: 2.5–3.5 s auf Mobile 4G bei aktuellem Setup. Mit AVIF-Fix + Fetch-Fix: **1.5–2 s realistisch**.

---

## Images

- **0/63 img-Tags ohne alt** ✅
- Viele leere alts (`alt=""`) bei dekorativen Grafiken — korrekt
- Generische Alt-Texte auf `/about` ("PULK Innenansicht 1", "PULK Innenansicht 2", …) sollten durch beschreibende Texte ersetzt werden
- `loading="lazy"` + `decoding="async"` auf Below-Fold-Images ✅
- **Keine AVIF/WEBP werden tatsächlich ausgeliefert** (trotz 90 gebauter Varianten) — siehe Performance-Abschnitt

---

## AI Search Readiness

- ✅ `llms.txt` existiert + listet Kernrouten
- ✅ `llms-full.txt` existiert (4.8 KB)
- ✅ `robots.txt` erlaubt explizit GPTBot, ChatGPT-User, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, CCBot, Applebot-Extended, OAI-SearchBot
- ✅ Reiches strukturiertes Markup (LocalBusiness + Amenities + FAQ) ermöglicht Zitierbarkeit
- ✅ Klare, faktische Sätze in Descriptions und FAQ-Antworten
- ⚠️ Kein `author`-Attribut, keine Publication-Dates → LLMs bevorzugen datierten Content für Zitate

**Score 85 / 100** — einer der stärksten Bereiche.

---

## Local SEO (Halle/Saale)

- ✅ Stadt im Title, H1, Description aller Hauptseiten
- ✅ Postleitzahl + Straße in LocalBusiness Schema
- ✅ GeoCoordinates exakt (Talstraße 7, 06120)
- ✅ Telefonnummer im international-Format (+49 345 20849778)
- ✅ Öffnungszeiten im Schema
- ✅ SameAs-Link zu Google Maps
- ⚠️ Kein Google Business Profile Review-Schema sichtbar (extern verwaltet — außerhalb des Codebase-Scope)
- ⚠️ Keine `hasMap`-URL im LocalBusiness Schema (klein aber nice-to-have)

---

## Zusammenfassung

**Die Seite ist technisch sehr sauber gebaut** — Security, Sitemap, robots.txt, LocalBusiness-Schema, llms.txt, Cache-Control sind alle auf hohem Niveau. Die Stärken liegen in den AI-Readiness und Schema-Signalen.

**Die drei blockierenden Probleme sind alle codebasiert und in wenigen Zeilen fixbar:**

1. Canonical in PricingPage
2. Preload-Object-Bug in LandingPage
3. AVIF/WEBP-Source-Rendering im Prerender (möglicherweise vue-head + vite-imagetools Interop)

Nach diesen Fixes erwarte ich einen Score-Sprung auf **82–85 / 100**.
