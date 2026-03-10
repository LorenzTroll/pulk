<script setup>
/* ============================================================================
 * Imports
 * ============================================================================
 * Vue core features, SEO, smooth scroll integration and assets
 */
import { ref, computed, onMounted, onBeforeUnmount, onActivated, onDeactivated, nextTick } from 'vue'
import { useHead } from '@vueuse/head'
import { useLenis } from '@/composables/useLenis.js'
import pulkArrow from '@/assets/pulk-arrow-accordeon.svg'


/* ============================================================================
 * SEO / Metadata
 * ============================================================================
 */
useHead({
  title: 'Datenschutz · PULK',
  meta: [
    { name: 'description', content: 'Datenschutzhinweise von PULK.' },
    { name: 'robots', content: 'noindex,nofollow' }
  ],
  link: [
    { rel: 'canonical', href: 'https://pulk.space/datenschutz' }
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
    title: 'Cookies & Einwilligungen',
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
})


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
  document.body.classList.remove('theme-plain')
  document.documentElement.classList.remove('no-bounce-landing', 'lenis-stopped')
  document.body.classList.remove('no-bounce-landing')
  document.getElementById('app')?.classList.remove('plain-background')
})
</script>

<template>
  <main class="legal-wrap" style="background-color: white; min-height: 100vh;">
    <!-- Header -->
    <header class="legal-header">
      <h1>Datenschutz</h1>
      <div class="legal-tools">
        <label for="search-datenschutz" class="sr-only">Inhalt durchsuchen</label>
        <input
          v-model="query"
          type="search"
          placeholder="Inhalt durchsuchen …"
          aria-label="Datenschutzerklärung durchsuchen"
        />
        <div class="spacer"></div>
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
          <img :src="pulkArrow" alt="" class="icon-chevron" aria-hidden="true" />
        </summary>

        <div class="legal-body" v-html="s.body"></div>
      </details>
    </section>
    <!-- Back button -->
    <div class="back-home-wrapper">
      <RouterLink to="/" class="back-home-btn">
        Zurück zur Startseite
      </RouterLink>
    </div>
  </main>
</template>

<style scoped>
/* ============================================================================
 * General Layout
 * ==========================================================================*/
.legal-wrap {
  max-width: 75%;
  margin: 0 auto 40rem;
  padding: 5rem 0 0 0;
  color: #141414;
  background: #fff;
  font-family: 'LayGrotesk', sans-serif;
  word-break: normal;
  overflow-wrap: normal;
  hyphens: auto;
}

/* ============================================================================
 * Header Section
 * ==========================================================================*/
.legal-header h1 {
  font-weight: 900;
  font-size: clamp(2.7rem, 3vw, 3rem);
  margin: 0 0 2rem 0;
  text-transform: uppercase;
  text-wrap: balance;
}

.legal-tools {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin: 5rem 0 3rem;
  flex-wrap: wrap;
}

.legal-tools input[type="search"] {
  flex: 0 2 250px;
  padding: 0.65rem 0.9rem;
  border: 1px solid rgba(20, 20, 20, 0.2);
  border-radius: 0.5rem;
  font: inherit;
  font-size: 1rem;
}

.legal-tools input[type="search"]:focus {
  outline: none;
  border: 2px solid #9687FF;
}

/* ============================================================================
 * Expand / Collapse Toggle
 * ==========================================================================*/
.expand-toggle {
  display: flex;
  gap: 2rem;
  align-items: center;
  font-weight: 600;
  cursor: pointer;
}

.toggle-text {
  color: #141414;
  font-size: 1rem;
  display: flex;
  gap: 0.5rem;
  transition: opacity 0.2s ease;
  user-select: none;
}

.toggle-text:hover {
  opacity: 0.75;
}

/* ============================================================================
 * Accordion
 * ==========================================================================*/
.legal-accordion {
  border-top: 1px solid #141414;
  margin-top: 1rem;
}

.legal-item {
  border-bottom: 2px solid rgba(20, 20, 20, 0.3);
  padding: 2.5rem 0;
}

summary {
  list-style: none;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

summary::-webkit-details-marker {
  display: none;
}

summary h2 {
  font-size: clamp(2rem, 5vw, 2rem);
  font-weight: 900;
  margin: 0;
}

.icon-chevron {
  width: 3rem;
  transform-origin: center;
  transition: transform 0.4s ease-in-out;
}

details[open] .icon-chevron {
  transform: rotate(180deg);
}

.legal-body {
  padding: 3rem 0 3rem;
  line-height: 1.6;
  font-size: 1.2rem;
  width: 90%;
  color: #141414;
}

/* ============================================================================
 * Back-to-home Button
 * ==========================================================================*/
.back-home-wrapper {
  margin-top: 6rem;
  text-align: center;
}

.back-home-btn {
  background-color: #9687FF;
  color: white;
  font-weight: 700;
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
  border-radius: 999px;
  text-decoration: none;
  transition: background-color 0.25s ease, transform 0.2s ease;
  display: inline-block;
}

.back-home-btn:hover {
  background-color: #7e6fe0;
  transform: translateY(-2px);
}

/* ============================================================================
 * Responsive (Mobile)
 * ==========================================================================*/
@media (max-width: 640px) {
  .legal-wrap {
    max-width: 92%;
    padding: 3rem 0 6rem;
  }

  .legal-header h1 {
    font-size: clamp(2rem, 5vw, 2.7rem);
    margin: 1rem 0 2rem;
  }

  summary h2 {
    font-size: clamp(1.5rem, 5vw, 2rem);
  }

  .legal-body {
    font-size: clamp(1rem, 4vw, 1.2rem);
    line-height: 1.65;
  }

  .legal-tools {
    gap: 2rem;
  }
}
</style>
