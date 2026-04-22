# Sitesight Tracking – Kompaktdoku

## Architektur

```
Consent → App.vue lädt Script → window.MDAL existiert
                                        │
utils/tracking.js  ── track(name, params) ─► window.MDAL.event({ Name, Parameters })
                                        │
                                        └─► Sitesight Dashboard
```

- **Script-Loader:** `src/App.vue` (`loadSitesight()` → lädt `app-static.sitesights.io/client.min.js`, nur wenn `localStorage.cookieConsent === 'accepted'`).
- **PageView:** `src/main.js` (`router.afterEach` ruft `window.MDAL.pageView(...)` nach jedem Routewechsel).
- **Events:** `src/utils/tracking.js` ist der einzige Emit-Punkt. Kein anderer Code ruft `MDAL.event` direkt.

Ohne Consent → `window.MDAL` fehlt → `track()` macht einen stillen `return`. Keine Fehler, keine Requests.

## API

```js
import { track, trackDebounced, attachScrollDepthTracker } from '@/utils/tracking'

track('pulk.nav.click', { target: 'contact', source: 'bottommenu' })

trackDebounced('pulk.pricing.adjust', { package: 'business', persons: 8, hours: 4 }, 1500)

const detach = attachScrollDepthTracker('landing')   // oder ('pricing', containerEl)
onBeforeUnmount(() => detach())
```

- **Namensschema:** `pulk.<bereich>.<action>` – strikt einhalten.
- **Leere/`null`/`undefined`-Parameter** werden automatisch verworfen.
- **Debounce:** pro Name ein Timer. Letzter Call innerhalb des Fensters gewinnt.
- **Scroll-Depth-Tracker:** feuert einmalig pro Schwelle (25 / 50 / 75 / 100 %) pro Page-Load.

## Event-Taxonomie (Stand: Säulen A, B, C)

### Säule A – Navigation & Sichtbarkeit

| Event | Gefeuert in | Parameter |
|---|---|---|
| `pulk.nav.click` | `BottomMenu.vue` | `target` (contact/about/pricing), `action` (open/close), `source` |
| `pulk.outbound.click` | `SiteFooter.vue` | `destination` (instagram/maps/verliebtinhalle/tmrb), `source` |
| `pulk.footer.copy-link` | `SiteFooter.vue` | `url` |
| `pulk.scroll.depth` | `LandingPage`, `PricingPage`, `AboutPage` | `percent` (25/50/75/100), `page` |
| `pulk.faq.open` | `LandingPage`, `PricingPage`, `PricingModal` | `section`, `page` |
| `pulk.page.404` | `NotFound.vue` | `url`, `referrer` |

### Säule B – Contact-Funnel

Quelle (`source`): `contact-page` (Voll-Seite) oder `contact-modal` (Overlay).

| Event | Trigger | Parameter |
|---|---|---|
| `pulk.contact.open` | Mount bzw. `visible=true` | `source` |
| `pulk.contact.start` | Erste Eingabe (einmalig pro Session) | `source`, `field` |
| `pulk.contact.package-select` | Preispaket gewählt | `source`, `package` |
| `pulk.contact.date-select` | Datum bestätigt | `source`, `start`, `end`, `nights` |
| `pulk.contact.date-blocked` | Klick auf reservierten Tag/Range | `source`, `reason` (day/range) |
| `pulk.contact.submit` | Submit-Button geklickt | `source`, `method`, `package` |
| `pulk.contact.success` | Web3Forms `res.ok === true` | `source` |
| `pulk.contact.error` | HTTP-Fehler oder Network-Exception | `source`, `type`, `status`/`message` |
| `pulk.contact.abort` | Modal zu / Seite verlassen ohne Submit | `source`, `via`, `stage` (empty/partial/near-complete) |

Abort-Hinweis: feuert nur wenn `pulk.contact.start` bereits lief und kein `pulk.contact.success` kam – sonst würde jedes reine Aufmachen als Abort zählen.

### Säule C – Content-Signale

| Event | Trigger | Parameter |
|---|---|---|
| `pulk.pricing.adjust` | `+`/`-` auf Personen/Stunden (debounced 1500 ms) | `source`, `package`, `persons`, `hours`, `total` |
| `pulk.pricing.expand-card` | „Details anzeigen" geöffnet | `source`, `package` |
| `pulk.faq.open` | Pricing-FAQ aufgeklappt | `section`, `page` |

## Lokales Debugging

1. In DevTools Console: `localStorage.setItem('cookieConsent','accepted')` → Reload.
2. `window.MDAL` prüfen – muss ein Objekt mit `event` / `pageView` sein.
3. Network-Tab → Filter `sitesights.io` → jedes Event ist ein eigener Request mit `Name` + `Parameters` als Payload.
4. Kein Request? → Consent fehlt oder Script geblockt (AdBlocker, uBlock, Brave Shields).

## Was du in Sitesight siehst

- **Events-View:** eingehende Events werden nach `Name` (z. B. `pulk.contact.submit`) gruppiert. Parameter erscheinen als Breakdown-Achsen.
- **Sinnvolle Auswertungen:**
  - Contact-Funnel: `open → start → submit → success` mit Drop-off je Schritt.
  - Pricing-Interesse: `pulk.pricing.adjust` nach `package`, aggregiert nach `total`.
  - Reichweite/Engagement: `pulk.scroll.depth` nach `page` und `percent`.
  - 404-Monitoring: `pulk.page.404` nach `url` / `referrer`.
- **PageView** liefert die Basis-Reichweite (feuert automatisch pro Route).

## Erweitern

Neue Events immer nach `pulk.<bereich>.<action>` benennen, `source` möglichst mitgeben, Parameter flach halten (keine verschachtelten Objekte – Sitesight nimmt nur primitive Werte).
