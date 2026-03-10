<script setup>
/* --------------------------------------------------------------------------
 * Imports
 * -------------------------------------------------------------------------- */
import {
  ref,
  nextTick,
  onMounted,
  onBeforeUnmount,
  onActivated,
  onDeactivated,
  computed,
  watch
} from 'vue'

import { useHead } from '@vueuse/head'
import { useRoute, useRouter } from 'vue-router'

import { getGsap } from '@/composables/lazyGsap'
import { useRevealUp } from '@/composables/useRevealUp'

import staticGalleryImg from '@/assets/PULK_250513_Foto_Michel_Klehm_03.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import pulk05 from '@/assets/PULK_250513_Foto_Michel_Klehm_05.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import pulk07 from '@/assets/PULK_250513_Foto_Michel_Klehm_07.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'

import pulkArrow from '@/assets/pulk-arrow-accordeon.svg'
import pulkHero from '@/assets/Pulk-hero-image_E12.svg'
import pulkHeroMobile from '@/assets/pulk_heroImage-mobile_E3.svg'

import BottomMenu from '@/components/BottomMenu.vue'
import { useLenis } from '@/composables/useLenis.js'
import { useOverlayStore } from '@/stores/overlay'

useRevealUp('.reveal-up')

/* --------------------------------------------------------------------------
 * SEO meta & structured data
 * -------------------------------------------------------------------------- */
useHead({
  title: 'PULK – Raum für Workshops, Seminare und kreative Formate in Halle (Saale)',
  meta: [
    {
      name: 'description',
      content:
        'PULK ist ein flexibler Raum in Halle (Saale) für Workshops, Seminare, Meetings und kreative Formate – ideal für Unternehmen, Firmen, Organisationen und Teams.'
    },

    // Open Graph for social media
    {
      property: 'og:title',
      content: 'PULK – Raum für Workshops und kreative Formate in Halle (Saale)'
    },
    {
      property: 'og:description',
      content:
        '100 m² Raum für Ideen, Wandel & Zusammenarbeit. Ideal für Organisationen, Teams & kreative Prozesse.'
    },
    { property: 'og:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:url', content: 'https://pulk.space/' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'de_DE' }
  ],
  link: [
    { rel: 'canonical', href: 'https://pulk.space/' },
    { rel: 'preload', as: 'image', href: staticGalleryImg, fetchpriority: 'high' }
  ],
  script: []
})

/* --------------------------------------------------------------------------
 * Static accordion content
 * -------------------------------------------------------------------------- */
const accordionItems = [
  {
    label: 'Nutzung',
    content:
      'Das Pulk ist ein flexibel nutzbarer Raum in Halle (Saale) für Workshops, Team-Meetings, Klausuren, Netzwerktreffen, Seminare oder kreative Formate. Unternehmen, Organisationen, Initiativen oder Privatpersonen finden hier eine inspirierende Umgebung – ruhig, im privaten Ambiente in einem flexiblen und anpassbaren Raum. Präsentationen, Apéros, Lesungen oder andere Anlässe: Der Raum passt sich euren Anforderungen an, damit ihr euch auf das Wesentliche konzentrieren könnt. Unser Raum liegt direkt an der Kröllwitzbrücke. Straßenbahnanbindung ist mit der Linie 7 bequem möglich und kostenlose Parkplätze sind am Amselgrund vorhanden. Partys gehören nicht zum Repertoire. Unsere Workshops werden stundenweise abgerechnet, jede angefangene Stunde zählt. Für Veranstaltungen mit mehreren Personen oder besonderen Anforderungen gelten individuelle Preise. Bei Vorlage der Gemeinnützigkeit geben wir euch 19 % Rabatt.'
  },
  {
    label: 'Ausstattung',
    content:
      'Unser Raum ist mit einem 50-Zoll-Fernseher auf Rollen ausgestattet, Grundstock an Workshopmaterialien ist vorhanden, Pinnwände, Whiteboard und vier Elemente, die ihr als Werkbänke nutzen könnt. Euch stehen insgesamt bis zu 10 Tische zur Verfügung. Die maximale Bestuhlung umfasst 40 Stühle. Basics wie Toilette, Wasser, Strom, Teeküche, und Internet fehlen natürlich auch nicht. Auf Beamer und Mikrofone habt ihr auf Anfrage auch Zugriff.'
  },
  {
    label: 'Catering',
    content:
      'Die Organisation eines Catering- oder Getränkeservice übernehmt ihr als Mieter:innen. Gerne empfehlen wir euch unsere lokalen Partner: Für vegetarisches und veganes Catering ist das Anna Müller, für Getränke Gunnar Franke – beide ansässig in der Burgstraße.'
  },
  {
    label: 'Vertrag',
    content:
      'Unser Ziel: verbindliche Vereinbarung, transparente Preise, ohne versteckte Kosten. Dazu dient unser Vertrag, der das gewünschte Paket für alle Seiten zusammenfasst. Eine Nutzungsvereinbarung, der Umgang mit Schäden, ob Gegenstände, unbewegliches Mobiliar oder Personen, ist im Vertrag geregelt. Die Bezahlung muss vor deinem Workshop oder deiner Veranstaltung auf unserem Konto eingehen, damit ihr Zutritt zu den Räumlichkeiten habt. Je nach Umfang und Personenanzahl kann eine Kaution erhoben werden und die Reinigungspauschale variieren.'
  }
]

/* --------------------------------------------------------------------------
 * Stores, routing & scroll context
 * -------------------------------------------------------------------------- */
const { lenis, on, off } = useLenis()
const overlay = useOverlayStore() // 'contact' | 'about' | 'pricing' | null

const route = useRoute()
const router = useRouter()

/**
 * Keep <div ref="introTrigger"> in template wired,
 * even if logic currently lives in external composables.
 * This avoids runtime warnings and keeps the hook available.
 */
const introTrigger = ref(null)

/* --------------------------------------------------------------------------
 * Route → overlay sync
 * Keeps overlay state in sync with named routes
 * -------------------------------------------------------------------------- */
watch(
  () => route.name,
  newName => {
    const modalRoutes = {
      preise: 'pricing',
      miete: 'contact',
      about: 'about'
    }

    if (modalRoutes[newName]) {
      overlay.open(modalRoutes[newName])
    } else {
      overlay.close()
    }
  },
  { immediate: true }
)

/* --------------------------------------------------------------------------
 * Accordion logic (open/close, GSAP animation)
 * -------------------------------------------------------------------------- */
const openIndex = ref(null)
const contentRefs = []
const arrowRefs = []

async function toggleAccordion(i) {
  const willOpen = openIndex.value !== i
  openIndex.value = willOpen ? i : null

  if (willOpen && window.MDAL?.event) {
    MDAL.event({
      Name: 'accordion-opened',
      Parameters: [{ Name: 'section', Value: accordionItems[i].label }]
    })
  }

  await nextTick()
  await animateAccordion(i, willOpen)
}

async function animateAccordion(i, open) {
  const gsap = await getGsap()
  const contentEl = contentRefs[i]
  const arrowEl = arrowRefs[i]
  if (!contentEl || !arrowEl) return

  const after = () => {
    lenis.value?.emit?.('resize') || lenis.value?.resize?.()
  }

  if (open) {
    gsap.set(contentEl, { height: 0, opacity: 0 })
    gsap.to(arrowEl, { rotation: 180, duration: 0.2, ease: 'power1.out' })
    gsap.to(contentEl, {
      height: 'auto',
      opacity: 1,
      duration: 0.5,
      ease: 'power1.out',
      onComplete: after
    })
  } else {
    gsap.to(arrowEl, { rotation: 0, duration: 0.4, ease: 'power1.in' })
    gsap.to(contentEl, {
      height: 0,
      opacity: 0,
      duration: 0.4,
      ease: 'power1.in',
      onComplete: after
    })
  }
}

/* --------------------------------------------------------------------------
 * BottomMenu lift near footer
 * - nearFooter: distance to page end
 * - liftLocked: temporary lock while modals open/close
 * -------------------------------------------------------------------------- */
const nearFooter = ref(false)

// Guard flag to prevent jumping directly after a modal closes
const liftLocked = ref(false)

/* ---------- Scroll Depth Tracking ---------- */
const scrollDepth = ref({
  25: false,
  50: false,
  75: false,
  100: false
})

function trackScrollDepth(percent) {
  if (scrollDepth.value[percent]) return // schon getrackt
  scrollDepth.value[percent] = true

  if (window.MDAL?.event) {
    window.MDAL.event({
      Name: 'scroll-depth',
      Parameters: [{ Name: 'percent', Value: percent }]
    })
  }
}

/**
 * Fallback scroll distance calculation using window/document.
 * Used when Lenis is not available.
 */
function updateNearFooterWindow() {
  const doc = document.documentElement
  const body = document.body
  const pageHeight = Math.max(
    doc.scrollHeight,
    doc.offsetHeight,
    body?.scrollHeight || 0,
    body?.offsetHeight || 0
  )
  const scrollTop = window.scrollY || doc.scrollTop || 0
  const vh = window.innerHeight || doc.clientHeight || 0

  const rem = parseFloat(getComputedStyle(doc).fontSize) || 16
  const onT = 10 * rem
  const offT = 12 * rem

  const dist = pageHeight - (scrollTop + vh)

  if (!nearFooter.value && dist <= onT) {
    nearFooter.value = true
  } else if (nearFooter.value && dist > offT) {
    nearFooter.value = false
  }
}

/**
 * Lenis-based scroll handler.
 * Receives Lenis scroll events and updates nearFooter
 * based on remaining scroll distance.
 */
function handleLenisScroll(e) {
  const y     = typeof e?.scroll === 'number' ? e.scroll : (e?.scroll?.y ?? 0)
  const limit = typeof e?.limit  === 'number' ? e.limit  : (e?.limit?.y  ?? 0)

  // scroll depth messen
  measureScrollDepth(y, limit)

  // existing footer logic
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
  const onT  = 14 * rem
  const offT = 16 * rem
  const dist = Math.max(0, limit - y)

  if (!nearFooter.value && dist <= onT) nearFooter.value = true
  else if (nearFooter.value && dist > offT) nearFooter.value = false
}

function measureScrollDepth(y, limit) {
  const scrollHeight = limit
  const current = y
  const percent = (current / scrollHeight) * 100

  if (percent >= 25) trackScrollDepth(25)
  if (percent >= 50) trackScrollDepth(50)
  if (percent >= 75) trackScrollDepth(75)
  if (percent >= 98) trackScrollDepth(100)
}

/**
 * Hard re-evaluation against DOM.
 * Used after big layout changes (e.g. modal close).
 */
function recalcNearFooterNow() {
  const doc = document.documentElement
  const vh = window.innerHeight || doc.clientHeight || 0
  const rem = parseFloat(getComputedStyle(doc).fontSize) || 16
  const onT = 14 * rem
  const offT = 16 * rem

  const dist = doc.scrollHeight - (window.scrollY + vh)

  if (!nearFooter.value && dist <= onT) {
    nearFooter.value = true
  } else if (nearFooter.value && dist > offT) {
    nearFooter.value = false
  }
}

/**
 * Schedule multiple recalculations across frames and a timeout.
 * This makes the nearFooter state robust against CSS transitions.
 */
function recalcAfterLayout() {
  requestAnimationFrame(() => {
    recalcNearFooterNow()
    requestAnimationFrame(() => {
      recalcNearFooterNow()
      setTimeout(recalcNearFooterNow, 140)
    })
  })
}

/* --------------------------------------------------------------------------
 * Overlay → BottomMenu lift guards
 * - While a modal is open, lifting is disabled
 * - After closing, lifting is re-enabled after a short delay
 * -------------------------------------------------------------------------- */
watch(
  () => overlay.current,
  async (cur, prev) => {
    if (cur) {
      // Modal opens: disable lift and reset to base position
      liftLocked.value = true
      nearFooter.value = false
    } else {
      // Modal closes: wait for layout to settle, then recompute
      await nextTick()
      recalcAfterLayout()
      setTimeout(() => {
        liftLocked.value = false
      }, 160)
    }
  },
  { flush: 'post' }
)

/* --------------------------------------------------------------------------
 * Scroll safety helper (Lenis + browser)
 * Ensures scroll is re-enabled after back navigation / tab restore.
 * -------------------------------------------------------------------------- */
function ensureScrollEnabled() {
  const html = document.documentElement
  const body = document.body

  // Clear potential inline locks
  html.style.overflow = ''
  html.style.height = ''

  const top = parseInt(body.style.top || '0', 10) || 0
  body.style.overflow = ''
  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''
  body.style.paddingRight = ''

  if (top) {
    window.scrollTo(0, -top)
  }

  // Remove leftover lock classes
  html.classList.remove('lenis-stopped', 'lenis-scrolling', 'no-bounce-landing')
  body.classList.remove('no-bounce', 'no-bounce-landing')

  // Safely restart Lenis & recalc layout
  try {
    lenis.value?.start?.()
    requestAnimationFrame(() => {
      lenis.value?.resize?.()
      window.dispatchEvent(new Event('scroll'))
    })
  } catch {
    // Intentionally swallowed: Lenis is optional
  }
}

function onPageShow() {
  ensureScrollEnabled()
}

function onVisChange() {
  if (document.visibilityState === 'visible') {
    ensureScrollEnabled()
  }
}

/* --------------------------------------------------------------------------
 * Scroll source attach/detach (Lenis vs window)
 * -------------------------------------------------------------------------- */
let scrollSourceBound = false

function attachScrollSource() {
  if (scrollSourceBound) return

  if (lenis.value && on) {
    on('scroll', handleLenisScroll)
    requestAnimationFrame(recalcNearFooterNow)
  } else {
    updateNearFooterWindow()
    window.addEventListener('scroll', updateNearFooterWindow, { passive: true })
    window.addEventListener('resize', updateNearFooterWindow, { passive: true })
  }

  scrollSourceBound = true
}

function detachScrollSource() {
  if (!scrollSourceBound) return

  off?.('scroll', handleLenisScroll)
  window.removeEventListener('scroll', updateNearFooterWindow)
  window.removeEventListener('resize', updateNearFooterWindow)
  scrollSourceBound = false
}

/* --------------------------------------------------------------------------
 * Lifecycle
 * -------------------------------------------------------------------------- */
onMounted(() => {
  // Initial scroll/Lenis safety setup
  ensureScrollEnabled()

  window.addEventListener('pageshow', onPageShow)
  window.addEventListener('visibilitychange', onVisChange)

  attachScrollSource()
})

onBeforeUnmount(() => {
  detachScrollSource()
  window.removeEventListener('pageshow', onPageShow)
  window.removeEventListener('visibilitychange', onVisChange)
})

// KeepAlive hooks: if LandingPage is wrapped in <KeepAlive>
onActivated(() => {
  ensureScrollEnabled()
  attachScrollSource()
  requestAnimationFrame(recalcNearFooterNow)

  document.documentElement.classList.add('no-bounce-landing')
  document.body.classList.add('no-bounce-landing')
})

onDeactivated(() => {
  detachScrollSource()

  document.documentElement.classList.remove('no-bounce-landing')
  document.body.classList.remove('no-bounce-landing')
})

/* --------------------------------------------------------------------------
 * BottomMenu style (lift near footer)
 * - Lifts only when close to footer AND no modal is open AND not locked
 * -------------------------------------------------------------------------- */
const bottomMenuStyle = computed(() => {
  const lifted = nearFooter.value && !overlay.current && !liftLocked.value
  const isMobile = window.matchMedia('(max-width: 640px)').matches

const base = lifted
  ? (isMobile ? '27rem' : '30rem')
  : '2rem'

  return {
    bottom: `calc(${base} + env(safe-area-inset-bottom, 0px))`
  }
})
</script>

<template>
  <!-- Skip link for keyboard users -->
  <a href="#faq" class="skip-link">Direkt zu den FAQs</a>
  <main class="landing-container">
    <!-- ------------------------------------------------------------------- -->
    <!-- Mobile layout                                                       -->
    <!-- ------------------------------------------------------------------- -->
    <section class="lp-mobile" aria-label="Landing (mobil)">
      <header class="m-hero" aria-label="Hero (mobil)">
        <img
          :src="pulkHeroMobile"
          alt="PULK – kreativer Seminar- und Workshopraum in Halle (Saale) für Teams und Institutionen"
          class="m-hero-img"
          width="1080"
          height="1920"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
      </header>
      <figure class="m-img reveal-up">
        <picture>
          <source
            v-for="src in pulk07.sources"
            :key="src.type"
            :srcset="src.srcset"
            :type="src.type"
          />
          <img
            :src="pulk07.img.src"
            :srcset="pulk07.img.srcset"
            :width="pulk07.img.width"
            :height="pulk07.img.height"
            sizes="(max-width: 640px) 100vw, 50vw"
            alt="Eingangsbereich des PULK Workshopraums mit Blick ins Studio"
            class="m-img-el"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </figure>
      <section class="m-section reveal-up">
        <h2 class="m-h1">
          Nicht irgend&shy;ein Raum, sondern einer voller Möglich&shy;keiten.
        </h2>
        <p class="m-p animated-text">
          100 Quadratmeter entworfen und gebaut, damit ihr ungestört Großes bewegen könnt.
          Gemütlich, privat und vielseitig. Hier springen Ideen leichter von Kopf zu Kopf,
          werden aus Team-Meetings Meilensteine und aus Präsentationen Momente, die hängen bleiben.
        </p>
      </section>
      <figure class="m-img reveal-up">
        <picture>
          <source
            v-for="src in pulk05.sources"
            :key="src.type"
            :srcset="src.srcset"
            :type="src.type"
          />
          <img
            :src="pulk05.img.src"
            :srcset="pulk05.img.srcset"
            :width="pulk05.img.width"
            :height="pulk05.img.height"
            sizes="(max-width: 640px) 100vw, 50vw"
            alt="Flexible Einrichtung und Möbel im Seminarraum PULK Halle(Saale)"
            class="m-img-el"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </figure>
      <figure class="m-img reveal-up">
        <picture>
          <source
            v-for="src in staticGalleryImg.sources"
            :key="src.type"
            :srcset="src.srcset"
            :type="src.type"
          />

          <img
            :src="staticGalleryImg.img.src"
            :srcset="staticGalleryImg.img.srcset"
            :width="staticGalleryImg.img.width"
            :height="staticGalleryImg.img.height"
            sizes="(max-width: 640px) 100vw, 50vw"
            alt="Heller, wandelbarer Raum für Seminare und Workshops in Halle (Saale)"
            class="m-img-el"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </figure>
      <section class="m-section reveal-up">
        <h2 class="m-h1">
          Miet Dich bei<br />uns ein
        </h2>
        <p class="m-p animated-text">
          Pulk passt sich euch an: wird Bühne, wird Ideenwerkstatt, wird Zuhörort.
          Möbel, die sich bewegen. Vorhänge, die den Raum neu zeichnen.
          Wohnlich, aber professionell. Privat, aber repräsentativ. Strukturiert, aber beweglich.
          Ein Raum, an dem euer Team nicht nur zusammen sitzt, sondern vorankommt.
        </p>
      </section>
    </section>
    <!-- ------------------------------------------------------------------- -->
    <!-- Desktop & tablet layout                                             -->
    <!-- ------------------------------------------------------------------- -->
    <section class="lp-desktop" aria-label="Landing (desktop/tablet)">
      <!-- Hero image -->
      <div class="hero-container">
        <img
          :src="pulkHero"
          alt="Workshop- und Seminarraum PULK in Halle (Saale) mit 100 m² Fläche"
        />
      </div>
      <!-- Intro section with two side images -->
      <section class="intro-section">
        <div
          class="intro-image intro-image-left reveal-up"
          data-reveal-delay="0.8"
        >
          <picture>
            <source
              v-for="src in pulk05.sources"
              :key="src.type"
              :srcset="src.srcset"
              :type="src.type"
            />
            <img
              :src="pulk05.img.src"
              :srcset="pulk05.img.srcset"
              :width="pulk05.img.width"
              :height="pulk05.img.height"
              sizes="(max-width: 640px) 100vw, 50vw"
              alt="Zugang zum PULK Raum für Organisationen, Meetings und Kreativarbeit"
              class="m-img-el"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
        <div class="intro-content reveal-up">
          <h1
            class="static-caption-first reveal-up"
            data-reveal-start="top 43%"
          >
            Nicht<wbr />
            irgend&shy;ein<wbr />
            Raum,<wbr />
            sondern<wbr />
            einer<wbr />
            voller<wbr />
            Möglich&shy;keiten
          </h1>
          <p
            class="reveal-up animated-text"
            data-reveal-start="top 40%"
          >
            100 Quadratmeter entworfen und gebaut, damit ihr ungestört Großes bewegen könnt.
            Gemütlich, privat, und möglichst vielseitig. Hier springen Ideen leichter von Kopf zu Kopf,
            werden aus Team-Meetings Meilensteine und aus Präsentationen Momente, die hängen bleiben.
          </p>
          <!-- Trigger node for advanced GSAP/ScrollTrigger animations -->
          <div class="intro-trigger" ref="introTrigger" />
        </div>
        <div
          class="intro-image intro-image-right reveal-up"
          data-reveal-delay="0.5"
        >
          <picture>
            <source
              v-for="src in pulk07.sources"
              :key="src.type"
              :srcset="src.srcset"
              :type="src.type"
            />
            <img
              :src="pulk07.img.src"
              :srcset="pulk07.img.srcset"
              :width="pulk07.img.width"
              :height="pulk07.img.height"
              sizes="(max-width: 640px) 100vw, 50vw"
              alt="Eingangsbereich des PULK Workshopraums mit Blick ins Studio"
              class="m-img-el"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
      </section>
      <!-- Static gallery / hero preview -->
      <div class="static-preview">
        <picture>
          <source
            v-for="src in staticGalleryImg.sources"
            :key="src.type"
            :srcset="src.srcset"
            :type="src.type"
          />
          <img
            :src="staticGalleryImg.img.src"
            :srcset="staticGalleryImg.img.srcset"
            :width="staticGalleryImg.img.width"
            :height="staticGalleryImg.img.height"
            sizes="(max-width: 640px) 100vw, 50vw"
            alt="Heller, wandelbarer Raum für Seminare und Workshops in Halle (Saale)"
            class="m-img-el"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      <!-- Caption block below gallery -->
      <div class="static-caption reveal-up">
        <h2 class="caption-title">
          Mietet<wbr />
          euch<br />
          im<wbr />
          Pulk ein
        </h2>
        <p class="caption-text reveal-up animated-text">
          Pulk passt sich euch an: wird Bühne, wird Ideenwerkstatt, wird Zuhörort.
          Möbel, die sich bewegen. Vorhänge, die den Raum neu zeichnen.
          Wohnlich, aber professionell. Privat, aber repräsentativ. Strukturiert, aber beweglich.
          Ein Raum an dem euer Team nicht nur zusammen sitzt, sondern vorankommt.
        </p>
      </div>
    </section>
    <!-- ------------------------------------------------------------------- -->
    <!-- Accordion section                                                   -->
    <!-- ------------------------------------------------------------------- -->
    <section class="accordion-section">
      <div
        v-for="(item, idx) in accordionItems"
        :key="idx"
        class="accordion-item reveal-up"
      >
        <div
          class="accordion-header"
          role="button"
          tabindex="0"
          :aria-expanded="openIndex === idx"
          @click="toggleAccordion(idx)"
          @keydown.enter="toggleAccordion(idx)"
          @keydown.space.prevent="toggleAccordion(idx)"
        >
          <h2 class="item-title">
            {{ item.label }}
          </h2>
          <img
            :src="pulkArrow"
            alt="toggle"
            class="icon-chevron"
            :ref="el => (arrowRefs[idx] = el)"
          />
        </div>
        <div
          class="accordion-content"
          :ref="el => (contentRefs[idx] = el)"
        >
          <p>{{ item.content }}</p>
        </div>
      </div>
    </section>
    <!-- ------------------------------------------------------------------- -->
    <!-- BottomMenu (global CTA tabs)                                        -->
    <!-- ------------------------------------------------------------------- -->
    <BottomMenu :style="bottomMenuStyle" />
  </main>
</template>

<style scoped>
/* --------------------------------------------------------------------------
 * Animated text (GSAP SplitText lines)
 * -------------------------------------------------------------------------- */
.animated-text .line {
  display: block;
  will-change: color;
}

/* Invisible trigger used for advanced scrolling / GSAP timelines */
.intro-trigger {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

/* --------------------------------------------------------------------------
 * Skip link (accessibility)
 * -------------------------------------------------------------------------- */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: #000;
  color: #fff;
  padding: 0.5rem 1rem;
  z-index: 1000;
  transition: top 0.3s ease;
  font-weight: 900;
}

.skip-link:focus {
  top: 0;
}

/* --------------------------------------------------------------------------
 * Layout: main container
 * -------------------------------------------------------------------------- */
.landing-container {
  background-color: #9687ff;
  color: #141414;
  font-family: 'LayGrotesk', sans-serif;
  overflow-x: hidden;
  font-display: swap;
}

/* --------------------------------------------------------------------------
 * Desktop / tablet hero
 * -------------------------------------------------------------------------- */
.hero-container {
  padding: 1.5rem 1.5rem 4rem 1.5rem;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* --------------------------------------------------------------------------
 * Intro section (desktop/tablet)
 * -------------------------------------------------------------------------- */
.intro-section {
  position: relative;
  display: flex;
  padding: 8rem 4rem;
  gap: 6rem;
}

.intro-image-left {
  flex: 1 1 100px;
  max-width: 200px;
}

.intro-image-left img {
  width: 110%;
  min-width: 20rem;
  height: auto;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translate(-9rem, 1rem);
}

.intro-content {
  flex: 1 1 200px;
  max-width: 150%;
  text-align: left;
  line-height: 1.05;
  letter-spacing: 0.005rem;
  word-spacing: 0.02rem;
  display: flex;
  gap: 3rem;
  padding: 15rem 3rem 0 0;
}

.intro-content h1 {
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  font-display: swap;
  margin-block-start: -0.9rem;
  margin-block-end: 0;
  hyphens: manual;
  word-break: normal;
  overflow-wrap: normal;
  max-width: 50%;
}

.intro-content p {
  font-size: 1.2rem;
  line-height: 1.4;
  width: 90%;
  color: #141414;
  margin-block-start: 0;
  max-width: 40%;
  font-display: swap;
}

.intro-image-right {
  position: absolute;
  right: 5%;
  top: 22rem;
  width: 18rem;
}

.intro-image-right img {
  width: 90%;
  border-radius: 0.5rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-31rem);
}

/* --------------------------------------------------------------------------
 * Static gallery preview
 * -------------------------------------------------------------------------- */
.static-preview {
  width: 82%;
  height: 50rem;
  overflow: hidden;
  border-radius: 0.5rem;
  margin: 4rem auto 4rem;
  box-shadow: 0 4px 20px rgba(47, 35, 35, 0.1);
}

.static-preview img {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  object-fit: cover;
}

/* --------------------------------------------------------------------------
 * Layout switches: mobile vs desktop
 * -------------------------------------------------------------------------- */
.lp-mobile {
  display: none;
}

.lp-desktop {
  display: block;
}

/* --------------------------------------------------------------------------
 * Static caption blocks below gallery
 * -------------------------------------------------------------------------- */
.static-caption-first {
  width: 80%;
  margin: 5rem 0 2rem;
  gap: 2rem;
}

.static-caption {
  display: flex;
  width: 80%;
  margin: 5rem auto 10rem;
  gap: 2rem;
}

.caption-title {
  flex: 0 40%;
  font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 900;
  color: #141414;
  margin: 0;
  line-height: 1.2;
  letter-spacing: 0.01rem;
  padding-left: 3rem;
  margin-block-start: -0.9rem;
  margin-block-end: 0;
  hyphens: manual;
  word-break: normal;
  overflow-wrap: normal;
}

.caption-text {
  flex: 0 0 48%;
  font-size: 1.2rem;
  line-height: 1.4;
  color: #141414;
  margin: 0;
}

/* --------------------------------------------------------------------------
 * Accordion section
 * -------------------------------------------------------------------------- */
.accordion-section {
  width: 74%;
  margin: 0 auto 32rem;
  border-top: 1px solid #141414;
}

.accordion-item {
  border-bottom: 2px solid rgba(20, 20, 20, 0.3);
}

.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  cursor: pointer;
}

.accordion-header .item-title {
  flex: 1;
  font-weight: 900;
  font-size: 3rem;
  color: #141414;
  padding-left: 0;
  letter-spacing: 0.03rem;
}

.icon-chevron {
  width: 3rem;
  transform-origin: center;
  transition: transform 0.4s ease;
}

.accordion-content {
  overflow: hidden;
  height: 0;
  opacity: 0;
  padding: 0 9rem 1rem 0;
}

.accordion-content p {
  margin: 0 0 3rem;
  color: #141414;
  font-size: 1.2rem;
  line-height: 1.4;
}

/* Extra padding to make space for BottomMenu on large screens */
main {
  padding-bottom: 4rem;
}

/* --------------------------------------------------------------------------
 * BottomMenu safe area before footer transition
 * -------------------------------------------------------------------------- */
:deep(.bottom-menu) {
  transition:
    bottom 260ms cubic-bezier(0.22, 0.61, 0.36, 1),
    transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
  will-change: bottom, transform;
}

@media (prefers-reduced-motion: reduce) {
  :deep(.bottom-menu) {
    transition: none;
  }
}

/* --------------------------------------------------------------------------
 * Tablet breakpoint (641px – 1024px)
 * -------------------------------------------------------------------------- */
@media (min-width: 641px) and (max-width: 1024px) {
  .intro-section {
    gap: 1.25rem 1rem;
    align-items: flex-start;
    padding: 5rem 3rem;
  }

  .intro-image-left,
  .intro-image-right,
  .intro-content {
    position: static !important;
    transform: none !important;
    display: none;
  }

  .intro-content {
    display: flex;
    padding: 0;
    gap: 2rem;
  }

  .intro-content h1 {
    line-height: 1.1;
    margin: 0 0 3rem 0;
    font-display: swap;
    text-wrap: balance;
    max-width: 80%;
  }

  .intro-content p {
    width: auto;
    font-size: 1.2rem;
    line-height: 1.55;
    color: #141414;
  }

  .intro-image-right {
    grid-column: 9 / span 4;
  }

  .intro-image-right img {
    width: 100%;
    height: auto;
    transform: none !important;
    border-radius: 0.5rem;
  }

  .static-preview {
    width: 94%;
    margin: 0 auto 4rem;
  }

  .static-caption {
    width: 100%;
    margin: 5rem auto 10rem;
    gap: 2rem;
  }

  .accordion-header .item-title {
    padding-left: 2rem;
  }

  .accordion-section {
    width: 95%;
    margin: 0 auto 18rem;
  }

  .accordion-content {
    padding: 0 9rem 1rem 2.2rem;
  }

  .accordion-header {
    padding-right: 2rem;
  }
}

/* --------------------------------------------------------------------------
 * Desktop special (1025px – 1300px)
 * -------------------------------------------------------------------------- */
@media (min-width: 1025px) and (max-width: 1300px) {
  .intro-section {
    gap: 8rem;
  }

  .intro-image-right {
    top: 25rem;
    width: 19rem;
  }

  .intro-content {
    flex-direction: column;
    align-items: flex-start;
    gap: clamp(1rem, 3vw, 2rem);
    padding: clamp(6rem, 7vw, 9rem) 0 0 0;
    max-width: none;
  }

  .intro-content h1,
  .intro-content p {
    width: 80%;
    max-width: none;
  }

  .intro-content h1 {
    text-wrap: balance;
    line-height: 1.1;
    padding: 10rem 0 1rem 0;
  }

  .intro-content p {
    max-width: 65ch;
    font-size: 1.2rem;
    line-height: 1.4;
  }

  .static-preview {
    margin: 0 auto 4rem;
  }
}

/* --------------------------------------------------------------------------
 * Smartphone (max-width: 640px)
 * -------------------------------------------------------------------------- */
@media (max-width: 640px) {
  .lp-mobile {
    display: block;
  }

  .lp-desktop {
    display: none;
  }

  .accordion-section {
    width: 100%;
  }

  .accordion-header .item-title {
    font-size: clamp(3rem, 6vw, 3rem);
    color: #141414;
  }

  .accordion-header {
    margin: auto 1rem;
  }

  .icon-chevron {
    width: 3rem;
  }

  .accordion-content {
    padding: 0 0 1rem 0;
  }

  .accordion-content p {
    font-size: clamp(1.5rem, 3.6vw, 1.05rem);
    margin: 1rem 1rem 5rem;
    padding: 0;
  }

  /* Mobile hero */
  .m-hero {
    padding: 0.75rem 0.75rem 0;
  }

  .m-hero-media {
    display: block;
    width: 100%;
  }

  .m-hero-img {
    display: block;
    width: 93svw;
    max-width: 95vw;
    margin: 0 auto 0.5rem;
    padding-bottom: 7rem;
    padding-top: 0.5rem;
    height: auto;
    object-fit: contain;
  }

  .m-pulk {
    display: none;
  }

  .m-img {
    width: 95svw;
    margin: 0.75rem auto;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.18);
  }

  .m-img-el {
    width: 100%;
    height: auto;
    display: block;
    border-radius: 14px;
  }

  .m-section {
    width: 92%;
    margin: 1.25rem auto 0;
  }

  .m-h1 {
    font-weight: 900;
    color: #141414;
    text-wrap: balance;
    font-size: clamp(3rem, 6vw, 3rem);
    margin: 5rem 0 2.5rem 0;
    line-height: 3.3rem;
  }

  .m-p {
    color: #141414;
    font-size: clamp(1.5rem, 3.6vw, 1.05rem);
    line-height: 1.5;
    margin: 0 0 6rem 0;
    width: 90vw;
    font-weight: 500;
  }
}
</style>
