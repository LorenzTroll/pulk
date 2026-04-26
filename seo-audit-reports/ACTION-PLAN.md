# SEO Action Plan – pulk.space

**Stand:** 2026-04-23 (Status aktualisiert nach Umsetzung)
**Score vorher:** 65 / 100 → **nach Umsetzung aller abgehakten Fixes erwartbar:** 88–92 / 100

Priorität: **Critical** > **High** > **Medium** > **Low**

**Legende:** ✅ erledigt · ⏳ offen · ⚪ nicht im Code (Server/Messung post-Deploy)

---

## 🔴 CRITICAL (sofort, blockiert Rankings)

### ✅ C1. Canonical für `/preise` setzen
**Impact:** Google dedupliziert die Preise-Seite zur Homepage. Sie kann nicht für "Preise PULK", "Workshopraum mieten Preise", "Pakete Halle" o.ä. ranken.

**Fix:** `src/views/PricingPage.vue`, `useHead` erweitern.

```js
useHead({
  title: 'Preise & Pakete · PULK Raum Halle (Saale)',
  link: [
    { rel: 'canonical', href: 'https://pulk.space/preise/' }
  ],
  meta: [ /* ... */ ]
})
```

**Verifikation:** `grep canonical src/views/PricingPage.vue` → trailing-slash gesetzt.

---

### ✅ C2. Broken Preload-Hint in LandingPage fixen
**Impact:** `<link rel="preload" as="image" href="[object Object]">` → 404-Fetch im Browser, kaputte LCP-Optimierung, Konsolen-Warnung.

**Fix:** `src/views/LandingPage.vue:89`

```diff
  link: [
    { rel: 'canonical', href: 'https://pulk.space/' },
-   { rel: 'preload', as: 'image', href: staticGalleryImg, fetchpriority: 'high' }
+   { rel: 'preload', as: 'image', href: staticGalleryImg.img.src, fetchpriority: 'high' }
  ]
```

**Verifikation:** `grep preload dist/index.html` liefert `.jpeg`-URL, keine `[object Object]`.

---

### ✅ C3. AVIF/WEBP-Picture-Sources reparieren
**Impact:** Built 45 AVIF + 45 WEBP, serviert aber nur JPEG/PNG. LCP verliert dadurch schätzungsweise 1–2 Sekunden auf 4G.

**Fix:** Prerender + Template beide sauber — jetzt liefern `<source>`-Tags AVIF- und WEBP-`srcset`-Werte korrekt im prerendered HTML.

**Verifikation:** `grep "<source" dist/index.html` → AVIF, WEBP und JPEG sources mit `srcset=` und `type=`.

---

## 🟠 HIGH (innerhalb 1 Woche)

### ✅ H1. Sitemap auf Trailing-Slash-URLs umstellen
`public/sitemap.xml` + alle Canonicals in `useHead` konsistent auf trailing slash.

```xml
<loc>https://pulk.space/about/</loc>
<loc>https://pulk.space/preise/</loc>
<loc>https://pulk.space/anfragen/</loc>
<loc>https://pulk.space/impressum/</loc>
<loc>https://pulk.space/datenschutz/</loc>
```

**Verifikation:** sitemap + Canonicals identisch, kein 301-Hop mehr nötig.

---

### ✅ H2. FAQPage-Schema aus Legal-Pages entfernen
**Verifikation:** `grep FAQPage dist/impressum/index.html dist/datenschutz/index.html` → 0 Treffer.

---

### ✅ H3. Doppelten FAQPage-Block auf `/preise` entfernen
**Verifikation:** `grep -c FAQPage dist/preise/index.html` → genau 1.

---

### ✅ H4. Modulepreload für Modal-Bundles reduzieren
Calendar (135 KB), GL (55 KB) und Modal-Bundles werden nicht mehr preloaded — nur Core-Chunks.

---

### ✅ H5. Doppelter 301 auf `/miete` zusammenziehen
`public/.htaccess` → `RewriteRule ^miete/?$ /anfragen/ [L,R=301]` (ein Hop).

---

## 🟡 MEDIUM (innerhalb 1 Monat)

### ⏳ M1. Content-Tiefe auf `/about` und `/anfragen` ausbauen
- `/about`: 302 Wörter → 500+. Ergänzen: Raum-Story, Gründungs-Motivation, Location/Kröllwitz-Kontext, Nachhaltigkeit, Material-Philosophie.
- `/anfragen`: 142 Wörter → 300+. Ergänzen: Ablauf-Beschreibung, Fragen die wir meistens hören, Beispiel-Timeline.

**Warum:** thin content rankt schlechter, LLM-Zitate brauchen mehr Kontext.
**Status:** nachzuholen.

---

### ✅ M2. Alt-Texte beschreibend machen
32 Alt-Texte überarbeitet, in `LandingPage`, `AboutPage` + `AboutModal`, `PricingPage` + `PricingModal`, `ContactPage` + `ContactModal`, `SiteFooter`.

**Warum:** Image-Search + Accessibility + AI-Zitate.

---

### ⏳ M3. H1 auf `/preise` und `/anfragen` SEO-stärker
- `/preise`: "Preise und Pakete" → "Preise für den Workshopraum PULK in Halle (Saale)"
- `/anfragen`: "Planst du was?" → "Workshopraum anfragen – PULK in Halle (Saale)" (H1), kreative Überschrift bleibt als sub-H2

**Status:** nachzuholen.

---

### ✅ M4. BreadcrumbList auf `/preise` ergänzen
JSON-LD in `PricingPage.vue` ergänzt, Verifikation in `dist/preise/index.html`.

---

### ✅ M5. Inline-Content-Links zwischen Seiten
Neues Component `src/components/InlineLink.vue` (unterstrichener Text + Arrow-SVG).
- Homepage-FAQ "Wie läuft eine Anfrage ab?" → Link zu `/preise` (Begriff „Preisen") + `/anfragen` (Begriff „Kontaktformular")
- About → Link zu `/preise` (Begriff „Preise & Pakete")
- Preise-FAQ → Link zu `/anfragen`

---

### ✅ M6. Large PNGs in JPEG/WEBP konvertieren
`?format=avif;webp;jpg` auf Foto-Assets. PNG-Fallback bleibt nur bei echten Transparenz-Assets (Pricing-Chair-Cutouts) bestehen.

**Savings:** pulk_pricing-imageA 469→196 KB, hero-chair-mixed-row 451→204 KB, pulk_contact-imageA 852→64 KB, pulk_pricing-imageB 108→41 KB.

---

## 🟢 LOW (Backlog / Nice-to-have)

### ⚪ L1. Brotli-Compression aktivieren
`.htaccess` ist bereits konfiguriert. Wirkung erst nach Deploy messbar — Response-Header-Check nötig, ob Hetzner `mod_brotli` liefert. Falls nicht: Hetzner-Support-Ticket für Modul-Aktivierung.

---

### ✅ L2. `hasMap` im LocalBusiness
```json
"hasMap": "https://share.google/1aPrxNg6crO4XKHIb"
```
In `index.html` LocalBusiness-Schema ergänzt.

---

### ✅ L3. Datum-Meta für LLM-Zitate
`datePublished` + `dateModified` (2026-04-23) auf AboutPage und ContactPage. PricingPage-Schema ist `Product`, dort passen die Felder nicht — bewusst ausgelassen.

---

### ⚪ L4. Lighthouse-Audit nach Fixes
Nach Deploy: in Chrome DevTools + PageSpeed Insights LCP/INP/CLS messen. Baseline-Vergleich nach 2 Wochen.

---

### ✅ L5. Strukturierte Kundenstimmen
Homepage-Kundenstimme „Die Linke Halle (Saale)" als `Review`-Schema in LocalBusiness-JSON-LD ergänzt.

---

## Extra umgesetzt (außerhalb des ursprünglichen Plans)

- **Safari Safe-Area Fix:** `viewport-fit=cover` in `index.html` ergänzt → weißer Balken unten in Safari iOS verschwindet
- **Modal-Lücke auf Mobile/Tablet:** Modal-Overlay schließt jetzt vollständig nach oben bündig ab (vorher 0.7rem Versatz → LandingPage war sichtbar)
- **PNG-Transparenz in Pricing:** PricingPage/PricingModal-Bilder wieder als PNG-Fallback (nach JPEG-Konvertierung waren transparente Chair-Cutouts auf schwarzem Grund)

---

## Reihenfolge zur Umsetzung

1. ~~**Jetzt:** C1, C2, H1~~ → ✅ deployed
2. ~~**Diese Woche:** C3, H2, H3, H4, H5~~ → ✅ deployed
3. ~~**Innerhalb 2 Wochen:** M2, M4, M5, M6~~ → ✅ deployed
4. **Offene Medium-Tasks:** M1 (Content-Tiefe), M3 (H1-Optimierung) — nachgeholt in nächster Iteration
5. **Low:** L2, L3, L5 → ✅ deployed. L1 + L4 server-/messungsseitig post-Deploy.

## Nach Deploy (manuell)

- GSC: Re-Indexierung beantragen für `/`, `/preise/`, `/about/`, `/anfragen/`
- In 2–4 Wochen: Audit erneut laufen lassen (Score-Tracking)
- CrUX-Felddaten checken (28-Tage-Rolling) für LCP/INP/CLS
- Brotli-Check via `curl -I -H "Accept-Encoding: br" https://pulk.space/` → `Content-Encoding: br` erwartet

## Nächster Schritt
Siehe `ROADMAP-100.md` für die Strategie, wie der aktuelle Score weiter Richtung 100 gebracht wird.
