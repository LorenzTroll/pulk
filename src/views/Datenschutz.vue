<script setup>
/* ============================================================================
 * Imports
 * ============================================================================
 * Vue core features, SEO, smooth scroll integration and assets
 */
import { ref, computed, onMounted, onBeforeUnmount, onActivated, onDeactivated, nextTick } from 'vue'
import { useHead } from '@vueuse/head'
import { useLenis } from '@/composables/useLenis.js'
import pulkArrow from '@/assets/pulk-arrow-accordeon_e2.svg'
import heroChairYellow from '@/assets/hero-chair-yellow.png?format=png&as=src'


/* ============================================================================
 * SEO / Metadata
 * ============================================================================
 */
useHead({
  title: 'Datenschutz · PULK – Raum in Halle (Saale)',
  meta: [
    {
      name: 'description',
      content:
        'Datenschutzerklärung von pulk.space nach DSGVO: Umgang mit personenbezogenen Daten, Cookies, Kontaktformular und Rechte der Besucher:innen.'
    },
    { name: 'robots', content: 'noindex,nofollow' },

    // Open Graph
    { property: 'og:title', content: 'Datenschutz · PULK' },
    {
      property: 'og:description',
      content:
        'Datenschutzerklärung von pulk.space nach DSGVO: Umgang mit personenbezogenen Daten, Cookies, Kontaktformular und Rechte der Besucher:innen.'
    },
    { property: 'og:url', content: 'https://pulk.space/datenschutz/' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'de_DE' },
    { property: 'og:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'PULK – Raum in Halle (Saale)' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Datenschutz · PULK' },
    {
      name: 'twitter:description',
      content:
        'Datenschutzerklärung von pulk.space – Umgang mit personenbezogenen Daten nach DSGVO.'
    },
    { name: 'twitter:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' }
  ],
  link: [
    { rel: 'canonical', href: 'https://pulk.space/datenschutz/' }
  ]
})


/* ============================================================================
 * Lenis instance
 * ============================================================================
 */
const { lenis } = useLenis()


/* ============================================================================
 * Static privacy sections (kept 100% untouched)
 * ============================================================================
 */
const year = new Date().getFullYear()

const sections = [
  {
    id: 'verantwortlicher',
    title: 'Informationen über uns als Verantwortliche',
    body: `
      Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und Zweck der Verarbeitung personenbezogener Daten (nachfolgend „Daten“) im Rahmen unseres Onlineangebotes sowie der mit ihm verbundenen Webseiten, Funktionen und Inhalte.<br><br>
      <strong>Michel Klehm und Lorenz Troll GbR<br>
      Talstraße 7<br>
      06120 Halle (Saale)<br>
      E-Mail: troll.lorenz@gmail.com<br>
      Datenschutzbeauftragter: Lorenz Troll</strong><br><br>
    `
  },
  {
    id: 'rechte-betroffene',
    title: 'Rechte von Nutzer:innen und Betroffenen',
    body: `
      Ihnen stehen die nachfolgend genannten Rechte hinsichtlich der Verarbeitung Ihrer personenbezogenen Daten zu:<br><br>
      • Recht auf Auskunft (Art. 15 DSGVO)<br>
      • Recht auf Berichtigung unrichtiger Daten (Art. 16 DSGVO)<br>
      • Recht auf Löschung bzw. Einschränkung der Verarbeitung (Art. 17, 18 DSGVO)<br>
      • Recht auf Datenübertragbarkeit (Art. 20 DSGVO)<br>
      • Recht auf Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)<br>
      • Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)<br><br>
      Sofern Sie eine Einwilligung zur Datenverarbeitung erteilt haben, können Sie diese jederzeit mit Wirkung für die Zukunft widerrufen.
    `
  },
  {
    id: 'datenverarbeitung',
    title: 'Allgemeine Informationen zur Datenverarbeitung',
    body: `
      Wir verarbeiten personenbezogene Daten unserer Nutzer:innen grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. a, b oder f DSGVO.<br><br>
      Personenbezogene Daten werden gelöscht oder gesperrt, sobald der Zweck der Speicherung entfällt oder eine gesetzliche Aufbewahrungsfrist abläuft.
    `
  },
  {
    id: 'cookies',
    title: 'Cookies und Einwilligungen',
    body: `
      Unsere Website verwendet Cookies, um bestimmte Funktionen bereitzustellen und die Nutzung zu analysieren. Cookies sind kleine Textdateien, die lokal im Browser gespeichert werden.<br><br>
      <strong>A. Funktionale Cookies</strong><br>
      Diese Cookies sind technisch notwendig, um die Website korrekt darzustellen und grundlegende Funktionen zu ermöglichen. Sie können nicht deaktiviert werden.<br><br>

      <strong>B. Analyse-Cookies</strong><br>
      Mit Ihrer Einwilligung verwenden wir das datenschutzfreundliche Analysetool <strong>Sitesight</strong> (siehe unten). Diese Cookies oder Trackingdaten helfen uns, das Nutzerverhalten anonymisiert auszuwerten, um die Website zu verbessern.<br><br>

      <strong>C. Cookie-Einstellungen</strong><br>
      Beim ersten Besuch der Website werden Sie über ein Cookie-Banner um Ihre Einwilligung gebeten. Sie können Ihre Auswahl jederzeit über die Cookie-Einstellungen im Browser ändern oder bereits gespeicherte Cookies löschen.
    `
  },
  {
    id: 'serverdaten',
    title: 'Serverdaten',
    body: `
      Aus technischen Gründen, insbesondere zur Gewährleistung eines sicheren und stabilen Betriebs, werden Daten durch Ihren Internet-Browser an unseren Webspace-Provider übermittelt (Server-Logfiles). Erfasst werden dabei unter anderem:<br><br>
      • Browsertyp und -version<br>
      • Betriebssystem<br>
      • Referrer-URL (die zuvor besuchte Seite)<br>
      • Besuchte Seiten unserer Website<br>
      • Datum und Uhrzeit des Zugriffs<br>
      • IP-Adresse des anfragenden Endgeräts<br><br>
      Die Speicherung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in der Aufrechterhaltung der technischen Sicherheit und der Optimierung unseres Internetauftritts. Die Logfiles werden in der Regel nach spätestens sieben Tagen gelöscht.
    `
  },
  {
    id: 'externe-inhalte',
    title: 'Einbindung externer Inhalte (z. B. Videos)',
    body: `
      Auf unserer Website können externe Medieninhalte eingebunden sein, beispielsweise Videos des Anbieters <strong>Vimeo</strong> (Vimeo LLC, 555 West 18th Street, New York, USA).
      Beim Aufruf einer Seite mit eingebettetem Vimeo-Video wird eine Verbindung zu Vimeo-Servern hergestellt. Dabei können technische Daten (z. B. Ihre IP-Adresse) übertragen werden. Wenn Sie bei Vimeo eingeloggt sind, kann Vimeo diese Daten Ihrem Benutzerkonto zuordnen.<br><br>
      Die Nutzung erfolgt auf Grundlage Ihrer Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO. Wenn Sie keine Datenübertragung wünschen, deaktivieren Sie bitte externe Medien in Ihrem Cookie-Banner oder loggen Sie sich vor dem Besuch bei Vimeo aus.<br><br>
      <strong>Weitere Informationen:</strong> <a href="https://vimeo.com/legal/privacy/policy" target="_blank" rel="noopener noreferrer">https://vimeo.com/legal/privacy/policy</a>
    `
  },
  {
    id: 'sitesight',
    title: 'Webanalyse mit Sitesight',
    body: `
      Wir verwenden das datenschutzfreundliche Analyse-Tool <strong>Sitesight</strong> der LUX Sitesight GmbH (Deutschland), um die Nutzung unserer Website besser zu verstehen und zu optimieren.<br><br>
      Sitesight arbeitet <strong>ohne Cookies</strong>, anonymisiert IP-Adressen und speichert keine personenbezogenen Daten dauerhaft. Die Verarbeitung erfolgt ausschließlich auf Servern innerhalb der Europäischen Union.
      Rechtsgrundlage ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Die Analyse wird nur durchgeführt, wenn Sie der Nutzung über unser Cookie-Banner ausdrücklich zugestimmt haben.<br><br>
      <strong>Weitere Informationen:</strong> <a href="https://sitesight.io/datenschutz" target="_blank" rel="noopener noreferrer">https://sitesight.io/datenschutz</a>
    `
  },
  {
    id: 'web3forms',
    title: 'Kontaktformular Web3Forms',
    body: `
      Für das Kontaktformular auf unserer Website nutzen wir den Dienst <strong>Web3Forms</strong>. Dieser Dienst ermöglicht die sichere Übermittlung Ihrer Anfrage an uns per E-Mail.
      Anbieter ist <strong>Web3Forms</strong>, mit Servern in der Europäischen Union. Die Datenübertragung erfolgt verschlüsselt. Die übermittelten Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und nicht dauerhaft auf den Servern von Web3Forms gespeichert.
      Erhobene Daten: Name, E-Mail-Adresse, Nachricht (Pflichtfelder).<br>
      Zweck der Verarbeitung: Kontaktaufnahme und Beantwortung von Anfragen.<br><br>
      Rechtsgrundlage: Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.<br>
      <strong>Weitere Informationen:</strong> <a href="https://web3forms.com/privacy-policy" target="_blank" rel="noopener noreferrer">https://web3forms.com/privacy-policy</a>
    `
  }
]


/* ============================================================================
 * Search / Filter logic
 * ============================================================================
 */
const query = ref('')
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return sections
  return sections.filter(s =>
    s.title.toLowerCase().includes(q) ||
    s.body.toLowerCase().includes(q)
  )
})


/* ============================================================================
 * Scroll-to helper (anchors)
 * ============================================================================
 */
function go(id) {
  const el = document.getElementById(id)
  if (!el) return

  if (el.tagName.toLowerCase() === 'details') {
    el.open = true
  }

  history.replaceState(null, '', `#${id}`)
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}


/* ============================================================================
 * onMounted lifecycle
 * ============================================================================
 * Starts Lenis, handles resizes and scroll events,
 * processes deep links (#anchor)
 */
onMounted(async () => {
  try {
    lenis.value?.start?.()

    requestAnimationFrame(() => {
      lenis.value?.resize?.()
      lenis.value?.emit?.('scroll')
      window.dispatchEvent(new Event('scroll'))
    })
  } catch (err) {
    console.warn('[Datenschutz] Lenis start/resize failed:', err)
  }

  await nextTick()

  // Handle #anchor navigation on initial load
  const hash = decodeURIComponent(location.hash || '').replace('#', '')
  if (hash) {
    const el = document.getElementById(hash)
    if (el) {
      if (el.tagName.toLowerCase() === 'details') el.open = true
      lenis.value?.scrollTo(el, { offset: -40, immediate: false })
    }
  }

  document.getElementById('app')?.classList.add('plain-background')

  window.addEventListener('scroll', updateLift, { passive: true })
  updateLift()
})


/* ============================================================================
 * Footer-Lift für fixed Close-Button
 * ============================================================================
 */
const footerSentinelRef = ref(null)
const btnLift = ref(0)

function updateLift() {
  const footer = document.querySelector('.site-footer')
  if (!footer) return
  const rect = footer.getBoundingClientRect()
  const vh = window.innerHeight
  btnLift.value = Math.max(0, vh - rect.top)
}


/* ============================================================================
 * Expand / Collapse all accordions
 * ============================================================================
 */
function expandAll() {
  document.querySelectorAll('.legal-accordion details').forEach(d => {
    d.open = true
  })
}

function collapseAll() {
  document.querySelectorAll('.legal-accordion details').forEach(d => {
    d.open = false
  })
}


/* ============================================================================
 * onBeforeUnmount cleanup
 * ============================================================================
 */
onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateLift)
  document.body.classList.remove('theme-plain')
  document.documentElement.classList.remove('no-bounce-landing', 'lenis-stopped')
  document.body.classList.remove('no-bounce-landing')
  document.getElementById('app')?.classList.remove('plain-background')
})
</script>

<template>
  <main class="legal-wrap" style="background-color: #e7e8ec; min-height: 100dvh;">
    <!-- Header -->
    <header class="legal-header">
      <div class="legal-tools">
        <h1>Datenschutz</h1>
        <div class="legal-chair-wrap">
          <img :src="heroChairYellow" alt="" aria-hidden="true" class="legal-chair" />
        </div>
      </div>
      <!-- Controls row above accordion -->
      <div class="legal-controls">
        <div class="legal-search-wrap">
          <label for="search-datenschutz" class="sr-only">Inhalt durchsuchen</label>
          <input
            id="search-datenschutz"
            v-model="query"
            type="search"
            placeholder="Inhalt durchsuchen …"
            aria-label="Datenschutzerklärung durchsuchen"
          />
          <button
            v-if="query"
            class="legal-search-clear"
            @click="query = ''"
            aria-label="Eingabe löschen"
            type="button"
          >X</button>
        </div>
        <div class="expand-toggle">
          <span @click="expandAll" class="toggle-text">Alles ausklappen</span>
          <span @click="collapseAll" class="toggle-text">Alles einklappen</span>
        </div>
      </div>
    </header>
    <!-- Accordion -->
    <section class="legal-accordion">
      <details
        v-for="s in filtered"
        :key="s.id"
        :id="s.id"
        class="legal-item"
      >
        <summary>
          <h2>{{ s.title }}</h2>
          <div class="icon-chevron-wrap">
            <img :src="pulkArrow" alt="" class="icon-chevron" aria-hidden="true" />
          </div>
        </summary>

        <div class="legal-body" v-html="s.body"></div>
      </details>
    </section>

    <!-- Footer sentinel — lets close button lift above the footer -->
    <div ref="footerSentinelRef" class="ds-sentinel"></div>
  </main>

  <!-- Fixed close button — bottom-Position wird in CSS aufgelöst
       (Default 1.5rem, Mobile 0.5rem analog zu BottomMenu auf LandingPage).
       Nur die dynamische Lift-Komponente kommt als CSS-Custom-Property. -->
  <RouterLink
    to="/"
    class="ds-close-btn"
    :style="{ '--ds-btn-lift': `${btnLift}px` }"
  >
    <span>Schließen</span>
    <span class="ds-close-icon">✕</span>
  </RouterLink>
</template>

<style scoped>
/* ============================================================================
 * General Layout
 * ==========================================================================*/
.legal-wrap {
  max-width: 85%;
  margin: 0 auto 50rem;
  padding: 5rem 0 0 0;
  color: #141414;
  background: #e7e8ec;
  font-family: 'LayGrotesk', sans-serif;
  word-break: normal;
  overflow-wrap: normal;
  hyphens: auto;
}

/* ============================================================================
 * Header Section
 * ==========================================================================*/
.legal-tools {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin: 0 0 2rem;
}

.legal-tools h1 {
  font-weight: 900;
  font-size: clamp(2rem, 6vw, 3rem);
  line-height: 1.114;
  margin: 0;
  text-wrap: balance;
}

/* Search wrapper */
.legal-search-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
}

/* Clear button */
.legal-search-clear {
  position: absolute;
  right: 1.5rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 400;
  font-size: 1rem;
  color: #000000;
  line-height: 1;
  padding: 0;
  transition: color 0.2s ease;
}

.legal-search-clear:hover {
  opacity: 0.6;
}

/* Search input — ContactModal style */
.legal-controls input[type="search"] {
  font-family: 'LayGrotesk', sans-serif;
  font-size: 1rem;
  line-height: 2rem;
  letter-spacing: -0.01rem;
  color: #141414;
  padding: 1.25rem;
  border: 0.125rem solid #141414;
  border-radius: 0.625rem;
  background: transparent;
  outline: none;
  width: 18rem;
  box-sizing: border-box;
  transition: border-color 0.2s ease;
}

.legal-controls input[type="search"]::-webkit-search-cancel-button {
  -webkit-appearance: none;
  display: none;
}

.legal-controls input[type="search"]::placeholder {
  color: rgba(20, 20, 20, 0.5);
}

.legal-controls input[type="search"]:focus {
  border-color: #9687FF;
}

/* ============================================================================
 * Expand / Collapse Toggle
 * ==========================================================================*/
.legal-controls {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 2rem;
  margin: 2rem 0 3rem;
}

.expand-toggle {
  display: flex;
  gap: 2rem;
  align-items: center;
  cursor: pointer;
  margin-left: auto;
}

.toggle-text {
  color: #141414;
  font-size: 1.5rem;
  font-weight: 400;
  display: flex;
  gap: 0.5rem;
  transition: opacity 0.2s ease;
  user-select: none;
}

.toggle-text:hover {
  opacity: 0.75;
}

/* ============================================================================
 * Chair image
 * ==========================================================================*/
.legal-chair-wrap {
  flex: 0 0 auto;
}

.legal-chair {
  width: 100%;
  height: auto;
  transform: scaleX(-1);
  margin: -2rem 0rem 5rem 0rem;
}

/* ============================================================================
 * Accordion — LandingPage style
 * ==========================================================================*/
.legal-accordion {
  border-top: 1px solid rgba(20, 20, 20, 0.3);
  margin-top: 1rem;
  padding-bottom: 5rem;
}

.legal-item {
  border-top: 1px solid rgba(20, 20, 20, 0.3);
}

.legal-item:first-child {
  border-top: none;
}

summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  padding: 2.25rem 2.875rem;
}

summary::-webkit-details-marker {
  display: none;
}

summary h2 {
  flex: 1;
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 900;
  line-height: 1.24;
  color: #141414;
  margin: 0;
}

/* Chevron wrap — LandingPage style */
.icon-chevron-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 3.375rem;
  height: 3.375rem;
  background: #141414;
  border-radius: 0.625rem;
  transition: background 0.3s ease;
}

details[open] .icon-chevron-wrap {
  background: #9687FF;
}

.icon-chevron {
  width: 1.5625rem;
  transform-origin: center;
  transition: transform 0.4s ease-in-out;
}

details[open] .icon-chevron {
  transform: rotate(180deg);
}

.legal-body {
  padding: 0 2.875rem 2.875rem;
  line-height: 1.375;
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  letter-spacing: -0.015625rem;
  color: #141414;
  width: 80%;
}

/* ============================================================================
 * Sentinel + Fixed Close Button
 * ==========================================================================*/
.ds-sentinel {
  height: 0;
}

.ds-close-btn {
  position: fixed;
  left: 50%;
  /* bottom analog zum BottomMenu auf LandingPage: 1.5rem Default,
     0.5rem auf Mobile. var(--ds-btn-lift) wird per inline-style aus
     der updateLift-Logik gefüttert (Footer-Sentinel-Distance). */
  bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px) + var(--ds-btn-lift, 0px));
  transform: translateX(-50%);
  transition: bottom 0.3s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 1rem;
  background: #9687FF;
  color: #fff;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  text-decoration: none;
  /* z-index 5000: muss über CookieBanner-Overlay (z-index 2000) liegen,
     sonst schluckt der Overlay den Click. Analog zu AboutPage. */
  z-index: 5000;
  white-space: nowrap;
}

.ds-close-btn:hover {
  transform: translateX(-50%) scale(1.05);
}

/* ============================================================================
 * Tablet (641px – 1024px)
 * ==========================================================================*/
@media (min-width: 641px) and (max-width: 1024px) {
  .legal-wrap {
    max-width: 90%;
  }

  .legal-tools {
    display: block;
  }

  .legal-chair {
    margin: 2rem 0rem 3rem 0rem;
  }

  .legal-controls input[type="search"] {
    height: 50%;
  }

  summary {
    padding: 1.75rem 1.5rem;
  }

  .legal-body {
    padding: 0 1.5rem 1.75rem;
  }
}

/* ============================================================================
 * Desktop (> 1024px)
 * ==========================================================================*/
@media (min-width: 1025px) {
  summary {
    padding: 3rem 0;
  }

  .legal-body {
    padding: 0 0 3rem;
  }
}

/* ============================================================================
 * Mobile (≤ 640px)
 * ==========================================================================*/
@media (max-width: 640px) {
  /* LandingPage-Pattern: .legal-wrap nimmt volle Viewport-Breite, jede
     Section setzt eigenes padding-inline. So kann .legal-accordion mit
     width:95% + margin:auto sauber zentrieren wie auf LandingPage. */
  .legal-wrap {
    max-width: none;
    padding: 3rem 0 6rem;
  }

  .legal-header {
    padding-inline: 5%;
  }

  .legal-tools h1 {
    font-size: clamp(2rem, 7vw, 2.5rem);
    width: 100%;
  }

  .legal-accordion {
    width: 95%;
    margin: 0 auto;
  }

  summary {
    padding: 1.5rem 1rem;
  }


  .icon-chevron-wrap {
    width: 3rem;
    height: 3rem;
  }

  .icon-chevron {
    width: 1.25rem;
  }

  .legal-body {
    padding: 0 1rem 1.5rem;
    font-size: clamp(1rem, 4vw, 1.25rem);
    width: 100%;
  }

  .ds-close-btn {
    bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px) + var(--ds-btn-lift, 0px));
    padding: 1rem 1rem;
    font-size: 0.95rem;
    gap: 0.5rem;
  }

  .legal-tools {
    display: flex;
    flex-flow: column-reverse;
  }

  .legal-chair-wrap {
    overflow: hidden;
    transform: translateX(1.5rem);
  }

  .legal-chair {
    width: 150%;
    height: auto;
    transform: scaleX(-1) scale(1.3) translateX(5rem);
    margin: 1rem 0rem 2rem 0rem;
  }

  .legal-controls {
    flex-wrap: wrap;
  }

  .legal-search-wrap {
    width: 100%;
  }

  .legal-controls input[type="search"] {
    width: 100%;
    height: 50%;
  }

  .expand-toggle {
    display: none;
  }

  .toggle-text {
    font-size: clamp(0.875rem, 3.5vw, 1.125rem);
  }
}
</style>
