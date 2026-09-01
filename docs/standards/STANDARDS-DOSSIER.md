# Standards-Dossier

Abgeleitet aus dem Referenzprojekt **pulk-webseite** (Vue 3 / Vite / Pinia, reines JS, statisch prerendert).
Zweck: übertragbare Konventionen für andere Projekte.

## Lesart
- Jeder Standard hat ein **Prinzip** (stack-unabhängig, ohne Bibliotheks-/Ordnernamen — auf jeden Stack anwendbar) und eine **Umsetzung hier** (konkreter Beleg im Referenzcode).
- Aufgenommen sind **nur Regeln, die an ≥2 Stellen im Code belegt sind**. Einzelfälle stehen separat unter *Unsichere Kandidaten* und sind als solche markiert.
- Alle Standards sind **aus dem Code abgeleitet**, keiner ist „gute Praxis, die ich für sinnvoll halte" — was ich bewusst weggelassen habe, steht in `PRUEFUNG-UND-GRENZEN.md`.
- Anfordern später per **Abrufwort** (die kurze Phrase am Ende jedes Standards).

## Abrufwort-Index
| # | Kurzname | Abrufwort |
|---|---|---|
| S-01 | Schichtarchitektur | `schichtarchitektur` |
| S-02 | Feature als vertikaler Slice | `vertikaler-slice` |
| S-03 | Einheitliche Komponenten-Autorenform | `eine-komponentenform` |
| S-04 | Seiten vs. Bausteine | `seiten-vs-bausteine` |
| S-05 | Deklarierte, typisierte Eingaben | `deklarierte-eingaben` |
| S-06 | Aufwärtskommunikation über Events | `events-nach-oben` |
| S-07 | Inhalt über Slots | `inhalt-per-slot` |
| S-08 | Overlays teleportieren | `overlay-teleport` |
| S-09 | Geteilter State zentral | `state-schnitt` |
| S-10 | Ein Store-Stil | `ein-store-stil` |
| S-11 | Fehler abfangen statt werfen | `fehler-nicht-werfen` |
| S-12 | Externe Zugriffe absichern | `feature-detection` |
| S-13 | Konsistente Namen | `namensschema` |
| S-14 | Präfixierte Style-Klassen | `klassen-praefix` |
| S-15 | Event-Taxonomie | `event-taxonomie` |
| S-16 | Gekapselte Styles | `gekapselte-styles` |
| S-17 | Fluid + relative Einheiten | `fluid-relativ` |
| S-18 | Ein Styling-Paradigma | `ein-styling-paradigma` |
| S-19 | Logik als lifecycle-bewusste Einheit | `logikeinheit` |
| S-20 | Schweres als lazy Singleton | `lazy-singleton` |
| S-21 | Escape-Hatch außerhalb Komponenten | `escape-hatch` |
| S-22 | Jede Nebenwirkung räumt auf | `teardown-pflicht` |
| S-23 | Zentrale Routing-Definition | `routing-zentral` |
| S-24 | Nicht-kritische Routen lazy | `routen-lazy` |
| S-25 | UI-State als eigene Route | `ui-state-route` |
| S-26 | Cleanup in Navigations-Guards | `guard-cleanup` |
| S-27 | Schweres aufschieben | `schweres-aufschieben` |
| S-28 | Bundle-Splitting + Preload-Steuerung | `bundle-splitting` |
| S-29 | Bilder mit reservierten Dimensionen | `bild-pipeline-cls` |
| S-30 | Bewegungs-/Scroll-Rücksicht | `motion-scroll-ruecksicht` |
| S-31 | Kritisches CSS zuerst | `critical-css` |
| S-32 | Dekoratives aus dem A11y-Baum | `deko-aus-a11y` |
| S-33 | Sichtbarer Tastaturfokus | `fokus-sichtbar` |
| S-34 | SR-Zusatzinhalt real im DOM | `sr-zusatzinhalt` |
| S-35 | Aufklappzustände ansagen | `aria-expanded` |
| S-36 | Pro Route vorgerendertes HTML | `prerender-pflicht` |
| S-37 | Vollständiger seitenindividueller Head | `head-pro-seite` |
| S-38 | Mehrschichtige Structured Data | `structured-data-schichten` |
| S-39 | Schema spiegelt sichtbaren Inhalt | `schema-spiegelt-sichtbar` |
| S-40 | Indexierungs-Hygiene | `index-hygiene` |
| S-41 | Maschinen-Crawler zulassen | `ai-crawler-erlauben` |
| S-42 | LLM-Beschreibungsdatei | `llms-datei` |
| S-43 | Kernfakten maschinenlesbar | `fakten-maschinenlesbar` |
| S-44 | Einheitliche Build-Grundlage | `build-grundlage` |

---

## Architektur & Dateien

### S-01 Schichtarchitektur
**Prinzip:** Ordne Code nach technischer Rolle (Seiten, wiederverwendbare Bausteine, geteilte Logik, geteilter Zustand, reine Helfer, statische Ressourcen) in getrennte, flache Bereiche.
**Problem, das es löst:** Ohne feste Schichten landet Logik unvorhersehbar in Views oder Helfern; niemand weiß, wo eine Sache „hingehört", und Wiederverwendung wird zufällig.
**Umsetzung hier:** `src/{views,components,composables,stores,utils,assets}` — jede Schicht mit ≥2 Dateien, keine feature-/router-Ordner.
**Anti-Pattern:** Feature-Ordner, die Präsentation, State und Helfer vermischen; ein `misc/`-Sammelbecken.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** das Projekt so groß ist, dass Domänen-/Feature-Grenzen die technischen Schichten dominieren müssen (dann Schichten *innerhalb* der Features).
**Abrufwort:** `schichtarchitektur`

### S-02 Feature als vertikaler Slice
**Prinzip:** Ein fachliches Feature ist kein Ordner, sondern ein benanntes Bündel korrespondierender Dateien über die Schichten hinweg — verbunden durch ein gemeinsames Namenspräfix.
**Problem, das es löst:** Man findet alle Teile eines Features über den Namen, ohne die Schichttrennung aufzugeben.
**Umsetzung hier:** Pricing = `views/PricingPage.vue` + `components/PricingModal.vue` + `stores/pricing.js`; Contact = `views/ContactPage.vue` + `components/ContactModal.vue` + `stores/overlay.js` (contactForm).
**Anti-Pattern:** Feature-Bestandteile ohne erkennbaren Namensbezug über den Baum verstreuen.
**Übertragbarkeit:** immer (in Kombination mit S-01, S-13).
**Nicht übertragen wenn:** —
**Abrufwort:** `vertikaler-slice`

## Komponenten & API

### S-03 Einheitliche Komponenten-Autorenform
**Prinzip:** Alle Komponenten werden in **einer** Autorenform geschrieben — keine zwei parallelen Stilrichtungen für dasselbe.
**Problem, das es löst:** Gemischte Stile erhöhen die kognitive Last, erschweren Copy-Paste zwischen Komponenten und Reviews.
**Umsetzung hier:** 20/20 `.vue` nutzen `<script setup>`; kein `export default {}`.
**Anti-Pattern:** Options-API und `<script setup>` gemischt „nach Tagesform".
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** eine Legacy-Migration bewusst zweigleisig läuft (dann Zeitplan, kein Dauerzustand).
**Abrufwort:** `eine-komponentenform`

### S-04 Seiten vs. Bausteine
**Prinzip:** Trenne Route-Ziele (Seiten) klar von wiederverwendbaren/atomaren Bausteinen — physisch und namentlich.
**Problem, das es löst:** Ohne Trennung wird jede Komponente potenziell zur Seite und umgekehrt; Wiederverwendbarkeit verwässert.
**Umsetzung hier:** Route-Ziele in `src/views/` (LandingPage, PricingPage …), wiederverwendbar in `src/components/` (Modal, Pic, ArrowIcon, SiteFooter).
**Anti-Pattern:** Seiten als „Komponenten" mitten unter atomaren Bausteinen ablegen.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `seiten-vs-bausteine`

### S-05 Deklarierte, typisierte Eingaben
**Prinzip:** Jede Komponenten-Eingabe wird explizit deklariert — mit Typ und mit `required` oder sinnvollem Default; Eingaben werden nie im Kind mutiert.
**Problem, das es löst:** Undeklarierte/implizite Eingaben brechen still; mutierte Eingaben erzeugen unnachvollziehbaren Datenfluss.
**Umsetzung hier:** `components/Modal.vue` (`visible: {type:Boolean, required:true}`, `ariaLabel: {type:String, default:'Dialog'}`), `Pic.vue` (`image` required), `InlineLink.vue` (`to` required).
**Anti-Pattern:** untypisierte Props ohne Default/Required; direktes Schreiben in eine Prop.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `deklarierte-eingaben`

### S-06 Aufwärtskommunikation über Events
**Prinzip:** Kinder melden Ereignisse über explizit deklarierte, semantisch benannte Events nach oben — nicht über Callback-Props oder Elternzustands-Mutation.
**Problem, das es löst:** Explizite Events machen die Komponentenschnittstelle lesbar und testbar; sie entkoppeln Kind und Elternlogik.
**Umsetzung hier:** `Modal.vue`, `AboutModal.vue`, `ContactModal.vue`, `PricingModal.vue` — jeweils `defineEmits(['close'])`, Auslösen statt Zustands­eingriff.
**Anti-Pattern:** Funktions-Props als versteckte Callbacks; das Kind schreibt in geteilten Zustand, um „nach oben" zu wirken.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `events-nach-oben`

### S-07 Inhalt über Slots
**Prinzip:** Wiederverwendbare Hüllen liefern Struktur, Verhalten und Barrierefreiheit; den *Inhalt* reicht der Aufrufer per Einschub hinein.
**Problem, das es löst:** Ohne Inhaltseinschub wird jede Variante zu einer eigenen Komponente oder zu Props-Wildwuchs.
**Umsetzung hier:** `Modal.vue` (`<slot/>` im Dialog-Rahmen), `InlineLink.vue` (`<slot/>` als Linktext).
**Anti-Pattern:** Inhalt über String-Props hineinreichen statt über einen Einschub.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** die Hülle bewusst eine feste, nicht variierbare Darstellung ist.
**Abrufwort:** `inhalt-per-slot`

### S-08 Overlays teleportieren
**Prinzip:** Elemente, die visuell über allem liegen (Dialoge, Menüs), werden aus ihrem DOM-Kontext an den Dokument-Wurzelbereich verlagert.
**Problem, das es löst:** `overflow`, `transform` oder `z-index` von Vorfahren zerschießen sonst Positionierung und Stapelreihenfolge von Overlays.
**Umsetzung hier:** `Modal.vue` (`<Teleport to="body">`), `LandingPage.vue` (BottomMenu in `<Teleport to="body">`).
**Anti-Pattern:** Modal tief verschachtelt lassen und mit hohen `z-index`-Werten gegen Stacking-Contexts ankämpfen.
**Übertragbarkeit:** immer, sobald es echte Overlays gibt.
**Nicht übertragen wenn:** das Overlay bewusst im Fluss des Elternelements bleiben soll.
**Abrufwort:** `overlay-teleport`

## State, Daten, Fehler

### S-09 Geteilter State zentral
**Prinzip:** Nur wirklich komponentenübergreifender Zustand lebt im zentralen Store; alles andere bleibt lokal in der Komponente.
**Problem, das es löst:** Globalisierter Lokalzustand macht Komponenten unlesbar und Zustandsänderungen unauffindbar.
**Umsetzung hier:** `stores/{overlay,calendar,pricing}.js` für Geteiltes; lokale `ref()` in `Modal.vue` (`dialogRef`), `PricingPage.vue` (Rechner-State).
**Anti-Pattern:** jeden UI-Flag in den globalen Store schieben.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `state-schnitt`

### S-10 Ein Store-Stil
**Prinzip:** Wähle **eine** Definitionsform für State-Container und halte sie projektweit durch.
**Problem, das es löst:** Zwei Stile für dieselbe Sache zwingen jeden Leser, beide zu kennen, und verhindern Muster-Übertragung zwischen Stores.
**Umsetzung hier:** Mehrheit Options-Form (`stores/overlay.js`, `stores/calendar.js`: `state/getters/actions`). ⚠️ **Im Referenzcode NICHT konsequent** — `stores/pricing.js` nutzt die Setup-Form (siehe Self-Check in `PRUEFUNG-UND-GRENZEN.md`).
**Anti-Pattern:** Store-Stil pro Datei frei wählen.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `ein-store-stil`

### S-11 Fehler abfangen statt werfen
**Prinzip:** Erwartbare Laufzeitfehler (I/O, fehlende Globals, Fremd-APIs) werden lokal abgefangen, geloggt und in einen definierten Fallback-/Fehlerzustand überführt — die Anwendung wirft nicht durch.
**Problem, das es löst:** Ein unbehandelter Fehler in einem Nebenpfad (Analytics, Scroll-Lib, optionale Daten) darf nie die Seite zerstören.
**Umsetzung hier:** `composables/useLenis.js` (`try/catch`+`console.warn` in `destroyLenis`), `utils/tracking.js` (`sendEvent`), `stores/calendar.js` (`catch → this.error`), `main.js` (`afterEach`).
**Anti-Pattern:** ungefangene `await`/`throw` in optionalen Nebenpfaden; leerer `catch {}` ohne Log/Fallback.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** ein Fehler *soll* hart abbrechen (dann bewusst und zentral behandelt).
**Abrufwort:** `fehler-nicht-werfen`

### S-12 Externe Zugriffe absichern
**Prinzip:** Zugriffe auf Umgebungs- oder Fremd-Globals werden durch Existenz-/Fähigkeitsprüfung geschützt und degradieren still, wenn nicht vorhanden.
**Problem, das es löst:** Serverseitiges Rendern, Ad-Blocker oder noch nicht geladene Skripte lassen Globals fehlen — direkter Zugriff crasht sonst.
**Umsetzung hier:** `utils/tracking.js` (`typeof window === 'undefined'` + `window.MDAL`-Check), `composables/useLenis.js` (`window`/`matchMedia?`-Guards), `main.js` (`window.MDAL`-Check vor Aufruf).
**Anti-Pattern:** `window.X.method()` ohne Guard; Annahme, ein injiziertes Skript sei immer da.
**Übertragbarkeit:** immer, sobald serverseitiges Rendern **oder** Fremd-Skripte im Spiel sind.
**Nicht übertragen wenn:** reine Client-App ohne SSR und ohne Fremd-Globals.
**Abrufwort:** `feature-detection`

## Naming

### S-13 Konsistente Namen
**Prinzip:** Feste Namensschemata je Artefakt-Art (Komponente, Modul, wiederverwendbare Logik, State-Container) — mechanisch vorhersagbar.
**Problem, das es löst:** Uneinheitliche Namen kosten bei jeder Suche und jedem Import Nachdenken.
**Umsetzung hier:** Komponenten/Views `PascalCase.vue`; JS-Module `camelCase.js`; wiederverwendbare Logik `useX`; State-Container `useXStore`.
**Anti-Pattern:** dieselbe Art mal so, mal so benennen.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** die Sprach-/Framework-Konvention andere Schemata vorgibt (dann deren Konvention).
**Abrufwort:** `namensschema`

### S-14 Präfixierte Style-Klassen
**Prinzip:** Style-Klassennamen sind semantisch, an ihre Komponente/Domäne präfixiert und folgen einem Element-/Modifier-Schema.
**Problem, das es löst:** Kollisionen und „Was gehört wozu?" bei geteiltem CSS; erleichtert das Finden der zuständigen Datei.
**Umsetzung hier:** `pm-…--b` (Pricing), `inline-link__text/__arrow` (InlineLink), `acc-icon-bar--v` (Accordion) — BEM-Stil mit Präfix.
**Anti-Pattern:** generische Namen (`.title`, `.box`) ohne Präfix; präsentationsbezogene Namen (`.red-big`).
**Übertragbarkeit:** immer, wenn mit klassenbasiertem CSS gearbeitet wird.
**Nicht übertragen wenn:** ein Utility-First- oder CSS-in-JS-Ansatz gewählt ist (dann dessen Regeln, siehe S-18).
**Abrufwort:** `klassen-praefix`

### S-15 Event-Taxonomie
**Prinzip:** Analytics-/Domänen-Ereignisse folgen einer dokumentierten, hierarchischen Namens-Taxonomie `<marke>.<bereich>.<aktion>`.
**Problem, das es löst:** Ad-hoc-Eventnamen werden im Analytics-Tool unauswertbar; niemand weiß, welche Namen erlaubt sind.
**Umsetzung hier:** `utils/tracking.js` (JSDoc-Kopf definiert `pulk.<bereich>.<action>`; Aufrufe `pulk.faq.open`, `pulk.pricing.open`, `pulk.scroll.depth`).
**Anti-Pattern:** freie Eventnamen an der Aufrufstelle erfinden.
**Übertragbarkeit:** immer, sobald Event-Tracking existiert.
**Nicht übertragen wenn:** kein Tracking.
**Abrufwort:** `event-taxonomie`

## Styling

### S-16 Gekapselte Styles
**Prinzip:** Styles gehören zur Komponente und wirken nur in ihr; global sind nur Tokens/Resets am Wurzelknoten.
**Problem, das es löst:** Globales CSS erzeugt Fernwirkungen und Regressions-Angst bei jeder Änderung.
**Umsetzung hier:** 18/19 SFCs mit `<style scoped>`; ausschließlich `App.vue` (Wurzel) trägt unscoped-Global-CSS neben `assets/styles/main.css`.
**Anti-Pattern:** komponentenspezifische Regeln ins globale Stylesheet schreiben.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `gekapselte-styles`

### S-17 Fluid + relative Einheiten
**Prinzip:** Schriftgrößen skalieren fluid (Viewport-gebunden mit Ober-/Untergrenze); Abstände/Größen in relativen Einheiten.
**Problem, das es löst:** Feste Pixelwerte skalieren nicht mit Nutzer-Zoom/Schriftgröße und erzeugen Sprung-Layouts zwischen Breakpoints.
**Umsetzung hier:** `clamp()` für Typo (`review-quote-text`, `pm-card-title`, `intro-body`), `rem`/`em` für Abstände (`InlineLink.vue`). ⚠️ **Nur für Typo/Abstände konsequent** — Media-Query-Breakpoints und `1px`-Borders mischen Einheiten (Self-Check).
**Anti-Pattern:** feste `px` für Schriftgrößen und Abstände.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** pixelgenaue Reproduktion (z. B. E-Mail-HTML) gefordert ist.
**Abrufwort:** `fluid-relativ`

### S-18 Ein Styling-Paradigma
**Prinzip:** Entscheide dich für **ein** Styling-Paradigma und ziehe es durch; kein zweites, ungenutztes Framework mitschleppen.
**Problem, das es löst:** Ein installiertes, aber ungenutztes Styling-Framework verwirrt, bläht Konfig/Bundle und suggeriert eine Konvention, die nicht gilt.
**Umsetzung hier:** Gelebt wird gekapseltes, klassenbasiertes CSS (S-14/S-16). ⚠️ **Gegenbeispiel im Repo:** ein Utility-Framework ist konfiguriert und global eingebunden, aber in 20 Templates praktisch ungenutzt — genau das, was dieser Standard vermeiden will (Self-Check).
**Anti-Pattern:** zwei Styling-Systeme „für alle Fälle" parallel halten.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** eine echte, geplante Migration von einem Paradigma zum anderen läuft (befristet).
**Abrufwort:** `ein-styling-paradigma`

## Wiederverwendbare Logik

### S-19 Logik als lifecycle-bewusste Einheit
**Prinzip:** Wiederverwendbare, zustands-/lebenszyklusbehaftete Logik wird in benannte Einheiten gekapselt, die sich an den Komponenten-Lebenszyklus hängen und eine schlanke Fassade zurückgeben.
**Problem, das es löst:** Verstreute Effekt-/Cleanup-Logik in Komponenten ist nicht wiederverwendbar und leakt bei Unmount.
**Umsetzung hier:** `composables/useLenis.js`, `composables/useRevealUp.js` — je `onMounted`/`onBeforeUnmount` + zurückgegebene API.
**Anti-Pattern:** dieselbe Setup-/Teardown-Logik in mehrere Komponenten kopieren.
**Übertragbarkeit:** immer, sobald Logik zwischen ≥2 Komponenten geteilt wird.
**Nicht übertragen wenn:** die Logik einmalig und komponentenlokal ist.
**Abrufwort:** `logikeinheit`

### S-20 Schweres als lazy Singleton
**Prinzip:** Schwere oder prozessweit einzigartige Ressourcen werden **einmal** erzeugt (Modul-Singleton) und **erst bei Bedarf** nachgeladen.
**Problem, das es löst:** Mehrfach-Instanzen (z. B. Scroll-Engines) kollidieren; sofortiges Laden schwerer Libs belastet den Initial-Start.
**Umsetzung hier:** `composables/lazyGsap.js` (`gsapInstance` modulglobal + dynamischer `import('gsap')`), `composables/useLenis.js` (`_lenisRef` modulglobal, einmalig instanziiert).
**Anti-Pattern:** pro Komponente eine eigene Instanz; schwere Lib statisch im Einstiegspunkt importieren.
**Übertragbarkeit:** immer für schwere/global-einzigartige Ressourcen.
**Nicht übertragen wenn:** die Ressource pro Verwendung isoliert sein *muss*.
**Abrufwort:** `lazy-singleton`

### S-21 Escape-Hatch außerhalb Komponenten
**Prinzip:** Wo geteilter Zustand auch außerhalb des Komponenten-Kontexts gebraucht wird, bietet die Logikeinheit zusätzlich freie Funktionen an — ohne den Zustand zu duplizieren.
**Problem, das es löst:** Router-Guards, Skripte oder Einstiegspunkte laufen außerhalb des Komponenten-Kontexts, brauchen aber Zugriff auf dieselbe Singleton-Instanz.
**Umsetzung hier:** `composables/useLenis.js` exportiert `getLenis()`/`destroyLenis()` (in `main.js`-Guard genutzt); `lazyGsap.js` exportiert `getGsap()`/`getGsapWithPlugins()`.
**Anti-Pattern:** in Nicht-Komponenten-Kontexten eine zweite Instanz erzeugen.
**Übertragbarkeit:** immer, wenn geteilter Zustand außerhalb von Komponenten gebraucht wird.
**Nicht übertragen wenn:** der Zustand rein komponentengebunden ist.
**Abrufwort:** `escape-hatch`

### S-22 Jede Nebenwirkung räumt auf
**Prinzip:** Jede registrierte Nebenwirkung (Listener, Timer, Observer, Animation) gibt eine Abräum-Funktion zurück oder wird gespeichert und beim Unmount aufgerufen.
**Problem, das es löst:** Verwaiste Listener/Observer leaken Speicher, feuern nach Unmount und erzeugen Geisterverhalten.
**Umsetzung hier:** `utils/tracking.js` (`attachScrollDepthTracker` gibt Detach-fn zurück), `views/PricingPage.vue` (`scrollCleanup`/`scrollDepthCleanup` → `onBeforeUnmount`), `composables/useRevealUp.js` (Trigger in `onBeforeUnmount` gekillt).
**Anti-Pattern:** `addEventListener`/`observe` ohne korrespondierendes Remove/Disconnect.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `teardown-pflicht`

## Routing

### S-23 Zentrale Routing-Definition
**Prinzip:** Die Routen-Landkarte wird an **einer** Stelle definiert, inklusive Lade-Strategie und Meta pro Route.
**Problem, das es löst:** Über den Code verteilte Routen-Fragmente machen die Navigationsstruktur unüberschaubar.
**Umsetzung hier:** `src/main.js` — Routen-Array mit Pfad, Name, Komponente, `props`, `meta`.
**Anti-Pattern:** Routen ad hoc in Komponenten registrieren.
**Übertragbarkeit:** immer bis mittlere Projektgröße.
**Nicht übertragen wenn:** das Projekt so groß ist, dass modulare Route-Manifeste (pro Feature) nötig werden.
**Abrufwort:** `routing-zentral`

### S-24 Nicht-kritische Routen lazy
**Prinzip:** Nur die Einstiegs-/Startroute wird eifrig geladen; alle weiteren Routen-Ziele werden bei Navigation nachgeladen.
**Problem, das es löst:** Alles im Initial-Bundle verlängert den Erststart, obwohl die meisten Routen nie besucht werden.
**Umsetzung hier:** `main.js` — `/preise`, `/anfragen`, `/about` via `() => import(...)`. ⚠️ **Widerspruch:** dieselben Views oben zusätzlich statisch importiert (Self-Check).
**Anti-Pattern:** alle Views statisch am Einstiegspunkt importieren.
**Übertragbarkeit:** immer ab >1–2 Routen.
**Nicht übertragen wenn:** winzige App, in der Splitting mehr Overhead als Nutzen bringt.
**Abrufwort:** `routen-lazy`

### S-25 UI-State als eigene Route
**Prinzip:** Verlinkbarer UI-Zustand (geöffnetes Overlay/Modal) bekommt eine eigene Route, wird von der Host-Ansicht gerendert und aus der Indexierung genommen.
**Problem, das es löst:** Teilbare/rücksprungfähige Overlays ohne eigene URL brechen bei Back-Button und Deep-Link; indexiert erzeugen sie Duplicate Content.
**Umsetzung hier:** `main.js` — `/modal/preise|anfragen|about` mit `component: LandingPage`, `props: { modal: … }`, `meta: { robots: 'noindex' }`.
**Anti-Pattern:** Modalzustand nur in einer Variable halten (kein Deep-Link, kein Back); oder Modal-URLs indexieren lassen.
**Übertragbarkeit:** nur bei Anforderung „Overlays müssen verlinkbar/rücksprungfähig sein".
**Nicht übertragen wenn:** Overlays rein flüchtig und nicht teilbar sind.
**Abrufwort:** `ui-state-route`

### S-26 Cleanup in Navigations-Guards
**Prinzip:** Querschnitts-Aufräumarbeiten beim Seitenwechsel (globale Effekte zurücksetzen, URL normalisieren, Seitenaufruf melden) laufen zentral in Navigations-Guards.
**Problem, das es löst:** Globale Effekte einer Route (Scroll-Engine, Body-Klassen, Overflow-Sperren) leaken sonst in die nächste Route.
**Umsetzung hier:** `main.js` `beforeEach` (Scroll-Engine zerstören, Trailing-Slash normalisieren, Sperr-Klassen/Attribute entfernen) + `afterEach` (Seitenaufruf, consent-gated).
**Anti-Pattern:** globale Nebenwirkungen pro Route setzen, aber nirgends zentral zurücknehmen.
**Übertragbarkeit:** immer, sobald Routen globale Effekte setzen.
**Nicht übertragen wenn:** Routen keinerlei globalen Zustand anfassen.
**Abrufwort:** `guard-cleanup`

## Performance

### S-27 Schweres aufschieben
**Prinzip:** Schwere Abhängigkeiten und selten genutzte Bereiche werden erst bei tatsächlichem Bedarf geladen, nie im Initial-Bundle.
**Problem, das es löst:** Jede schwere Lib im Start-Bundle verschlechtert Ladezeit und Interaktivität für alle — auch die, die sie nie brauchen.
**Umsetzung hier:** `lazyGsap.js` (Animations-Lib on demand); `main.js`-Kommentar dokumentiert bewusste Nicht-globale-Registrierung des Kalenders („würde 135 KB ziehen"); Lazy-Routen (S-24).
**Anti-Pattern:** eine schwere, nur punktuell genutzte Abhängigkeit global registrieren.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** die Abhängigkeit sofort auf der Startroute gebraucht wird.
**Abrufwort:** `schweres-aufschieben`

### S-28 Bundle-Splitting + Preload-Steuerung
**Prinzip:** Vendor-Code wird bewusst in Chunks geschnitten, und Preload-Hinweise für schwere, nicht sofort nötige Chunks werden aktiv unterdrückt.
**Problem, das es löst:** Ein Monolith-Vendor-Chunk cached schlecht; automatische Preloads schwerer Lazy-Chunks konkurrieren mit dem, was die aktuelle Seite wirklich braucht.
**Umsetzung hier:** `vite.config.js` (`manualChunks` je Lib-Gruppe + `modulePreload.resolveDependencies`-Filter); `scripts/prerender.mjs` strippt `modulepreload`-Links für Interaktions-/Fremdrouten-Chunks.
**Anti-Pattern:** Preload auf alles; ein einziger riesiger Vendor-Chunk.
**Übertragbarkeit:** ab mittlerer Bundle-Größe / mehreren schweren Vendors.
**Nicht übertragen wenn:** winzige App mit einem kleinen Bundle.
**Abrufwort:** `bundle-splitting`

### S-29 Bilder mit reservierten Dimensionen
**Prinzip:** Bilder laufen durch eine Build-Pipeline (moderne Formate, responsive Größen) und reservieren immer ihren Platz über gesetzte Dimensionen.
**Problem, das es löst:** Unoptimierte Bilder sind der größte Payload; ohne reservierte Maße springt das Layout beim Nachladen (Layout-Shift).
**Umsetzung hier:** `vite.config.js` (Bild-Pipeline als Default: avif/webp/jpg q75); `components/Pic.vue` setzt `width`/`height` aus den Bilddaten + `<picture>`-Quellen.
**Anti-Pattern:** Roh-`<img>` ohne Maße, ohne moderne Formate, ohne responsive Quellen.
**Übertragbarkeit:** immer, sobald es Rasterbilder gibt.
**Nicht übertragen wenn:** rein vektorbasierte UI ohne Fotos.
**Abrufwort:** `bild-pipeline-cls`

### S-30 Bewegungs-/Scroll-Rücksicht
**Prinzip:** Scroll-/Resize-Listener sind passiv, und Bewegungsintensität respektiert die Nutzer-Einstellung „reduzierte Bewegung".
**Problem, das es löst:** Nicht-passive Scroll-Listener blockieren das Scrolling (Jank); ignorierte Reduced-Motion-Präferenz ist ein Barriere-/Komfortproblem.
**Umsetzung hier:** `passive: true` in 9 Dateien (`tracking.js`, `PricingPage.vue`, `LandingPage.vue` …); `prefers-reduced-motion` beachtet in `useLenis.js`, `LandingPage.vue`, `Datenschutz.vue`.
**Anti-Pattern:** blockierende Scroll-Listener; Animationen ohne Reduced-Motion-Zweig.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `motion-scroll-ruecksicht`

### S-31 Kritisches CSS zuerst
**Prinzip:** Das für den sichtbaren Bereich nötige CSS wird inline ausgeliefert, der Rest verzögert nachgeladen — ohne Aufblitzen ungestylter Inhalte.
**Problem, das es löst:** Render-blockierendes Gesamt-CSS verzögert den ersten sichtbaren Inhalt.
**Umsetzung hier:** `scripts/prerender.mjs` (Critical-CSS-Extraktion + `preload:'swap'`; render-blockierende Lazy-Stylesheets werden aus dem `<head>` gestrippt).
**Anti-Pattern:** das komplette Stylesheet render-blockierend im `<head>`.
**Übertragbarkeit:** ab dem Punkt, an dem CSS-Größe die Ladezeit spürbar beeinflusst; setzt einen Prerender-/Server-Schritt voraus (S-36).
**Nicht übertragen wenn:** trivial kleines CSS.
**Abrufwort:** `critical-css`

## Accessibility

### S-32 Dekoratives aus dem A11y-Baum
**Prinzip:** Rein dekorative Grafik wird für assistive Technik unsichtbar gemacht (aus dem Accessibility-Baum genommen, nicht fokussierbar).
**Problem, das es löst:** Dekor-SVGs/Bilder erzeugen sonst Rauschen und leere Vorlese-Stopps für Screenreader.
**Umsetzung hier:** `InlineLink.vue` (`aria-hidden`+`focusable="false"` am Pfeil-SVG), Review-Quote-Marks (`aria-hidden`), `Pic.vue`/Hero-Bilder mit `alt=""`/`aria-hidden` durchgereicht.
**Anti-Pattern:** dekorative SVGs ohne `aria-hidden`; sinnleere `alt`-Texte („image123").
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `deko-aus-a11y`

### S-33 Sichtbarer Tastaturfokus
**Prinzip:** Interaktive Elemente zeigen einen deutlichen Fokusring speziell für Tastaturnutzung.
**Problem, das es löst:** Ohne sichtbaren Fokus ist die Seite per Tastatur nicht bedienbar; globales `outline:none` ist ein klassischer Barriere-Fehler.
**Umsetzung hier:** `:focus-visible`-Outlines in 4 Dateien (u. a. `InlineLink.vue`).
**Anti-Pattern:** `outline: none` ohne Ersatz; nur `:hover`-Styling, kein Fokus.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `fokus-sichtbar`

### S-34 SR-Zusatzinhalt real im DOM
**Prinzip:** Für Screenreader/Maschinen bestimmter Zusatzinhalt wird visuell versteckt, aber real im DOM gehalten — nicht per Anzeige-Entfernung (`display:none`).
**Problem, das es löst:** `display:none` entfernt den Inhalt für alle; sichtbar-verstecktes bleibt für assistive Technik und Crawler lesbar.
**Umsetzung hier:** `sr-only`-Muster in 4 Dateien (u. a. maschinenlesbare Preistabelle in `PricingPage.vue`).
**Anti-Pattern:** wichtige Alternativtexte per `display:none` „verstecken".
**Übertragbarkeit:** immer, wo alternative/maschinelle Repräsentationen nötig sind.
**Nicht übertragen wenn:** —
**Abrufwort:** `sr-zusatzinhalt`

### S-35 Aufklappzustände ansagen
**Prinzip:** Auf-/zuklappbare Steuerelemente geben ihren Zustand programmatisch bekannt.
**Problem, das es löst:** Ohne Zustandsansage weiß Tastatur-/Screenreader-Nutzung nicht, ob ein Bereich offen oder zu ist.
**Umsetzung hier:** `aria-expanded` in `LandingPage.vue`, `PricingPage.vue`, `PricingModal.vue` (Accordions); Datenschutz nutzt native `<details>/<summary>`.
**Anti-Pattern:** ein `<div>`-Accordion ohne `aria-expanded` und ohne native Semantik.
**Übertragbarkeit:** immer, sobald es aufklappbare UI gibt.
**Nicht übertragen wenn:** —
**Abrufwort:** `aria-expanded`

## SEO

### S-36 Pro Route vorgerendertes HTML
**Prinzip:** Jede indexierbare Route liefert vollständigen Inhalt bereits im ausgelieferten HTML — ohne dass ein Client Skripte ausführen muss.
**Problem, das es löst:** Rein clientseitig gerenderte Inhalte sind für nicht-ausführende Crawler und viele KI-Retrieval-Bots unsichtbar.
**Umsetzung hier:** `scripts/prerender.mjs` (Headless-Browser rendert jede Route → statisches `dist/<route>/index.html`), als `postbuild` in `package.json`.
**Anti-Pattern:** eine SPA ohne Prerender/SSR für indexierbare Inhalte ausliefern.
**Übertragbarkeit:** immer, wenn organische/KI-Sichtbarkeit ein Ziel ist.
**Nicht übertragen wenn:** rein internes Tool / hinter Login, ohne Sichtbarkeitsanspruch.
**Abrufwort:** `prerender-pflicht`

### S-37 Vollständiger seitenindividueller Head
**Prinzip:** Jede Seite setzt ihren vollständigen Dokumentkopf selbst — Titel, Beschreibung, kanonische URL, Indexierungs-Direktive und Social-Preview-Metadaten.
**Problem, das es löst:** Ein statischer, für alle Seiten gleicher Head ruiniert Snippets, Kanonisierung und Social-Previews der Unterseiten.
**Umsetzung hier:** zentrales Head-Management (`useHead`) in 8 Views (`title`, `description`, `canonical` mit Trailing-Slash, `robots`, vollständiges OG- + Twitter-Set).
**Anti-Pattern:** globaler Einheits-Head; fehlende/relative Canonicals; Unterseiten ohne eigene Beschreibung.
**Übertragbarkeit:** immer für öffentlich sichtbare Seiten.
**Nicht übertragen wenn:** nicht-indexierte interne Ansichten.
**Abrufwort:** `head-pro-seite`

### S-38 Mehrschichtige Structured Data
**Prinzip:** Strukturierte Daten sind geschichtet: die zentrale Entität **einmal** kanonisch, pro Seite deren Typ + Navigationspfad + fachliches Schema; identitätskritische Blöcke (Bewertungen, Aggregat-Rating, Startseiten-FAQ) erscheinen **nur** auf der kanonischen Seite.
**Problem, das es löst:** Dieselben Bewertungs-/Entitätsblöcke auf jeder Unterseite lösen Validierungswarnungen aus und verwässern die Entität; fehlende Schichtung verschenkt Rich-Results.
**Umsetzung hier:** globaler Business-Graph in `index.html`; pro View eigenes Schema (`FAQPage`/`Product`/`AboutPage`/`Person`/`BreadcrumbList`); `scripts/prerender.mjs` entfernt `review`/`aggregateRating` und die Startseiten-`FAQPage` (`@id …#faq`) aus allen Nicht-Wurzel-Routen (JSON-aware).
**Anti-Pattern:** einen globalen Schema-Block unverändert auf jede Route kopieren.
**Übertragbarkeit:** ab dem Punkt, an dem eine echte Entität (Unternehmen, Person, Produktlinie) mehrere Seiten hat.
**Nicht übertragen wenn:** eine einzelne Seite ohne Entitäts-/Unterseiten-Struktur.
**Abrufwort:** `structured-data-schichten`

### S-39 Schema spiegelt sichtbaren Inhalt
**Prinzip:** Strukturierte Daten geben nur wieder, was auch sichtbar auf der Seite steht, und werden mit dem sichtbaren Inhalt synchron gehalten.
**Problem, das es löst:** Schema, das vom sichtbaren Inhalt abweicht, verstößt gegen Suchmaschinen-Richtlinien und riskiert Abwertung.
**Umsetzung hier:** `LandingPage.vue` (Kommentar-Konvention: „FAQ-Schema muss den sichtbaren Inhalt spiegeln"), gleiches Muster in `PricingPage.vue` — FAQ-Fragen/Antworten in Schema und sichtbarem Accordion deckungsgleich.
**Anti-Pattern:** Schema mit Keywords/Fakten füllen, die auf der Seite nicht vorkommen.
**Übertragbarkeit:** immer, wenn strukturierte Daten genutzt werden.
**Nicht übertragen wenn:** —
**Abrufwort:** `schema-spiegelt-sichtbar`

### S-40 Indexierungs-Hygiene
**Prinzip:** Nicht-indexierbares (Rechtstexte, Fehlerseiten, reiner UI-Zustand) wird per Direktive auf „nicht indexieren" gesetzt **und** aus der Sitemap ausgeschlossen; Kanonische und Sitemap nutzen eine einheitliche URL-Form.
**Problem, das es löst:** Indexierte Rechts-/Fehler-/Duplikatseiten verwässern die Relevanz; uneinheitliche URL-Formen erzeugen Duplicate-Content-Signale.
**Umsetzung hier:** `noindex` auf Datenschutz/404/Modal-Routen; `public/sitemap.xml` listet Datenschutz bewusst **nicht**; Trailing-Slash konsistent in Canonical, Sitemap und internen Links; `public/robots.txt` blockt Modal-Duplikate.
**Anti-Pattern:** alles indexieren lassen; Canonicals mal mit, mal ohne Trailing-Slash.
**Übertragbarkeit:** immer für öffentliche Sites.
**Nicht übertragen wenn:** —
**Abrufwort:** `index-hygiene`

## GEO (KI-/Antwortmaschinen-Sichtbarkeit)

### S-41 Maschinen-Crawler zulassen
**Prinzip:** Bekannte KI-/Antwortmaschinen-Crawler werden in der Crawler-Steuerdatei **explizit** zugelassen (nicht dem Default überlassen).
**Problem, das es löst:** KI-Retrieval kann Inhalte nur nutzen, wenn ihre Bots nicht (versehentlich) blockiert sind; explizite Freigabe ist die Voraussetzung für Zitierbarkeit.
**Umsetzung hier:** `public/robots.txt` mit Allowlist (u. a. GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, PerplexityBot, Google-Extended, CCBot, Applebot-Extended).
**Anti-Pattern:** KI-Bots pauschal blocken oder ungeprüft dem Default überlassen.
**Übertragbarkeit:** immer, wenn KI-Sichtbarkeit erwünscht ist.
**Nicht übertragen wenn:** Inhalte ausdrücklich **nicht** in KI-Systeme sollen (dann bewusst blocken).
**Abrufwort:** `ai-crawler-erlauben`

### S-42 LLM-Beschreibungsdatei
**Prinzip:** Eine maschinenadressierte Beschreibungsdatei fasst Angebot, Kernfakten und Seitenlandkarte kompakt für Sprachmodelle zusammen.
**Problem, das es löst:** LLMs profitieren von einer dichten, kuratierten Zusammenfassung, statt sich alles aus verstreutem Seiten-HTML zu holen.
**Umsetzung hier:** `public/llms.txt` + `public/llms-full.txt` (Kurzbeschreibung + Fakten + Seitenliste nach dem llms.txt-Format).
**Anti-Pattern:** keine maschinenlesbare Zusammenfassung; oder eine, die niemand pflegt (siehe S-43-Caveat).
**Übertragbarkeit:** nur bei Anforderung KI-Sichtbarkeit; geringer Aufwand, aber Wirkung erst mit S-36/S-43.
**Nicht übertragen wenn:** keine KI-Sichtbarkeitsziele.
**Abrufwort:** `llms-datei`

### S-43 Kernfakten maschinenlesbar & answer-first
**Prinzip:** Zentrale Fakten liegen zusätzlich in extrahierbarer, „antwort-zuerst" strukturierter Form vor (kompakte Tabellen, Frage→Kurzantwort direkt auf der Seite) — und werden mit der Wahrheit synchron gehalten.
**Problem, das es löst:** Fakten, die nur in interaktiven Widgets oder Fließtext stecken, sind für Maschinen schwer/nicht extrahierbar; veraltete Faktenquellen liefern falsche Zitate.
**Umsetzung hier:** maschinenlesbare Preistabelle (`sr-only`) in `PricingPage.vue`; Frage-Überschrift + kurze Antwort direkt in den Seiten (`LandingPage.vue`, `PricingPage.vue`). ⚠️ **Synchronität ist hier verletzt** — `public/llms.txt` nennt einen veralteten Preis (Self-Check).
**Anti-Pattern:** Kernfakten nur in einem JS-Rechner oder Bild; mehrere Faktenquellen ohne Sync-Pflicht.
**Übertragbarkeit:** nur bei Anforderung KI-/Antwortmaschinen-Sichtbarkeit.
**Nicht übertragen wenn:** keine solchen Ziele.
**Abrufwort:** `fakten-maschinenlesbar`

## Tooling

### S-44 Einheitliche Build-Grundlage
**Prinzip:** Der Build ruht auf wenigen, klaren Konventionen: ein Import-Alias auf das Quellverzeichnis, **eine** Asset-Verarbeitungs-Pipeline als Default, modulare ES-Module.
**Problem, das es löst:** Relative `../../`-Importketten und uneinheitliche Asset-Behandlung machen Umzüge und Reviews teuer.
**Umsetzung hier:** `vite.config.js` (`@`→`src`-Alias; Bild-Pipeline als `defaultDirectives`); `package.json` (`"type":"module"`; `postbuild`-Prerender).
**Anti-Pattern:** tiefe relative Importpfade; Assets mal so, mal so verarbeiten.
**Übertragbarkeit:** immer.
**Nicht übertragen wenn:** —
**Abrufwort:** `build-grundlage`

---

## Unsichere Kandidaten (nur 1 Beleg — bewusst NICHT als Standard)
Diese Muster sind real, aber nur an **einer** Stelle belegt. Erst bei einem zweiten Beleg in ein `S-XX` heben.

- **U-1 Formular-/UI-State im zentralen Store inkl. Validierungs-Getter** — nur `stores/overlay.js` (`contactForm` + `isContactValid`).
- **U-2 Async-Fetch mit `loading/loaded/error`-Flags + Doppel-Fetch-Guard, Quelle statische Datei** — nur `stores/calendar.js` (einziger echter Fetch im Projekt).
- **U-3 Transparenter Wrapper via Attribut-Fall-Through** (`inheritAttrs:false` + Attribute ans innere Element) — nur `components/Pic.vue`.
- **U-4 Vollständige Dialog-A11y** (role=dialog + modal-Semantik + Fokus speichern/setzen/zurückgeben + ESC) — nur `components/Modal.vue`; die schweren Feature-Modals replizieren es nicht.

> Prüfung, Widersprüche im Referenzcode und die bewusst ausgelassene „gute Praxis": siehe **`PRUEFUNG-UND-GRENZEN.md`**.
