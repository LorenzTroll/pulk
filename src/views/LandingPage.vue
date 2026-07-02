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

import { getGsap, getGsapWithPlugins } from '@/composables/lazyGsap'
import { useRevealUp } from '@/composables/useRevealUp'
import { track } from '@/utils/tracking'

import staticGalleryImg from '@/assets/pulk_room_image-B.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import pulk05 from '@/assets/PULK_250513_Foto_Michel_Klehm_05.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'
import pulk07 from '@/assets/PULK_250513_Foto_Michel_Klehm_07.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'

import pulkArrow from '@/assets/pulk-arrow-accordeon_e2.svg'
import pulkHero from '@/assets/Pulk-hero-image_E12.svg'
import pulkHeroMobile from '@/assets/pulk_heroImage-mobile_E3.svg'

/* Hero chair + review assets: durch imagetools-Pipeline mit AVIF/WebP/PNG
   und responsive sizes. as=picture liefert {sources, img} → wird an die
   <Pic>-Komponente übergeben (rendert <picture> mit allen Sources). */
import chairBlack from '@/assets/hero-chair-black.png?w=200;400&format=avif;webp;png&as=picture'
import chairPurple from '@/assets/hero-chair-purple.png?w=200;400&format=avif;webp;png&as=picture'

import pulkLogoLandingpage from '@/assets/pulk-logo-landingpage.svg'
import ciStoolContainer from '@/assets/ci-elements-stool-container.png?w=600;1200&format=avif;webp;png&as=picture'
import reviewImageA from '@/assets/pulk_review_customerA_imageA.png?w=640;1200&format=avif;webp;png&as=picture'
import reviewImageB from '@/assets/pulk_review-section_customerA-imageB.png?w=640;1200&format=avif;webp;png&as=picture'
import reviewImageC from '@/assets/pulk_review-section_customerB-imageA.jpg?w=640;1200&format=avif;webp;jpg&as=picture'
import reviewImageD from '@/assets/pulk_review-section_customerB-imageB.jpg?w=640;1200&format=avif;webp;jpg&as=picture'
import pulkRoomImageA from '@/assets/pulk_room_image-A.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'

import Pic from '@/components/Pic.vue'
import BottomMenu from '@/components/BottomMenu.vue'
import { useLenis } from '@/composables/useLenis.js'
import { useOverlayStore } from '@/stores/overlay'

useRevealUp('.reveal-up')

/* --------------------------------------------------------------------------
 * SEO meta & structured data
 * -------------------------------------------------------------------------- */
useHead({
  title: 'PULK – Workshopraum, Seminarraum & Creative Space in Halle (Saale)',
  meta: [
    {
      name: 'description',
      content:
        'Workshopraum, Seminarraum und Creative Space in Halle (Saale). 100 m² für eure Gruppe, bis zu 40 Personen, stundenweise mietbar, ohne Mindestbuchung.'
    },

    // Open Graph for social media
    {
      property: 'og:title',
      content: 'PULK – Workshopraum und Creative Space in Halle (Saale)'
    },
    {
      property: 'og:description',
      content:
        '100 m² für eure Gruppe, bis 40 Personen. Stundenweise mietbar, ohne Mindestbuchung.'
    },
    { property: 'og:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'PULK – Workshopraum, Seminarraum und Creative Space in Halle (Saale)' },
    { property: 'og:url', content: 'https://pulk.space/' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'de_DE' }
  ],
  link: [
    { rel: 'canonical', href: 'https://pulk.space/' },
    /* Responsive Preload-Hint für das LCP-Bild: die hero-chairs-bottom
       schwarzen Stühle (AVIF). Ohne den Hint entdeckt der Browser das
       Bild erst nach CSS-Parse → ~586 ms Resource-Load-Delay (laut
       DevTools-LCP-Breakdown 2026-05-19). Der responsive Preload mit
       imagesrcset überlässt dem Browser die Variant-Wahl wie im
       <picture>-Tag. fetchpriority="high" + AVIF-only (alle modernen
       Mobile-Browser, die Score-relevant sind, können AVIF). */
    {
      rel: 'preload',
      as: 'image',
      imagesrcset: chairBlack.sources?.avif,
      imagesizes: '25vw',
      type: 'image/avif',
      fetchpriority: 'high'
    }
  ],
  script: []
})

/* --------------------------------------------------------------------------
 * Static accordion content
 * -------------------------------------------------------------------------- */
const accordionItems = [
  {
    label: 'Für welche Formate eignet sich unser Workshopraum?',
    content:
      'Workshops, Seminare, Klausurtagungen, Netzwerktreffen, Coachings, Fortbildungen, Vereinssitzungen, Lesungen oder Apéros. Alles, was auf 100 Quadratmetern stattfinden kann. Die modularen Möbel lassen sich frei im Raum stellen, das Podest und die Vorhänge schaffen bei Bedarf separate Zonen. Partys gehören nicht zum Repertoire.'
  },
  {
    label: 'Welche Ausstattung hat der Seminarraum?',
    content:
      'Im Raum stehen euch Tische, Stühle, ein 50-Zoll-Fernseher auf Rollen, Whiteboard, Pinnwände, Papierrollen und grundlegendes Moderationsmaterial zur Verfügung. Dazu Teeküche mit Geschirr, Ceran-Kochfeld und WLAN. Beamer und Soundanlage sind im Business-Paket inklusive. Im Community-Paket sind sie nur auf Anfrage und ggf. mit Mehrkosten verbunden. Die Bestuhlung reicht für bis zu 40 Personen, 8 Tische sind modular und frei kombinierbar.'
  },
  {
    label: 'Wie läuft die Buchung für den Seminarraum ab?',
    content:
      'Schaut bei den Preisen, welches Paket auf euch zutrifft. Tragt die Personen und Stunden ein und ihr erfahrt direkt den Gesamtpreis. Über das Kontaktformular könnt ihr alle wichtigen Informationen an uns senden. Wir melden uns innerhalb von 24 Stunden. Wenn alles passt, bekommt ihr eine Nutzungsvereinbarung. Die Nutzungsvereinbarung muss vor dem vereinbarten Termin unterschrieben vorliegen. Die Überweisung des Gesamtbetrags erfolgt vorab und muss ebenfalls vor Beginn der Nutzung auf unserem Konto eingehen. Am Tag eurer Veranstaltung öffnen wir euch den Raum oder ermöglichen euch den Zugang. Wer den Raum vorher sehen möchte: Besichtigungen können vereinbart werden.'
  },
  {
    label: 'Wo ist der Seminarraum in Halle (Saale)?',
    content:
      'Talstraße 7 in Halle (Saale), direkt an der Kröllwitzbrücke. Im Hochparterre eines Altbaus gelegen, mit Blick auf die Saale und Burg Giebichenstein, Rieveufer und Saalepromenade. Einen barrierefreien Zugang lässt die Bausubstanz leider nicht zu.'
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
    /* Keys = Routen-Namen der /modal/*-Routen (main.js). Die früheren Keys
       (preise/anfragen/about) waren die SEO-Seiten — auf denen ist die
       LandingPage gar nicht gemountet. Seit router.push im BottomMenu nicht
       mehr wirft (Namens-Fix), schloss die alte Map das Overlay sofort
       wieder, weil 'modalAbout' nicht gemappt war. */
    const modalRoutes = {
      modalPricing: 'pricing',
      modalContact: 'contact',
      modalAbout: 'about'
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

  if (willOpen) {
    track('pulk.faq.open', {
      section: accordionItems[i].label,
      page: 'landing'
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

  track('pulk.scroll.depth', {
    percent,
    page: 'landing'
  })
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
  const isMobile = window.matchMedia('(max-width: 640px)').matches
  // Mobile: BottomMenu früher ausblenden vor Footer, damit Page-Inhalt
  // (Footer-Links etc.) sich nicht mit den BottomMenu-Tabs überschneidet.
  const onT  = (isMobile ? 30 : 10) * rem
  const offT = (isMobile ? 34 : 12) * rem

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
  const isMobile = window.matchMedia('(max-width: 640px)').matches
  const onT  = (isMobile ? 30 : 14) * rem
  const offT = (isMobile ? 34 : 16) * rem
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
  const isMobile = window.matchMedia('(max-width: 640px)').matches
  const onT  = (isMobile ? 30 : 14) * rem
  const offT = (isMobile ? 34 : 16) * rem

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
  ? (isMobile ? '50rem' : '50rem')
  : (isMobile ? '0.5rem' : '1.5rem')

  return {
    bottom: `calc(${base} + env(safe-area-inset-bottom, 0px))`
  }
})

/* --------------------------------------------------------------------------
 * TEST: Parallax auf static-preview
 * Revert: refs aus Template entfernen, diesen Block + CSS-Änderungen rückgängig.
 * -------------------------------------------------------------------------- */
const parallaxContainer = ref(null)
const parallaxImg = ref(null)

onMounted(async () => {
  const gsap = await getGsapWithPlugins()
  if (!gsap?.ScrollTrigger || !parallaxContainer.value || !parallaxImg.value) return

  gsap.fromTo(
    parallaxImg.value,
    { y: '-8%' },
    {
      y: '8%',
      ease: 'none',
      scrollTrigger: {
        trigger: parallaxContainer.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 2
      }
    }
  )
})

/* --------------------------------------------------------------------------
 * BottomMenu reveal on first scroll
 * -------------------------------------------------------------------------- */
const menuVisible = ref(false)

if (typeof window !== 'undefined') {
  const reveal = () => { menuVisible.value = true }
  window.addEventListener('wheel', reveal, { once: true, passive: true })
  window.addEventListener('touchmove', reveal, { once: true, passive: true })
  window.addEventListener('keydown', function onKey(e) {
    if ([' ', 'ArrowDown', 'ArrowUp', 'PageDown', 'PageUp'].includes(e.key)) {
      reveal()
      window.removeEventListener('keydown', onKey)
    }
  }, { passive: true })
}

// TEMP TEST 2026-05-04 (v2): Reveal über 'opacity' statt 'bottom'.
// Hintergrund: 'bottom'-Transition triggert iOS-Safari-Safe-Area-Tinting (Bug
// in v1-Test bestätigt). 'opacity' ist GPU-composited (kein Reflow/Repaint),
// löst das Tinting nicht aus und erhält den Reveal-Effekt funktional.
// Rollback: diesen Block durch die originale 4-zeilige Variante ersetzen
// (siehe git blame).
const menuRevealStyle = computed(() =>
  menuVisible.value
    ? { opacity: 1, transition: 'opacity 0.5s ease' }
    : { opacity: 0, transition: 'none' }
)
</script>

<template>
  <!-- Skip-Navigation für Tastatur- & Screenreader-User -->
  <nav class="skip-nav" aria-label="Direkt zum Inhaltsbereich springen">
    <a href="#intro" class="skip-link">Zur Einleitung</a>
    <a href="#workshopraum" class="skip-link">Zum Workshopraum</a>
    <a href="#stimmen" class="skip-link">Zu Stimmen aus Halle</a>
    <a href="#faq" class="skip-link">Zu den FAQs</a>
  </nav>
  <main class="landing-container" style="background-color: #e7e8ec; min-height: 100dvh;">
    <!-- ------------------------------------------------------------------- -->
    <!-- Main layout                                                        -->
    <!-- ------------------------------------------------------------------- -->
    <section aria-label="Seminarraum und Workshopraum in Halle (Saale)">
      <!-- Hero: Stühle-Arrangement (Figma node 792:87) -->
      <div
        class="hero-container"
        role="img"
        aria-label="Workshop- und Seminarraum PULK in Halle (Saale) – Stühle Arrangement"
      >
        <!-- Logo oben links (Figma node 839:3533): left=5.5%, top=9%, width=29% -->
        <div class="hero-logo">
          <img :src="pulkLogoLandingpage" alt="PULK Logo" width="320" height="120" />
        </div>
        <!-- Oben: 4 schwarze Stühle, aspect-ratio-Container skaliert mit Breite -->
        <div class="hero-chairs-top">
          <Pic :image="chairBlack" class="hero-chairs-top__item" alt="" aria-hidden="true" loading="eager" fetchpriority="high" sizes="25vw" />
          <Pic :image="chairBlack" class="hero-chairs-top__item" alt="" aria-hidden="true" loading="eager" sizes="25vw" />
          <Pic :image="chairBlack" class="hero-chairs-top__item" alt="" aria-hidden="true" loading="eager" sizes="25vw" />
          <Pic :image="chairBlack" class="hero-chairs-top__item" alt="" aria-hidden="true" loading="eager" sizes="25vw" />
        </div>
        <!-- Unten: 4 Stühle im Flex-Container — selbes Shrink-Verhalten wie Oben -->
        <div class="hero-chairs-bottom">
          <Pic :image="chairBlack" class="hero-chairs-bottom__item" alt="" aria-hidden="true" loading="eager" fetchpriority="high" sizes="25vw" />
          <Pic :image="chairBlack" class="hero-chairs-bottom__item" alt="" aria-hidden="true" loading="eager" sizes="25vw" />
          <Pic :image="chairPurple" class="hero-chairs-bottom__item" alt="" aria-hidden="true" loading="eager" sizes="25vw" />
          <Pic :image="chairBlack" class="hero-chairs-bottom__item" alt="" aria-hidden="true" loading="eager" sizes="25vw" />
        </div>
        <!-- Dritte Reihe: nur Mobile, selbe Bilder wie hero-chairs-top -->
        <div class="hero-chairs-third">
          <Pic :image="chairBlack" class="hero-chairs-third__item" alt="" aria-hidden="true" loading="lazy" sizes="25vw" />
          <Pic :image="chairBlack" class="hero-chairs-third__item" alt="" aria-hidden="true" loading="lazy" sizes="25vw" />
          <Pic :image="chairBlack" class="hero-chairs-third__item" alt="" aria-hidden="true" loading="lazy" sizes="25vw" />
          <Pic :image="chairBlack" class="hero-chairs-third__item" alt="" aria-hidden="true" loading="lazy" sizes="25vw" />
        </div>
      </div>
      <!-- Info Section A (Figma node 787:85): Bild links, Text rechts -->
      <section id="intro" class="intro-section" tabindex="-1">
        <div class="intro-img-container reveal-up" data-reveal-delay="0.2">
          <picture>
            <source
              v-for="(srcset, format) in pulkRoomImageA.sources"
              :key="format"
              :srcset="srcset"
              :type="`image/${format}`"
            />
            <img
              :src="pulkRoomImageA.img.src"
              :srcset="pulkRoomImageA.img.srcset"
              :width="pulkRoomImageA.img.width"
              :height="pulkRoomImageA.img.height"
              sizes="(max-width: 640px) 100vw, 44vw"
              alt="Seminarraum PULK Halle (Saale) – heller Workshopraum für Teams"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>
        <div class="intro-text">
          <span class="intro-deco intro-deco--tl"></span>
          <span class="intro-deco intro-deco--tr"></span>
          <h1
            class="intro-heading reveal-up"
            data-reveal-start="top 43%"
          >
            Workshop&shy;raum, Seminar&shy;raum &amp; Creative Space in Halle (Saale):<wbr>
            100 m² für bis zu <wbr> 40 Personen
          </h1>
          <span class="intro-deco intro-deco--bl"></span>
          <span class="intro-deco intro-deco--br"></span>
          <!-- Desktop/Tablet: intro-body inside grid -->
          <p
            class="intro-body intro-body--dt reveal-up animated-text"
            data-reveal-start="top 40%"
            aria-hidden="true"
          >
            Gebt euren Ideen einen Raum. Ob Workshop, Klausurtagung, Netzwerktreffen oder Seminar:
            ihr bucht stundenweise, kommt mit eurer Gruppe und habt den Raum ganz für euch.
            Damit ihr ungestört Großes bewegen könnt. Gemütlich, privat und vielseitig. Hier springen Ideen leichter von Kopf zu Kopf,
            werden aus Team-Meetings Meilensteine und aus Meetings Momente, die hängen bleiben.
          </p>
        </div>
        <!-- Mobile: intro-body outside grid -->
        <p
          class="intro-body intro-body--mb reveal-up animated-text"
          data-reveal-start="top 40%"
        >
          Gebt euren Ideen einen Raum. Ob Workshop, Klausurtagung, Netzwerktreffen oder Seminar:
          ihr bucht stundenweise, kommt mit eurer Gruppe und habt den Raum ganz für euch.
          Damit ihr ungestört Großes bewegen könnt. Gemütlich, privat und vielseitig. Hier springen Ideen leichter von Kopf zu Kopf,
          werden aus Team-Meetings Meilensteine und aus Meetings Momente, die hängen bleiben.
        </p>
        <!-- Trigger node for advanced GSAP/ScrollTrigger animations -->
        <div class="intro-trigger" ref="introTrigger" />
      </section>
      <!-- Static gallery / hero preview -->
      <div class="static-preview" ref="parallaxContainer">
        <picture>
          <source
            v-for="(srcset, format) in staticGalleryImg.sources"
            :key="format"
            :srcset="srcset"
            :type="`image/${format}`"
          />
          <img
            ref="parallaxImg"
            :src="staticGalleryImg.img.src"
            :srcset="staticGalleryImg.img.srcset"
            :width="staticGalleryImg.img.width"
            :height="staticGalleryImg.img.height"
            sizes="(max-width: 640px) 100vw, 50vw"
            alt="Schulungsraum und Seminarraum PULK in Halle (Saale) – wandelbar"
            class="m-img-el"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      <!-- Caption block below gallery -->
      <div id="workshopraum" class="static-caption reveal-up" tabindex="-1">
        <h2 class="caption-title">
          Euer Workshop&shy;raum, Seminar&shy;raum &amp; Schulungs&shy;raum in Halle (Saale)
        </h2>
        <p class="caption-text reveal-up animated-text">
          Pulk wird Bühne, wird Ideenwerkstatt, wird Zuhörort. Große Fenster, hohe Decken, Stuck.
          Darin: modulares Design, viel Holz, Vorhänge, die den Raum neu zeichnen. Wohnlich, aber professionell.
          Privat, aber repräsentativ. Euer Creative Space und Workshop-Location in Halle (Saale),
          damit euer Team nicht nur zusammensitzt, sondern vorankommt.
        </p>
      </div>
    </section>
    <!-- ------------------------------------------------------------------- -->
    <!-- Review Section (Figma node 1155:70)                                -->
    <!-- Reihe 1: Bild | Bild | Zitat   ·   Reihe 2: Zitat | Bild | Bild    -->
    <!-- ------------------------------------------------------------------- -->
    <section id="stimmen" class="review-section" tabindex="-1">
      <!-- Reihe 1 (Figma node 792:98) -->
      <div class="review-row review-row--imgquote">
        <div class="review-col review-col--img1 reveal-up" data-reveal-start="top 75%" data-reveal-delay="0">
          <Pic :image="reviewImageA" alt="Seminarraum PULK Halle (Saale) – Kundenmoment" loading="lazy" sizes="(max-width: 640px) 50vw, 30vw" />
        </div>
        <div class="review-col review-col--img2 reveal-up" data-reveal-start="top 75%" data-reveal-delay="0.12">
          <Pic :image="reviewImageB" alt="Workshopraum PULK Halle (Saale) – Klausurtagung" loading="lazy" sizes="(max-width: 640px) 50vw, 30vw" />
        </div>
        <!-- Zitat-Spalte -->
        <div class="review-col review-col--quote reveal-up" data-reveal-start="top 75%" data-reveal-delay="0.24">
          <span class="review-deco review-deco--tl"></span>
          <span class="review-deco review-deco--tr"></span>
          <div class="review-quote-content">
            <span class="review-quote-mark review-quote-mark--open" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="19" height="15" viewBox="0 0 19 15" fill="none"><path d="M0 6.8C0 2.56 2.68 0.4 8.08 0V3.8C5.8 3.96 4.08 4.2 4.08 6.8H8.08V14.8H0V6.8ZM18.56 3.8C16.28 3.96 14.56 4.2 14.56 6.8H18.56V14.8H10.48V6.8C10.48 2.56 13.16 0.4 18.56 0V3.8Z" fill="black"/></svg></span>
            <h2 class="review-quote-text">
              Das Pulk ist modular, bestens durchdacht, gemütlich und sehr freundlich<span class="review-quote-mark review-quote-mark--close" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="19" height="15" viewBox="0 0 19 15" fill="none"><path d="M0 8V0H8.08V8C8.08 12.24 5.4 14.4 0 14.8V11C2.28 10.84 4 10.6 4 8H0ZM10.48 0H18.56V8C18.56 12.24 15.88 14.4 10.48 14.8V11C12.76 10.84 14.48 10.6 14.48 8H10.48V0Z" fill="black"/></svg></span>
            </h2>
          </div>
          <p class="review-attribution">
            Unterstützer:innen<br>Die Linke Halle Saale
          </p>
          <span class="review-deco review-deco--bl"></span>
          <span class="review-deco review-deco--br"></span>
        </div>
      </div>
      <!-- Reihe 2 (Figma node 1155:68) -->
      <div class="review-row review-row--quoteimg">
        <!-- Zitat-Spalte -->
        <div class="review-col review-col--quote reveal-up" data-reveal-start="top 75%" data-reveal-delay="0">
          <span class="review-deco review-deco--tl"></span>
          <span class="review-deco review-deco--tr"></span>
          <div class="review-quote-content">
            <span class="review-quote-mark review-quote-mark--open" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="19" height="15" viewBox="0 0 19 15" fill="none"><path d="M0 6.8C0 2.56 2.68 0.4 8.08 0V3.8C5.8 3.96 4.08 4.2 4.08 6.8H8.08V14.8H0V6.8ZM18.56 3.8C16.28 3.96 14.56 4.2 14.56 6.8H18.56V14.8H10.48V6.8C10.48 2.56 13.16 0.4 18.56 0V3.8Z" fill="black"/></svg></span>
            <h2 class="review-quote-text">
              Der licht&shy;durch&shy;flutete Raum und Ambiente waren perfekt für kreative Prozesse.<span class="review-quote-mark review-quote-mark--close" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" width="19" height="15" viewBox="0 0 19 15" fill="none"><path d="M0 8V0H8.08V8C8.08 12.24 5.4 14.4 0 14.8V11C2.28 10.84 4 10.6 4 8H0ZM10.48 0H18.56V8C18.56 12.24 15.88 14.4 10.48 14.8V11C12.76 10.84 14.48 10.6 14.48 8H10.48V0Z" fill="black"/></svg></span>
            </h2>
          </div>
          <p class="review-attribution">
            Tourismusverband<br>Sachsen-Anhalt e.V.
          </p>
          <span class="review-deco review-deco--bl"></span>
          <span class="review-deco review-deco--br"></span>
        </div>
        <div class="review-col review-col--img3 reveal-up" data-reveal-start="top 75%" data-reveal-delay="0.12">
          <Pic :image="reviewImageC" alt="Zufriedene Kundin im Workshopraum PULK Halle (Saale)" loading="lazy" sizes="(max-width: 640px) 100vw, 28vw" />
        </div>
        <div class="review-col review-col--img4 reveal-up" data-reveal-start="top 75%" data-reveal-delay="0.24">
          <Pic :image="reviewImageD" alt="Teilnehmerin mit Tagungsunterlagen im PULK Halle (Saale)" loading="lazy" sizes="(max-width: 640px) 100vw, 24vw" />
        </div>
      </div>
    </section>
    <!-- ------------------------------------------------------------------- -->
    <!-- CI Elements: Stools (Figma node 792:99)                            -->
    <!-- ------------------------------------------------------------------- -->
    <div class="ci-stools">
      <Pic :image="ciStoolContainer" alt="" aria-hidden="true" class="ci-stools__img" loading="lazy" sizes="(max-width: 1024px) 100vw, 60vw" />
    </div>
    <!-- ------------------------------------------------------------------- -->
    <!-- Accordion section                                                   -->
    <!-- ------------------------------------------------------------------- -->
    <section id="faq" class="accordion-section" tabindex="-1">
      <div
        v-for="(item, idx) in accordionItems"
        :key="idx"
        class="accordion-item reveal-up"
        :class="{ 'is-active': openIndex === idx }"
        data-reveal-start="top 55%"
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
          <div class="icon-chevron-wrap">
            <img
              :src="pulkArrow"
              alt="toggle"
              class="icon-chevron"
              width="45"
              height="43"
              :ref="el => (arrowRefs[idx] = el)"
            />
          </div>
        </div>
        <div
          class="accordion-content"
          :ref="el => (contentRefs[idx] = el)"
        >
          <p>{{ item.content }}</p>
        </div>
      </div>
    </section>
  </main>
  <!-- ------------------------------------------------------------------- -->
  <!-- BottomMenu (global CTA tabs)                                        -->
  <!-- Pattern: transparenter fixed-Wrapper + BottomMenu darin absolute,   -->
  <!-- damit Safari beide skippt und nicht für Toolbar-Tinting sampled.   -->
  <!-- ------------------------------------------------------------------- -->
  <Teleport to="body">
    <div class="bottom-menu-frame" aria-hidden="true">
      <BottomMenu :style="[bottomMenuStyle, menuRevealStyle]" class="bottom-menu-absolute" />
    </div>
  </Teleport>
</template>

<style scoped>
/* --------------------------------------------------------------------------
 * Animated text (GSAP SplitText lines)
 * -------------------------------------------------------------------------- */
.animated-text .word {
  display: inline-block;
  white-space: normal;
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
 * Skip navigation (accessibility)
 * Nav liegt per transform komplett über dem Viewport und fährt erst
 * ein, wenn einer ihrer Links Fokus bekommt (:focus-within).
 * -------------------------------------------------------------------------- */
.skip-nav {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  transform: translateY(calc(-100% - 1rem));
  transition: transform 0.25s ease;
}

.skip-nav:focus-within {
  transform: translateY(0);
}

.skip-link {
  background: #141414;
  color: #fff;
  padding: 0.75rem 1.25rem;
  font-weight: 900;
  text-decoration: underline;
  border-radius: 0 0 0.5rem 0.5rem;
  white-space: nowrap;
}

.skip-link:focus-visible {
  outline: 0.125rem solid #9687FF;
  outline-offset: -0.25rem;
}

/* --------------------------------------------------------------------------
 * Layout: main container
 * -------------------------------------------------------------------------- */

.landing-container {
  color: #141414;
  font-family: 'LayGrotesk', sans-serif;
  overflow-x: hidden;
  font-display: swap;
}

/* Einheitliche h1-Basisgröße: max 3rem, fluid über clamp */
.landing-container h1 {
  font-size: clamp(2rem, 4vw, 3rem);
}

/* --------------------------------------------------------------------------
 * Desktop / tablet hero — Stühle-Arrangement (Figma node 792:87)
 *
 * Koordinaten-Logik:
 *  - Figma-Hero-Frame: 2317px breit, startet bei x=66 auf der 1920px Seite
 *  - Kind-Koordinaten sind relativ zum Frame → page_left = (66 + frame_x) / 1920
 *  - Container: aspect-ratio 1920/1100, overflow hidden, weiß
 *  - Obere Reihe: 3 Einzelbilder nebeneinander im Flex-Container
 *  - Untere Stühle: rotate(180deg) scaleY(-1) = horizontale Spiegelung (scaleX -1)
 * -------------------------------------------------------------------------- */
.hero-container {
  position: relative;
  width: 100%;
  aspect-ratio: 1920 / 1100;
  overflow: hidden;
  background: #e7e8ec;
}

/* ---- Logo oben links ----
   Figma: left=105px, top=99px, width=556px auf 1920×1100-Frame               */
.hero-logo {
  position: absolute;
  left: 5.5%;
  top: 4%;
  width: 30%;
  z-index: 2;
}

.hero-logo img {
  width: 80%;
  height: auto;
  display: block;
  margin: 1rem 0rem 0rem 0rem;
}

/* ---- Obere Reihe ----
   Figma: Container w=1585px (=82.6% der 1920px-Seite), aspect-ratio 1686/672
   Höhe folgt automatisch der Breite — kein fester height-Wert nötig.
   Figma page-left: (66+424)/1920 = 25.5%                                  */
.hero-chairs-top {
  position: absolute;
  left: 22%;
  top: -1.5rem;
  width: 92%;
  aspect-ratio: 1863 / 704;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

/* :deep() weil .hero-chairs-top__item via Pic-Component durchgereicht wird —
   das img liegt in einem child-component und hat keinen LandingPage-scope-attr. */
:deep(.hero-chairs-top__item) {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
  display: block;
  pointer-events: none;
  user-select: none;
  transform: scaleX(-1);
}

/* ---- Untere Reihe (Flex-Container) ----
   Gleiches Shrink-Verhalten wie obere Reihe.
   Gesamtbreite der 4 Stühle in Figma: x=48 bis x=1911 = 1863px (97% der 1920px-Seite)
   Höhe: ~64% des Hero (704px von 1100px) → aspect-ratio 1863/704
   left: page_left des ersten Stuhls - 10rem (Nutzerwunsch)                 */
.hero-chairs-bottom {
  position: absolute;
  left: calc(8% - 4rem);
  top: 36%;
  width: 97%;
  aspect-ratio: 1863 / 704;
  overflow: hidden;
  display: flex;
  align-items: stretch;
}

:deep(.hero-chairs-bottom__item) {
  flex: 1 1 0;
  min-width: 0;
  min-height: 0;
  height: 100%;
  object-fit: contain;
  display: block;
  pointer-events: none;
  user-select: none;
}

:deep(.hero-chairs-bottom__item:nth-child(3)) {
  transform: scale(1);
}

/* Dritte Stuhllinie — nur Mobile */
.hero-chairs-third {
  display: none;
}

/* --------------------------------------------------------------------------
 * Info Section A (Figma 787:85) — Bild links, Text rechts
 * Figma: left-[144px] = 7.5% margin, gap 140px = 8.75rem
 * Responsive: flex-wrap → Text wraps unter Bild auf kleinen Screens
 * -------------------------------------------------------------------------- */
.intro-section {
  display: flex;
  flex-wrap: wrap;
  align-items: stretch;
  gap: 8.75rem;
  padding: 5rem 7.5%;
  background: #e7e8ec;
}

/* Bild-Container: 707/772 Seitenverhältnis, abgerundet, overflow für object-fit */
.intro-img-container {
  flex: 0 0 43%;
  min-width: 16rem;
  border-radius: 1.25rem;
  overflow: hidden;
}

.intro-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Text-Block: CSS-Grid 3×4 — gelbe Eck-Dekoelemente rahmen die Headline ein
   Figma col-gap: 55px = 3.4375rem, row-gap: 30px = 1.875rem               */
.intro-text {
  flex: 1 1 20rem;
  display: grid;
  grid-template-columns: 0.9375rem 1fr 0.9375rem;
  grid-template-rows: auto auto auto auto;
  column-gap: 3.4375rem;
  row-gap: 1.875rem;
  align-items: start;
}

/* Gelbe Dekoelemente: 15px = 0.9375rem, border-radius 3px = 0.1875rem */
.intro-deco {
  display: block;
  width: 0.9375rem;
  height: 0.9375rem;
  background: #ffcc00;
  border-radius: 0.1875rem;
  align-self: start;
}

.intro-deco--tl { grid-column: 1; grid-row: 1; }
.intro-deco--tr { grid-column: 3; grid-row: 1; }
.intro-deco--bl { grid-column: 1; grid-row: 3; }
.intro-deco--br { grid-column: 3; grid-row: 3; }

/* Heading: 58.333px = 3.646rem, line-height 65/58.333 ≈ 1.114 */
.intro-heading {
  grid-column: 2;
  grid-row: 2;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 900;
  line-height: 1.114;
  color: #141414;
  margin: 0;
  hyphens: manual;
}

.intro-heading sup {
  font-size: 0.65em;
  vertical-align: super;
}

.intro-body {
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  line-height: 1.375;
  letter-spacing: -0.015625rem;
  color: #141414;
  margin: 0;
}

.intro-body--dt {
  grid-column: 2;
  grid-row: 4;
}

/* Mobile copy hidden by default; desktop copy shown */
.intro-body--mb {
  display: none;
}

/* --------------------------------------------------------------------------
 * Static gallery preview
 * -------------------------------------------------------------------------- */
.static-preview {
  width: 85%;
  height: 50rem;
  overflow: hidden;
  border-radius: 1.25rem;
  margin: 4rem auto 7rem;
  box-shadow: 0 4px 20px rgba(47, 35, 35, 0.1);
}

.static-preview picture {
  display: block;
  height: 100%;
}

.static-preview img {
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  object-fit: cover;
  object-position: center;
  transform: scale(1.3);
  will-change: transform;
}


/* --------------------------------------------------------------------------
 * Static caption blocks below gallery
 * -------------------------------------------------------------------------- */

.static-caption {
  display: flex;
  width: 80%;
  margin: 5rem auto 10rem;
  gap: 2rem;
}

.caption-title {
  flex: 0 40%;
  font-size: clamp(2rem, 5vw, 3rem);
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
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  line-height: 1.375;
  color: #141414;
  margin: 0;
}

/* --------------------------------------------------------------------------
 * Review Section (Figma node 792:98)
 * 3-Spalten-Flex: Bild 1 | Bild 2 | Zitat
 * Figma: left-[134px] ≈ 7%, gap 16px = 1rem
 * -------------------------------------------------------------------------- */
.review-section {
  display: flex;
  flex-direction: column;
  gap: 5rem; /* Abstand zwischen den beiden Reihen */
  padding: 5rem 7%;
}

/* Eine Review-Reihe = 3-Spalten-Flex
   Reihe 1: Bild | Bild | Zitat   ·   Reihe 2: Zitat | Bild | Bild */
.review-row {
  display: flex;
  flex-wrap: nowrap; /* Desktop: 3 Spalten immer in einer Reihe (kein Wrap) */
  align-items: stretch;
  gap: 1rem;
}

/* Bild-Spalten
   Reihe 1 (Figma: 405px vs. 534px) · Reihe 2 (Figma: 498px vs. 441px) */
.review-col--img1 {
  flex: 0 0 22%;
  min-width: 10rem;
  border-radius: 1.25rem;
  overflow: hidden;
}

.review-col--img2 {
  flex: 0 0 30%;
  min-width: 12rem;
  border-radius: 1.25rem;
  overflow: hidden;
}

.review-col--img3 {
  flex: 0 0 28%;
  min-width: 11rem;
  border-radius: 1.25rem;
  overflow: hidden;
}

.review-col--img4 {
  flex: 0 0 24%;
  min-width: 10rem;
  border-radius: 1.25rem;
  overflow: hidden;
}

.review-col--img1 :deep(img),
.review-col--img2 :deep(img),
.review-col--img3 :deep(img),
.review-col--img4 :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Motiv-Ausrichtung der neuen Fotos (Landscape-Original, hochkant beschnitten) */
.review-col--img3 :deep(img) { object-position: 60% 22%; }
.review-col--img4 :deep(img) { object-position: 52% 30%; }

/* Zitat-Spalte: 3×4 Grid — Deco | Quote | Attribution | Deco */
.review-col--quote {
  flex: 1 1 18rem;
  align-self: stretch;
  display: grid;
  grid-template-columns: 0.9375rem 1fr 0.9375rem;
  grid-template-rows: 1fr auto auto 1fr;
  column-gap: 4rem;
  row-gap: 1.875rem;
}

/* Gelbe Dekorquadrate — wie intro-section */
.review-deco {
  display: block;
  width: 0.9375rem;
  height: 0.9375rem;
  background: #ffcc00;
  border-radius: 0.1875rem;
  align-self: start;
}

.review-deco--tl { grid-column: 1; grid-row: 1; align-self: start; justify-self: start; }
.review-deco--tr { grid-column: 3; grid-row: 1; align-self: start; justify-self: end; }
.review-deco--bl { grid-column: 1; grid-row: 4; align-self: end; justify-self: start; }
.review-deco--br { grid-column: 3; grid-row: 4; align-self: end; justify-self: end; }

/* Zitat-Inhalt: SVG-Anführungszeichen inline im h2 */
.review-quote-content {
  grid-column: 2;
  grid-row: 2;
  position: relative;
  padding-top: 0.2rem;
}

.review-quote-mark svg {
  display: inline-block;
  width: clamp(0.75rem, 1.5vw, 1.25rem);
  height: auto;
}

/* Opening mark: absolut links außerhalb des h2-Blocks */
.review-quote-mark--open {
  position: absolute;
  right: calc(100% + 0.5rem);
  top: 0.5rem;
}

/* Closing mark: inline hinter dem letzten Buchstaben */
.review-quote-mark--close {
  display: inline-block;
  vertical-align: top;
  margin-left: 0.5rem;
  position: relative;
  top: -1.3rem;
}

/* Figma: 58.333px → ~3.625rem, line-height 65/58 ≈ 1.114 */
.review-quote-text {
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 900;
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1.114;
  color: #141414;
  margin: 0;
  /* Weiche Trennstellen (&shy;) standardmäßig ignorieren → Wortbild bleibt wie im Entwurf.
     Nur im Laptop-Band (Media-Query unten) wird die Trennung für Reihe 2 aktiviert. */
  -webkit-hyphens: none;
  hyphens: none;
}

/* Attribution: row 3 im 4-Zeilen-Grid */
.review-attribution {
  grid-column: 2;
  grid-row: 3;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 400;
  font-size: clamp(1rem, 1.8vw, 2.25rem);
  line-height: 1.25;
  color: #141414;
  margin: 0rem;
}

/* Laptop-Band: Desktop-Layout, aber zu schmal für 3 volle Spalten.
   Hier darf das lange Kompositum in Reihe 2 an seinen weichen Trennstellen (&shy;)
   brechen → der min-content der Zitat-Spalte sinkt, die Bilder bleiben im rechten Rand.
   Oberhalb (> 1400px) bleibt das Wortbild exakt wie im Entwurf. */
@media (min-width: 1025px) and (max-width: 1400px) {
  .review-row--quoteimg .review-quote-text {
    -webkit-hyphens: manual;
    hyphens: manual;
  }
}

/* Responsive: ab Tablet in zwei Zeilen, Bilder nebeneinander / Zitat drunter */
@media (min-width: 641px) and (max-width: 1024px) {
  .review-section {
    padding: 4rem 5%;
  }

  .review-row {
    flex-wrap: wrap; /* im Umbruch-Bereich wieder erlaubt */
    row-gap: 2.5rem;
  }

  /* (B) Reihe 2: Bilder zuerst, Zitat darunter (Zitat ans Ende sortiert) */
  .review-row--quoteimg .review-col--quote {
    order: 1;
  }

  .review-col--img1 {
    flex: 0 0 calc(45% - 0.5rem);
  }

  .review-col--img2 {
    flex: 0 0 calc(55% - 0.5rem);
  }

  .review-col--img3 {
    flex: 0 0 calc(52% - 0.5rem);
  }

  .review-col--img4 {
    flex: 0 0 calc(48% - 0.5rem);
  }

  .review-col--quote {
    flex: 0 0 100%;
    column-gap: 2.5rem;
  }

  .review-quote-text {
    font-size: clamp(2rem, 6vw, 3rem);
  }
}

/* Mobile: alles stackt vertikal */
@media (max-width: 640px) {
  .review-section {
    padding: 3rem 5%;
  }

  .review-row {
    flex-direction: column;
  }

  /* (B) Reihe 2: Bilder zuerst, Zitat darunter */
  .review-row--quoteimg .review-col--quote {
    order: 1;
  }

  .review-col--img1,
  .review-col--img2,
  .review-col--img3,
  .review-col--img4 {
    flex: 0 0 auto;
    width: 100%;
    /* einheitliche Bildhöhe wie Reihe 1 (445/426) — Motive füllen per object-fit: cover */
    aspect-ratio: 445 / 426;
    border-radius: 1.25rem;
    overflow: hidden;
  }

  .review-col--img1 img,
  .review-col--img2 img,
  .review-col--img3 img,
  .review-col--img4 img {
    border-radius: 1.25rem;
  }

  .intro-img-container,
  .intro-img-container img {
    border-radius: 1.25rem;
  }

  .static-preview,
  .static-preview img {
    border-radius: 1.25rem;
  }

  .review-col--quote {
    flex: 0 0 auto;
    width: 100%;
    column-gap: 1.25rem;
    row-gap: 2rem;
    padding: 1rem 0;
  }

  .review-quote-content { grid-column: 2; }
  .review-attribution   { grid-column: 2; }
}

/* --------------------------------------------------------------------------
 * CI Elements: Stools (Figma node 792:99)
 * Desktop: natürliche Größe, left-aligned bei ~9% (Figma: 181px/1920px)
 * Tablet: 50% Breite; Mobile: 100%
 * -------------------------------------------------------------------------- */
.ci-stools {
  margin-top: 4rem;
  margin-bottom: 6.5rem;
  padding-left: 9%;
}

:deep(.ci-stools__img) {
  display: block;
  width: auto;
  max-width: 50%;
  height: auto;
  pointer-events: none;
  user-select: none;
}

@media (min-width: 641px) and (max-width: 1024px) {
  .ci-stools {
    padding-left: 5%;
    margin-top: 1rem;
    margin-bottom: 4.5rem;
  }

  :deep(.ci-stools__img) {
    width: 60%;
  }
}

@media (max-width: 640px) {
  .ci-stools {
    padding-left: 0;
    padding-right: 0;
    margin-top: 0rem;
    margin-bottom: 4.5rem;
  }

  :deep(.ci-stools__img) {
    max-width: 80%;
    margin-left: 9%;
  }
}

/* --------------------------------------------------------------------------
 * Accordion section
 * -------------------------------------------------------------------------- */
/* --------------------------------------------------------------------------
 * Accordion section (Figma node 800:319)
 * Breite 85% wie intro-section, border-top pro Item, px 2.875rem / py 2.25rem
 * -------------------------------------------------------------------------- */
.accordion-section {
  width: 85%;
  margin: 0 auto 55rem;
}

.accordion-item {
  border-top: 1px solid rgba(20, 20, 20, 0.3);
  transition: opacity 0.4s ease;
}


.accordion-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 2.25rem 2.875rem;
  cursor: pointer;
}

/* h1 erbt globale font-size (clamp 2rem–3rem), line-height aus Figma: 72/58 ≈ 1.24 */
.accordion-header .item-title {
  flex: 1;
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 900;
  line-height: 1.24;
  color: #141414;
  margin: 0;
}

/* Arrow: dunkles Quadrat — Figma: #141414, 54px = 3.375rem, border-radius 10px = 0.625rem */
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

.is-active .icon-chevron-wrap {
  background: #9687FF;
}

.icon-chevron {
  width: 1.5625rem;
  transform-origin: center;
}

/* Content-Text: wie intro-section p */
.accordion-content {
  overflow: hidden;
  height: 0;
  opacity: 0;
  padding: 0 2.875rem 1rem;
}

.accordion-content p {
  margin: 0 0 2rem;
  color: #141414;
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  line-height: 1.375;
  letter-spacing: -0.015625rem;
  width: 80%;
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

/* Transparent-Parent + Absolute-Child Pattern für iOS Safari Toolbar:
   Safari skippt transparent fixed Elements UND deren absolute Children
   beim Color-Tinting. */
.bottom-menu-frame {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 0;
  pointer-events: none;
  background: transparent;
  z-index: 2000;
}

:deep(.bottom-menu.bottom-menu-absolute) {
  position: absolute !important;
  pointer-events: auto;
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
  .landing-container h1 {
    font-size: clamp(2rem, 6vw, 3rem);
  }

  /* Hero Tablet: kompakteres Verhältnis, Stühle etwas komprimiert */
  .hero-container {
    aspect-ratio: 4 / 3;
  }

  .hero-chairs-top {
    left: 20%;
    width: 86%;
    height: 55%;
    transform: scale(1.3) translateX(1.7rem) translateY(-0.7rem);
  }

  .hero-chairs-bottom {
    transform: scale(1.2) translateX(-1.5rem) translateY(2rem);
  }


  .intro-section {
    flex-direction: column;
    gap: 2.5rem;
    padding: 0rem 5% 8rem 5%;
  }

  .intro-img-container {
    flex: 0 0 auto;
    width: 100%;
  }

  .static-preview {
    width: 90%;
    margin: 0 auto 4rem;
  }

  .static-caption {
    width: 90%;
    margin: 5rem auto 6rem;
    gap: 2rem;
  }

  .caption-title {
    padding-left: 1rem;
  }

  .caption-text {
    flex: 0 0 54%;
  }

  .accordion-section {
    width: 90%;
    margin: 0 auto 54rem;
  }

  .accordion-header {
    padding: 1.75rem 1.5rem;
    gap: 2.2rem;
  }

  .accordion-content {
    padding: 0 1.5rem 1rem;
  }
}

/* --------------------------------------------------------------------------
 * Desktop special (1025px – 1300px)
 * -------------------------------------------------------------------------- */
@media (min-width: 1025px) {
  .accordion-header {
    padding: 3rem 0rem;
  }

  .accordion-content {
    padding: 0rem 0rem 0rem;
  }

  .accordion-content p {
    margin: 0 0 4rem;
  }

  :deep(.ci-stools__img) {
    max-width: 40%;
  }
}

@media (min-width: 1025px) and (max-width: 1300px) {
  .intro-section {
    gap: 5rem;
  }

  .intro-img-container {
    flex: 0 0 38%;
  }

  .static-preview {
    margin: 0 auto 4rem;
  }
}

/* --------------------------------------------------------------------------
 * Smartphone (max-width: 640px)
 * -------------------------------------------------------------------------- */
@media (max-width: 640px) {
  /* Hero: höheres Seitenverhältnis auf Mobile */
  .hero-container {
    aspect-ratio: 3 / 5;
  }

  .hero-logo {
    left: 0;
    right: 0;
    width: 100%;
    text-align: center;
  }

  .hero-logo img {
    width: 90%;
    margin: 0 auto;
  }

  .hero-container {
    overflow: visible;
  }

  .hero-chairs-top {
    position: static;
    left: 20%;
    width: 86%;
    height: 25%;
    transform: scale(2) translateX(5.5rem) translateY(2rem);
  }

  .hero-chairs-bottom {
    transform: scale(1.9) translateX(2.5rem) translateY(2rem);
  }

  .hero-chairs-third {
    display: flex;
    position: absolute;
    left: 22%;
    top: 64%;
    width: 86%;
    height: 25%;
    align-items: stretch;
    transform: scaleX(-1) scale(2) translateX(2.35rem) translateY(0rem);
  }

  :deep(.hero-chairs-third__item) {
    flex: 1 1 0;
    min-width: 0;
    min-height: 0;
    object-fit: contain;
    object-position: bottom;
    display: block;
    pointer-events: none;
    user-select: none;
  }

  /* Intro: einspaltiger Stack */
  .intro-section {
    flex-direction: column;
    gap: 2rem;
    padding: 3rem 5% 6rem 5%;
    row-gap: 1rem;
  }

  .intro-img-container {
    flex: 0 0 auto;
    width: 100%;
    padding-bottom: 2rem;
  }

  /* Mobile: gleiche Struktur wie review-col--quote — Grid-Rows aus Base behalten,
     nur Spacing + Spalten-Snap auf 100% Breite */
  .intro-text {
    flex: 0 0 auto;
    width: 100%;
    column-gap: 1rem;
    row-gap: 2rem;
    padding: 1rem 0;
  }

  .intro-body--dt {
    display: none;
  }

  .intro-body--mb {
    display: block;
    margin: auto 0.5rem auto 1.5rem;
  }

  .intro-heading {
    grid-column: 2;
    transform: none !important;
  }

  /* Static preview */
  .static-preview {
    width: auto;
    height: 30rem;
    margin: 0 5% 2rem;
  }

  .static-preview img {
    width: 115%;
    height: 100%;
    display: block;
    pointer-events: none;
    object-fit: cover;
    object-position: center -2rem;
    transform: scale(1.5);
    will-change: transform;
  }

  /* Caption unter Gallery */
  .static-caption {
    width: auto;
    flex-direction: column;
    gap: 1.5rem;
    padding: 3rem 5% 3rem 2%;
    margin: 0rem 0.5rem 0rem 1.5rem;
  }

  .caption-title {
    padding-left: 0;
  }

  .caption-text {
    flex: none;
    width: 100%;
  }

  /* Accordion */
  .accordion-section {
    width: 95%;
    margin: 0 auto 45rem;
  }

  .accordion-header {
    padding: 1.5rem 1rem;
  }

  .icon-chevron-wrap {
    width: 3rem;
    height: 3rem;
  }

  .accordion-content {
    padding: 0 1rem 0.5rem;
  }

  .accordion-content p {
    font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
    line-height: 1.375;
    margin: 0 0 2rem;
    width: 100%;
  }
}
</style>
