# Prüfung & Grenzen des Dossiers

Ergänzung zu `STANDARDS-DOSSIER.md`. Enthält bewusst die *unbequemen* Teile:
den Abgleich der Standards gegen den echten Code, die nicht ableitbaren Domänen
und die Trennung „aus dem Code" vs. „gute Praxis".

---

## 1. Self-Check — Stellen, die den eigenen Standards widersprechen

Aufgabe war: mindestens 3 Widersprüche finden — „wenn du keine findest, hast du zu ungenau gelesen".
Es sind **5**. Jeder mit exaktem Beleg.

**W-1 — rem/fluid-Anspruch (S-17, auch CLAUDE.md „kein einziger px-Wert") ↔ echte px-Werte**
- `src/components/SeoClose.vue:30` `height: 3px;` und `:32` `border-radius: 2px;` (echte Property-Werte, keine Border/Media-Ausnahme)
- `src/App.vue:342` `style="height:1px"`
- `src/components/SiteFooter.vue:493/506/530` Breakpoints in `px` (`@media (min-width: 1025px)` …), während andere Dateien `@media (max-width: 40rem)` nutzen.
→ Der Standard gilt real nur für Typografie/Abstände; Breakpoints und Kleinst-Maße mischen Einheiten. Im Dossier ist das bei S-17 als Caveat vermerkt — hier der harte Beleg.

**W-2 — Lazy-Routen (S-24) ↔ statische View-Imports**
- `src/main.js`: `AboutPage`/`PricingPage`/`ContactPage` werden **oben statisch importiert** UND in den Routen als `() => import('@/views/…')` referenziert (3 Lazy-Routen, 7 statische View-Imports gezählt).
→ Die statischen Imports ziehen die Views ins Initial-Bundle und heben das Splitting auf. Klarer Widerspruch zur eigenen Regel — vermutlich Migrations-Rückstand.

**W-3 — Ein Store-Stil (S-10) ↔ gemischte Formen**
- `src/stores/pricing.js:5` `defineStore('pricing', () => { … })` (Setup-Form)
- `src/stores/overlay.js:4` und `src/stores/calendar.js:3` `defineStore('…', { state, getters, actions })` (Options-Form)
→ Zwei Definitionsformen für dasselbe Konzept. Der Standard ist als „belegt, aber im Referenzcode NICHT konsequent" markiert — hier die Fundstellen.

**W-4 — Faktensynchronität (S-43/S-39) ↔ veraltete GEO-Faktenquelle**
- `public/llms.txt` „ab **25** €/Std. (Community)" ↔ `src/stores/pricing.js:51` `price: 20`.
→ Die LLM-Beschreibungsdatei liefert einen Preis, den die Anwendung längst geändert hat. Genau der Sync-Bruch, den S-43 verbietet.

**W-5 — Indexierungs-Hygiene (S-40) ↔ ins Leere greifender robots-Block**
- `public/robots.txt:7-9` `Disallow: /*?modal=about|preise|anfragen` (Query-Param-Form)
- `src/main.js:42/49/56` echte Modal-Routen sind Pfad-Form `/modal/preise|anfragen|about`.
→ Der `Disallow` trifft die realen Modal-URLs nicht; abgedeckt sind sie nur über `meta.robots:'noindex'` (S-25). Der robots-Eintrag ist vestigial und suggeriert Schutz, den er nicht leistet.

> Dass sich fünf saubere Widersprüche zeigen ließen, ist der beabsichtigte Beleg dafür, dass der Code gelesen und nicht geglättet wurde.

### Gelebte Schwächen (Befund, KEIN Standard — nicht mitkopieren)
- **`console.log` im Produktionscode** (28× im `src`, u. a. `composables/lazyGsap.js`, `composables/useRevealUp.js`).
- **Doppelte/ungenutzte Abhängigkeiten:** zwei Scroll-Bibliotheken (`lenis` + `@studio-freight/lenis`) plus `locomotive-scroll`; zwei Head-Bibliotheken (`@unhead/vue` + `@vueuse/head`); ein Styling-Framework konfiguriert + global eingebunden, aber in Templates ungenutzt (S-18-Gegenbeispiel).
- **Monolithische Views:** `views/LandingPage.vue` 2267 Zeilen (Logik+Markup+Style in einer Datei) — beschreibbar, aber nicht als Ziel übertragbar.

---

## 2. Nicht ableitbare Domänen (Leerstellen)

Aus dem Auftrag angefragte Domänen, für die es **keine gelebte Regel** gibt. Hier wurde bewusst **kein Standard erfunden**:

| Domäne | Befund im Referenzcode |
|---|---|
| Testing | 0 Testdateien, kein Test-Runner, kein `test`-Script |
| Statische Typisierung | kein TypeScript/`tsconfig`; nur Runtime-Prop-Typen (in S-05 enthalten) |
| Linting / Formatting | keine ESLint-/Prettier-Konfiguration, kein Gate |
| Env-/Secrets-Config | kein `.env`-Layer, keine Config-Validierung |
| i18n | einsprachig, keine Übersetzungs-Infrastruktur |
| CI/CD-Checks | keine Pipeline-Konfiguration im Repo |
| Globales Fehler-/Loading-/Empty-UI | kein übergreifendes Muster (nur lokales `catch`, S-11) |

→ Für ein **neues** Projekt sind das die ersten sinnvollen Ergänzungen — aber sie kämen dann aus der Zielsetzung, nicht aus diesem Referenzcode. Deshalb stehen sie hier und nicht im Dossier.

---

## 3. Bewusst ausgelassen: gute Praxis ≠ gelebter Code

Der Auftrag verlangt die saubere Trennung: **Alle S-01…S-44 sind aus dem Code belegt** (jeweils mit Datei-Nachweis). Folgendes hätte ich aus Erfahrung fast als Standard formuliert — es steht aber **nicht** im Referenzcode und gehört daher **nicht** ins Dossier:

- Automatisierte Tests / TDD / Testpyramide.
- Statische Typen an Modul- und Funktionsgrenzen (nicht nur an Props).
- Lint-/Format-Gate (pre-commit oder CI).
- Zentrales Muster für Fehler-, Leer- und Ladezustände in der UI.
- Environment-Layer mit Config-Validierung.
- Design-Tokens als *einzige* Quelle für Farben/Abstände/Radien (hier existieren zwar Theme-Farben in der Framework-Config, werden aber nicht als gelebtes Token-System genutzt).

Jede dieser Zeilen ist eine **Empfehlung**, keine Ableitung — deshalb hier.

---

## 4. Herkunft, sauber getrennt

- **`STANDARDS-DOSSIER.md`** — 44 belegte Standards (`S-01…S-44`) + 4 unsichere Kandidaten (`U-1…U-4`). Ausnahmslos aus dem Code abgeleitet, jeweils mit Datei-Beleg. Nichts davon ist „von mir für gut befunden".
- **Diese Datei** — der repo-spezifische Teil: Widersprüche im Referenzcode, Leerstellen, und die ausgelassene gute Praxis.

Beim Übertragen auf ein anderes Projekt gilt: die **Prinzip**-Zeilen sind stack-neutral direkt anwendbar; die **Umsetzung-hier**-Zeilen sind nur Belege dieses Referenzprojekts und werden durch die Fundstellen des Zielprojekts ersetzt.
