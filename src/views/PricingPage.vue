<script setup>
/* ============================================================================
 * Imports
 * ===========================================================================*/
import { ref, reactive, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useHead } from '@vueuse/head'
import gsap from 'gsap'

import { usePricingStore } from '@/stores/pricing'
import { track, trackDebounced, attachScrollDepthTracker } from '@/utils/tracking'
import SiteFooter from '@/components/SiteFooter.vue'
import InlineLink from '@/components/InlineLink.vue'

import pulkArrow from '@/assets/pulk-arrow-accordeon_e2.svg'
import pulkLogo from '@/assets/pulk-logo_E2.svg'
import chairYellow from '@/assets/pulk_pricing-chair-yellow-a_E2.png?format=avif;webp;png&as=picture'
import brushBusiness from '@/assets/brush-line-business.png?w=800&format=webp&as=src'
import brushCommunity from '@/assets/brush-line-community.png?w=800&format=webp&as=src'

/* ============================================================================
 * SEO / Meta
 * ===========================================================================*/
useHead({
  title: 'Preise & Pakete – Workshopraum PULK in Halle (Saale)',
  link: [
    { rel: 'canonical', href: 'https://pulk.space/preise/' }
  ],
  meta: [
    {
      name: 'description',
      content:
        'Community-Paket ab 20 €/h, Business-Paket ab 50 €/h. Direkte Preisauskunft auf unserer Webseite, Stundenweise mieten, ohne Mindestbuchung, ohne Cateringpflicht.'
    },
    { name: 'robots', content: 'index,follow' },
    {
      property: 'og:title',
      content: 'PULK Preise & Pakete – Workshopraum Halle (Saale)'
    },
    {
      property: 'og:description',
      content:
        'Community ab 20 €/h, Business ab 50 €/h. Stundenweise mietbar, ohne Mindestbuchung, ohne Cateringpflicht.'
    },
    { property: 'og:url', content: 'https://pulk.space/preise/' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Preise & Pakete für den Workshopraum PULK in Halle (Saale)',
        description:
          'Workshopraum und Seminarraum in Halle (Saale) mieten — Business-Paket für Unternehmen, Community-Paket für Vereine, Initiativen und Einzelpersonen. Stundenweise buchbar, ohne Mindestbuchung. Direkte Preisauskunft auf der Webseite.',
        brand: 'PULK',
        image: 'https://pulk.space/pulk-og-image_2025.jpg',
        offers: [
          {
            '@type': 'Offer',
            name: 'Business-Paket (Basispreis pro Stunde)',
            price: '50',
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: 50,
              priceCurrency: 'EUR',
              unitCode: 'HUR'
            },
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2026-12-31'
          },
          {
            '@type': 'Offer',
            name: 'Business-Paket (Basispreis pro Tag/Anlass)',
            price: '350',
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: 350,
              priceCurrency: 'EUR',
              unitCode: 'DAY'
            },
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2026-12-31'
          },
          {
            '@type': 'Offer',
            name: 'Community-Paket (Basispreis pro Stunde)',
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              minPrice: 20,
              priceCurrency: 'EUR',
              unitCode: 'HUR'
            },
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2026-12-31'
          }
        ],
        url: 'https://pulk.space/preise/'
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': 'https://pulk.space/preise/#faq',
        url: 'https://pulk.space/preise/',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Was wenn kein Paket passt?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Schreibt uns, was ihr vorhabt. Ob spezielles Ausstellungskonzept, Lesungsreihe oder ein anderes Kulturformat. Wir schauen gemeinsam, was sich im Pulk realisieren lässt. Teilt uns eure Idee über das Anfrageformular mit, dann stecken wir die Köpfe zusammen und versuchen, ein passendes Konzept mit euch zu finden.'
            }
          },
          {
            '@type': 'Question',
            name: 'Kann ich Catering oder Getränke organisieren?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Ihr organisiert das Catering selbst. Entweder über eigene Anbieter oder über unsere lokalen Partner: Anna Müller für vegetarisches und veganes Catering, Gunnar Franke für Getränke, beide in der Burgstraße. Die Teeküche im Raum steht euch zur Verfügung, inklusive Ceran-Kochfeld und Geschirr.'
            }
          },
          {
            '@type': 'Question',
            name: 'Was passiert bei einer Stornierung?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Business-Paket: Bis 48 Stunden vor dem vereinbarten Termin könnt ihr kostenlos stornieren. Bei späterer Stornierung stellen wir 50 % des vereinbarten Entgelts inkl. MwSt. in Rechnung. Community-Paket: Bis 48 Stunden vor dem vereinbarten Termin könnt ihr kostenlos stornieren. Sollten auf unserer Seite bereits Aufwände für Vorbereitung oder Kommunikation entstanden sein, behalten wir uns vor, bis zu 20 % des vereinbarten Entgelts inkl. MwSt. in Rechnung zu stellen. Bei Nichterscheinen zum vereinbarten Termin werden bei beiden Paketen 50 % des vereinbarten Entgelts inkl. MwSt. fällig.'
            }
          },
          {
            '@type': 'Question',
            name: 'Habt ihr einen Veranstaltungsservice?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Wir unterstützen euch bei der Planung und Vorbereitung des Raums. Wir geben Ideen für die Aufstellung und zeigen euch, wo ihr alles Wichtige im Raum findet. Alles im Rahmen unserer Möglichkeiten und Kapazitäten. Wir unterstützen euch, den Raum ideal vorzubereiten, übernehmen aber nicht eure komplette Planung. Für die darüber hinausgehende Veranstaltungsplanung vermitteln wir gerne an den Service „Besser Tagen" des Stadtmarketings Halle (Saale).'
            }
          }
        ]
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Start', item: 'https://pulk.space/' },
          { '@type': 'ListItem', position: 2, name: 'Preise & Pakete', item: 'https://pulk.space/preise/' }
        ]
      })
    }
  ]
})

/* ============================================================================
 * Stores
 * ===========================================================================*/
const pricing = usePricingStore()

/* ============================================================================
 * Price plans (Business + Community only — Individuell → FAQ)
 * ===========================================================================*/
const pricingPlans = pricing.plans.filter(p => p.key !== 'individuell')

/* ============================================================================
 * Preiskalkulator
 * ===========================================================================*/
const calc = reactive(
  Object.fromEntries(
    pricingPlans
      .filter(p => p.tiers?.length)
      .map(p => [p.key, { persons: 1, hours: 1 }])
  )
)

function stepPersons(planKey, delta) {
  const plan = pricing.plans.find(p => p.key === planKey)
  const max = plan.tiers[plan.tiers.length - 1].maxPersons
  calc[planKey].persons = Math.max(1, Math.min(max, calc[planKey].persons + delta))
  trackPricingAdjust(planKey)
}

function stepHours(planKey, delta) {
  calc[planKey].hours = Math.max(1, Math.min(8, calc[planKey].hours + delta))
  trackPricingAdjust(planKey)
}

function trackPricingAdjust(planKey) {
  const c = calc[planKey]
  trackDebounced('pulk.pricing.adjust', {
    package: planKey,
    persons: c.persons,
    hours: c.hours,
    total: pricing.calculatePrice(planKey, c.persons, c.hours),
    source: 'pricing-page'
  })
}

function calcTotal(planKey) {
  const c = calc[planKey]
  return pricing.calculatePrice(planKey, c.persons, c.hours)
}

function hoursLabel(planKey) {
  const h = calc[planKey].hours
  if (h >= 8) return 'Ganztag (8 Std.)'
  return h === 1 ? '1 Stunde' : `${h} Stunden`
}

function personsLabel(planKey) {
  const p = calc[planKey].persons
  return p === 1 ? '1 Person' : `${p} Personen`
}

/* ============================================================================
 * Card detail toggle
 * ===========================================================================*/
const expandedPlan = ref(null)
const cardDetailRefs = {}
const cardArrowRefs = {}

async function togglePlan(key) {
  const willOpen = expandedPlan.value !== key
  expandedPlan.value = willOpen ? key : null
  if (willOpen) {
    track('pulk.pricing.expand-card', { package: key, source: 'pricing-page' })
  }
  await nextTick()
  const el = cardDetailRefs[key]
  const arrowEl = cardArrowRefs[key]
  if (!el || !arrowEl) return
  if (willOpen) {
    gsap.set(el, { height: 0, opacity: 0 })
    gsap.to(arrowEl, { rotation: 180, duration: 0.2, ease: 'power1.out' })
    gsap.to(el, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power1.out' })
  } else {
    gsap.to(arrowEl, { rotation: 0, duration: 0.4, ease: 'power1.in' })
    gsap.to(el, { height: 0, opacity: 0, duration: 0.4, ease: 'power1.in' })
  }
}

/* ============================================================================
 * FAQ Accordion
 * ===========================================================================*/
const openFaqIndex = ref(null)
const faqContentRefs = []
const faqArrowRefs = []

const faqItems = [
  {
    q: 'Was wenn kein Paket passt?',
    parts: [
      { text: 'Schreibt uns, was ihr vorhabt. Ob spezielles Ausstellungskonzept, Lesungsreihe oder ein anderes Kulturformat. Wir schauen gemeinsam, was sich im Pulk realisieren lässt. Teilt uns eure Idee über das ' },
      { text: 'Anfrageformular', to: '/anfragen' },
      { text: ' mit, dann stecken wir die Köpfe zusammen und versuchen, ein passendes Konzept mit euch zu finden.' }
    ]
  },
  {
    q: 'Kann ich Catering oder Getränke organisieren?',
    a: 'Ihr organisiert das Catering selbst. Entweder über eigene Anbieter oder über unsere lokalen Partner: Anna Müller für vegetarisches und veganes Catering, Gunnar Franke für Getränke, beide in der Burgstraße. Die Teeküche im Raum steht euch zur Verfügung, inklusive Ceran-Kochfeld und Geschirr.'
  },
  {
    q: 'Was passiert bei einer Stornierung?',
    a: `Business-Paket: Bis 48 Stunden vor dem vereinbarten Termin könnt ihr kostenlos stornieren. Bei späterer Stornierung stellen wir 50 % des vereinbarten Entgelts inkl. MwSt. in Rechnung.
    Community-Paket: Bis 48 Stunden vor dem vereinbarten Termin könnt ihr kostenlos stornieren. Sollten auf unserer Seite bereits Aufwände für Vorbereitung oder Kommunikation entstanden sein, behalten wir uns vor, bis zu 20 % des vereinbarten Entgelts inkl. MwSt. in Rechnung zu stellen.
    Bei Nichterscheinen zum vereinbarten Termin werden bei beiden Paketen 50 % des vereinbarten Entgelts inkl. MwSt. fällig.`
  },
  {
    q: 'Habt ihr einen Veranstaltungsservice?',
    a: 'Wir unterstützen euch bei der Planung und Vorbereitung des Raums. Wir geben Ideen für die Aufstellung und zeigen euch, wo ihr alles Wichtige im Raum findet. Alles im Rahmen unserer Möglichkeiten und Kapazitäten. Wir unterstützen euch, den Raum ideal vorzubereiten, übernehmen aber nicht eure komplette Planung. Für die darüber hinausgehende Veranstaltungsplanung vermitteln wir gerne an den Service „Besser Tagen" des Stadtmarketings Halle (Saale).'
  }
]

async function toggleFaq(i) {
  const willOpen = openFaqIndex.value !== i
  openFaqIndex.value = willOpen ? i : null
  if (willOpen) {
    track('pulk.faq.open', { section: faqItems[i]?.q || '', page: 'pricing' })
  }
  await nextTick()
  const el = faqContentRefs[i]
  const arrowEl = faqArrowRefs[i]
  if (!el || !arrowEl) return
  if (willOpen) {
    gsap.set(el, { height: 0, opacity: 0 })
    gsap.to(arrowEl, { rotation: 180, duration: 0.2, ease: 'power1.out' })
    gsap.to(el, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power1.out' })
  } else {
    gsap.to(arrowEl, { rotation: 0, duration: 0.4, ease: 'power1.in' })
    gsap.to(el, { height: 0, opacity: 0, duration: 0.4, ease: 'power1.in' })
  }
}

/* ============================================================================
 * GSAP Page Reveal
 * ===========================================================================*/
const rootRef = ref(null)
let tl = null

/* ============================================================================
 * Footer-Lift für fixed Close-Button
 * ===========================================================================*/
const footerSentinelRef = ref(null)
const btnLift = ref(0)
let scrollCleanup = null
let scrollDepthCleanup = null
let brushObserver = null

function updateLift() {
  const sentinel = footerSentinelRef.value
  if (!sentinel) return
  const rect = sentinel.getBoundingClientRect()
  const vh = window.innerHeight
  btnLift.value = Math.max(0, vh - rect.top)
}

onMounted(async () => {
  await nextTick()
  const root = rootRef.value
  if (!root) return

  window.addEventListener('scroll', updateLift, { passive: true })
  scrollCleanup = () => window.removeEventListener('scroll', updateLift)

  // Scroll-Depth Tracking (pulk.scroll.depth) — window-scroll
  scrollDepthCleanup = attachScrollDepthTracker('pricing')

  // Brush-Reveal auf Touch/Mobile: Card beim Viewport-Eintritt markieren
  // (Desktop nutzt reines CSS :hover). Einmalig pro Card, dann unobserve.
  brushObserver = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('is-inview')
        brushObserver.unobserve(e.target)
      }
    })
  }, { threshold: 0.4 })
  root.querySelectorAll('.pm-card-wrap').forEach((el) => brushObserver.observe(el))

  const cards = [...root.querySelectorAll('.card')]
  if (!cards.length) return

  tl?.kill()
  tl = gsap.timeline({
    defaults: { duration: 0.35, ease: 'power2.out' },
    delay: 0.25
  })

  gsap.set(cards, { opacity: 0, y: 32, willChange: 'transform,opacity' })

  tl.to(cards, {
    opacity: 1,
    y: 0,
    stagger: {
      each: 0.25,
      onStart() {
        const card = this.targets()[0]
        const chunks = card.querySelectorAll(
          '.card-header, .pm-card-price, .pm-card-desc'
        )
        gsap.set(chunks, { opacity: 0, y: 10, willChange: 'transform,opacity' })
        gsap.to(chunks, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          clearProps: 'willChange'
        })
      }
    },
    clearProps: 'willChange'
  })
})

/* ============================================================================
 * Cleanup
 * ===========================================================================*/
onBeforeUnmount(() => {
  tl?.kill()
  tl = null
  scrollCleanup?.()
  scrollDepthCleanup?.()
  brushObserver?.disconnect()
})
</script>

<template>
  <main ref="rootRef" class="pricing-page">
    <!-- Fixed close button — lifts above footer when scrolled down -->
    <router-link
      to="/"
      class="pp-close-btn"
      :style="{ '--pp-btn-lift': `${btnLift}px` }"
    >
      <span>Schließen</span>
      <span class="pp-close-icon">✕</span>
    </router-link>

    <!-- ======================================================================
         HERO: Intro + Preiskarten
         ====================================================================== -->
    <!-- Topbar: Logo + preise-Pille (echtes H1 mit unsichtbaren Keywords für Crawler/SEO) -->
    <header class="pm-topbar">
      <img :src="pulkLogo" class="pm-logo" alt="PULK" width="169" height="92" />
      <h1 class="pm-pill">
        <span class="pm-pill-label">preise</span>
        <span class="sr-only"> – Workshopraum, Seminarraum &amp; Tagungsraum in Halle (Saale) mieten</span>
      </h1>
    </header>

    <!-- Preis-Leittext (Prosa — beantwortet „Was kostet der Raum?") + Stühle -->
    <section class="pm-lead">
      <p class="pm-lead-text">
        Der Preis richtet sich nach dem Paket und der Größe der Gruppe. Anhand der
        Kriterien könnt ihr direkt ausrechnen, wie viel der Raum kostet. Im Überblick: Das
        Business-Paket beginnt bei 50 Euro pro Stunde; der Tagessatz startet bei 350 Euro.
        Das Community-Paket startet ab 20 Euro pro Stunde; Tagessatz ab 140 Euro. Alle Preise
        zzgl. 19% MwSt.
      </p>
      <div class="pm-lead-chairs" aria-hidden="true">
        <img :src="chairYellow.img.src" class="pm-lead-chair pm-lead-chair--b" alt="" loading="lazy" decoding="async" />
        <img :src="chairYellow.img.src" class="pm-lead-chair pm-lead-chair--a" alt="" loading="lazy" decoding="async" />
      </div>
    </section>

    <!-- Preiskarten (Business + Community) -->
    <section class="pm-cards">
        <div
          v-for="plan in pricingPlans"
          :key="plan.key"
          class="pm-card-wrap"
        >
          <!-- Karte -->
          <div class="card pm-card">
            <header class="card-header pm-card-header">
              <h2 class="pm-card-title">
                <span class="pm-card-title-text">{{ plan.key === 'gruppen' ? 'Community' : plan.title }}</span>
                <img
                  class="pm-card-brush"
                  :src="plan.key === 'gruppen' ? brushCommunity : brushBusiness"
                  alt=""
                  aria-hidden="true"
                />
              </h2>
              <p class="pm-card-desc">
                <template v-if="plan.key === 'gruppen'">Vereine, Initiativen, freie Gruppen, Einzelpersonen bis 25 Personen.</template>
                <template v-else-if="plan.key === 'business'">Unternehmen, Agenturen, Verbände, Stiftungen, Unis und Hochschulen bis 40 Personen.</template>
                <template v-else>{{ plan.context }} {{ plan.maxPersons }}</template>
              </p>
            </header>
            <div class="card-price pm-card-price">
              <span class="pm-price-amount"><span class="pm-price-prefix">ab</span> {{ plan.price }} EUR</span>
              <span class="pm-price-unit">/Stunde</span>
            </div>

            <!-- Preiskalkulator -->
            <div v-if="plan.tiers?.length" class="pm-calc">
              <div class="pm-calc-row">
                <button class="pm-step-btn" type="button" :disabled="calc[plan.key].persons <= 1" @click="stepPersons(plan.key, -1)">−</button>
                <span class="pm-calc-label">{{ personsLabel(plan.key) }}</span>
                <button class="pm-step-btn" type="button" :disabled="calc[plan.key].persons >= plan.tiers[plan.tiers.length - 1].maxPersons" @click="stepPersons(plan.key, 1)">+</button>
              </div>
              <div class="pm-calc-row">
                <button class="pm-step-btn" type="button" :disabled="calc[plan.key].hours <= 1" @click="stepHours(plan.key, -1)">−</button>
                <span class="pm-calc-label">{{ hoursLabel(plan.key) }}</span>
                <button class="pm-step-btn" type="button" :disabled="calc[plan.key].hours >= 8" @click="stepHours(plan.key, 1)">+</button>
              </div>
              <div class="pm-calc-total">
                <span class="pm-calc-total-label">{{ calc[plan.key].hours >= 8 ? 'Tagessatz' : 'Gesamt' }}</span>
                <span class="pm-calc-total-price">{{ calcTotal(plan.key) }} EUR</span>
              </div>
            </div>
          </div>

          <!-- Details-Toggle + Expanded (gemeinsame Border) -->
          <div class="pm-toggle-wrap">
            <button
              class="pm-toggle"
              type="button"
              :aria-expanded="expandedPlan === plan.key"
              @click="togglePlan(plan.key)"
            >
              <span class="pm-toggle-label">Details anzeigen</span>
              <div class="pm-chevron-wrap">
                <img
                  :src="pulkArrow"
                  :ref="el => { if (el) cardArrowRefs[plan.key] = el }"
                  class="pm-chevron"
                  alt=""
                  aria-hidden="true"
                />
              </div>
            </button>

            <div
              class="pm-details"
              :ref="el => { if (el) cardDetailRefs[plan.key] = el }"
            >
              <ul class="pm-features-list">
                <li v-for="(f, i) in plan.features" :key="i">
                  <span class="pm-feature-dot"></span>{{ f }}
                </li>
              </ul>
              <template v-if="plan.onRequest?.length">
                <p class="pm-features-heading">Auf Anfrage:</p>
                <ul class="pm-features-list">
                  <li v-for="(f, i) in plan.onRequest" :key="i">
                    <span class="pm-feature-dot"></span>{{ f }}
                  </li>
                </ul>
              </template>
            </div>
          </div>
        </div>
    </section>

    <!-- ======================================================================
         Preisübersicht als maschinenlesbare Tabelle (sr-only) — für Crawler/KI.
         Der interaktive Rechner oben deckt dieselben Werte visuell ab; diese
         semantische <table> macht die Preis-Matrix direkt extrahierbar, ohne
         dass ein Bot den JS-Rechner ausführen muss. Quelle: pricingStore.plans →
         bleibt automatisch synchron mit den sichtbaren Preisen.
         ====================================================================== -->
    <div class="sr-only">
      <table>
        <caption>
          Preisübersicht Workshop- und Seminarraum pulk in Halle (Saale) — alle Preise zzgl. 19 % MwSt., Tagessatz ab 7 Stunden
        </caption>
        <thead>
          <tr>
            <th scope="col">Paket</th>
            <th scope="col">Gruppengröße</th>
            <th scope="col">Stundensatz</th>
            <th scope="col">Tagessatz (ab 7 Stunden)</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="plan in pricingPlans" :key="`pt-${plan.key}`">
            <tr v-for="tier in plan.tiers" :key="`pt-${plan.key}-${tier.maxPersons}`">
              <td>{{ plan.title }}</td>
              <td>bis {{ tier.maxPersons }} Personen</td>
              <td>{{ tier.hourRate }} € / Stunde</td>
              <td>{{ tier.dayRate }} €</td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- ======================================================================
         FAQ Accordion
         ====================================================================== -->
    <section class="pm-faq">
      <!-- Section-Titel-Box „faq" (wie LandingPage) -->
      <h2 class="pm-faq-label">faq</h2>
      <div
        v-for="(item, i) in faqItems"
        :key="i"
        class="pm-faq-item"
        :class="{ 'pm-faq-item--active': openFaqIndex === i }"
      >
        <div
          class="pm-faq-header"
          role="button"
          tabindex="0"
          :aria-expanded="openFaqIndex === i"
          @click="toggleFaq(i)"
          @keydown.enter="toggleFaq(i)"
          @keydown.space.prevent="toggleFaq(i)"
        >
          <h2 class="pm-faq-question">{{ item.q }}</h2>
          <span
            class="pm-faq-icon"
            :ref="el => { if (el) faqArrowRefs[i] = el }"
            aria-hidden="true"
          >
            <span class="pm-faq-icon-bar pm-faq-icon-bar--h"></span>
            <span class="pm-faq-icon-bar pm-faq-icon-bar--v"></span>
          </span>
        </div>
        <div
          class="pm-faq-content"
          :ref="el => { if (el) faqContentRefs[i] = el }"
        >
          <p v-if="item.parts">
            <template v-for="(seg, sIdx) in item.parts" :key="sIdx">
              <InlineLink v-if="seg.to" :to="seg.to">{{ seg.text }}</InlineLink>
              <template v-else>{{ seg.text }}</template>
            </template>
          </p>
          <p v-else>{{ item.a }}</p>
        </div>
      </div>
    </section>

    <div ref="footerSentinelRef"></div>
    <div class="pp-footer-wrap">
      <SiteFooter
        instagram-url="https://www.instagram.com/pulk.space"
        impressum-href="/impressum/"
        datenschutz-href="/datenschutz/"
        company="Pulk"
      />
    </div>
  </main>
</template>

<style scoped>
/* ============================================================================
 * Base Layout
 * ============================================================================*/
.pricing-page {
  background: #e7e8ec;
  min-height: 100dvh;
  position: relative;
  box-sizing: border-box;
  font-family: 'LayGrotesk', sans-serif;
  padding: 3.3rem 5.8% 8rem;
}

/* border-box für alle Kinder — sonst addieren padding-inline + width:100%
   (content-box) und die Cards laufen im Mobile rechts aus dem Viewport. */
.pricing-page * {
  box-sizing: border-box;
}

/* sr-only: visuell verborgen, aber für Crawler/Screenreader lesbar */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Fixed close button */
.pp-close-btn {
  position: fixed;
  left: 50%;
  bottom: calc(2rem + env(safe-area-inset-bottom, 0px) + var(--pp-btn-lift, 0px));
  transform: translateX(-50%);
  transition: bottom 0.3s ease, transform 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 1rem;
  background: #ED691C;
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

.pp-close-btn:hover {
  transform: translateX(-50%) scale(1.05);
}

.pp-close-icon {
  font-size: 1rem;
}

/* ============================================================================
 * Topbar: Logo + preise-Pille (H1)
 * ============================================================================*/
.pm-topbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 6.5rem;
}

.pm-logo {
  height: clamp(3.25rem, 4.8vw, 5.75rem);
  width: auto;
  display: block;
}

.pm-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: clamp(3.25rem, 4.8vw, 5.75rem);
  padding: 0 1rem;
  border: 0.125rem solid #141414;
  border-radius: 0.9rem;
  margin: 0;
}

.pm-pill-label {
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 400;
  font-size: clamp(1.75rem, 2.6vw, 3.125rem);
  line-height: 1;
  color: #141414;
}

/* ============================================================================
 * Preis-Leittext (Prosa) + Stühle
 * ============================================================================*/
.pm-lead {
  display: flex;
  flex-wrap: wrap-reverse;      /* wird es zu eng, wrappen die Stühle ÜBER den Text (volle Breite) */
  align-items: flex-end;
  margin: 12rem 0 0;
}

.pm-lead-text {
  flex: 1 1 28rem;
  max-width: 51.5rem;
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  font-weight: 400;
  line-height: 1.375;
  letter-spacing: -0.015625rem;
  color: #141414;
  margin: 0;
}

/* Stühle als eigener Block: neben dem Text rechts, beim Wrappen volle Breite über dem Text */
.pm-lead-chairs {
  flex: 1 1 auto;
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  gap: 0;
  pointer-events: none;
}

.pm-lead-chair {
  height: auto;
  object-fit: contain;
  display: block;
  width: clamp(19rem, 22vw, 23rem);
}

.pm-lead-chair--a {
  margin-left: -3rem;
}

/* Desktop (breit, nicht gewrappt): Stühle hoch bis auf Höhe der Logo/preise-Kante ziehen */
@media (min-width: 75rem) {
  .pm-lead-chairs {
    align-self: flex-start;
    margin-top: -15rem;
  }
}

/* Tablet + Mobile: Stühle nehmen volle Breite ein und shrinken proportional (%),
   statt fixem clamp — sonst werden sie an den Rändern abgeschnitten. */
@media (max-width: 64rem) {
  .pm-lead {
    margin: 4rem 0 0;   /* Topbar→Inhalt 4rem (About-Referenz) */
    gap: 2rem;          /* vertikaler Abstand Stühle ↔ Text beim Wrappen */
  }

  .pm-lead-chairs {
    width: 100%;
    justify-content: center;
    align-self: auto;
    margin-top: 0;
  }

  .pm-lead-chair {
    width: 44%;
  }

  .pm-lead-chair--a {
    margin-left: -2%;
  }
}

/* Cards */
.pm-cards {
  display: flex;
  gap: 3.25rem;
  align-items: stretch;
  width: 100%;
  margin-top: 7rem;
  margin-bottom: 5rem;
}

.pm-card-wrap {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 1.625rem;
}

/* Card */
.card.pm-card {
  border: 0.125rem solid rgba(20, 20, 20, 0.3);
  border-radius: 1.25rem;
  padding: 2rem 3rem;
  display: flex;
  flex-direction: column;
  min-height: 37rem;
  background: transparent;
  box-shadow: none;
  transition: border-color 0.35s ease 0.06s;
}

/* Hover: Border der Karte + Details-Box wird voll deckend (#141414), smooth + minimaler Delay */
.pm-card-wrap:hover .card.pm-card,
.pm-card-wrap:hover .pm-toggle-wrap {
  border-color: #141414;
}

.pm-card-header {
  flex: 1;
}

.pm-card-title {
  font-size: clamp(2.5rem, 3.5vw, 3.625rem);
  font-weight: 900;
  line-height: 1.1;
  color: #141414;
  margin: 0.75rem 0 2.125rem;
  position: relative;
  display: inline-block;   /* schrumpft auf die Wortbreite → Brush spannt das Wort, nicht die Card */
}

/* Titel-Text liegt ÜBER dem Brush */
.pm-card-title-text {
  position: relative;
  z-index: 1;
}

/* Brush-Akzent HINTER der Headline — Reveal links→rechts via clip-path.
   Desktop: bei Card-Hover (@media hover). Touch/Mobile: bei Viewport-Eintritt (.is-inview). */
.pm-card-brush {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 112%;
  height: auto;
  z-index: 0;
  pointer-events: none;
  clip-path: inset(0 100% 0 0);              /* von rechts zugeklappt → 0 % sichtbar */
  transition: clip-path 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@media (hover: hover) {
  .pm-card-wrap:hover .pm-card-brush { clip-path: inset(0 0 0 0); }
}

@media (hover: none) {
  .pm-card-wrap.is-inview .pm-card-brush { clip-path: inset(0 0 0 0); }
}

.pm-card-desc {
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  font-weight: 400;
  line-height: 1.375;
  letter-spacing: -0.015625rem;
  color: #141414;
  margin: 0;
}

.card-price.pm-card-price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 2rem;
}

.pm-price-amount {
  font-size: clamp(1.75rem, 2.25vw, 2.25rem);
  font-weight: 900;
  color: #141414;
  line-height: 1;
}

.pm-price-unit {
  font-size: clamp(1rem, 1.5vw, 1.6875rem);
  font-weight: 400;
  color: #141414;
}

.pm-price-prefix {
  font-size: clamp(1rem, 1.5vw, 1.6875rem);
  font-weight: 400;
}

/* Wrapper trägt die Border — Toggle und Details sind borderlos darin */
.pm-toggle-wrap {
  border: 0.125rem solid rgba(20, 20, 20, 0.3);
  border-radius: 1.25rem;
  overflow: hidden;
  transition: border-color 0.35s ease 0.06s;
}

/* Details toggle button */
.pm-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: none;
  padding: 1.625rem 2.1875rem;
  background: transparent;
  cursor: pointer;
  font-family: 'LayGrotesk', sans-serif;
  transition: background 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.pm-toggle:hover {
  background: rgba(20, 20, 20, 0.04);
}

.pm-toggle:focus {
  outline: none;
}

.pm-toggle:focus-visible {
  outline: 2px solid #141414;
  outline-offset: 2px;
}

.pm-toggle-label {
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  font-weight: 400;
  color: #141414;
  letter-spacing: -0.015625rem;
}

.pm-chevron-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 3.375rem;
  height: 3.375rem;
  background: #141414;
  border-radius: 0.625rem;
}

.pm-chevron {
  width: 1.5625rem;
  transform-origin: center;
}

/* Expanded details */
.pm-details {
  overflow: hidden;
  height: 0;
  opacity: 0;
  padding: 0 2.1875rem;
}

.pm-features-list {
  list-style: none;
  margin: 1.5rem 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.pm-features-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  color: #141414;
  line-height: 1.4;
}

.pm-feature-dot {
  flex-shrink: 0;
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: #141414;
}

.pm-features-heading {
  font-size: 1rem;
  font-weight: 400;
  color: #141414;
  margin: 0.5rem 0 0.5rem;
}

/* ============================================================================
 * FAQ Accordion
 * ============================================================================*/
.pm-summary {
  width: 100%;
  max-width: 55rem;
  margin-top: 3rem;
}
.pm-summary-title {
  font-size: clamp(1.8rem, 5vw, 3rem);
  font-weight: 900;
  line-height: 1.2;
  color: #141414;
  margin: 0 0 1.5rem;
}
.pm-summary-text {
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  font-weight: 400;
  line-height: 1.375;
  letter-spacing: -0.015625rem;
  color: #141414;
  margin: 0;
  max-width: 48rem;
}

.pm-faq {
  width: 100%;
  margin-top: 12rem;
  margin-bottom: 12rem;
}

/* „faq"-Section-Titel-Box vor dem Accordion (Optik/Responsive wie LandingPage) */
.pm-faq-label {
  display: flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: clamp(3.25rem, 4.8vw, 5.75rem);
  padding: 0 1rem;
  border: 0.125rem solid #141414;
  border-radius: 0.9rem;
  margin: 0 0 3rem;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 400;
  font-size: clamp(1.75rem, 2.6vw, 3.125rem);
  line-height: 1;
  color: #141414;
}

.pm-faq-item {
  border-bottom: 0.09375rem solid #141414;
}

.pm-faq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 2.25rem 2rem;
  cursor: pointer;
}

.pm-faq-question {
  flex: 1;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  font-weight: 400;
  line-height: 1.25;
  color: #141414;
  margin: 0;
}

/* +/- Icon: zwei Balken; vertikaler skaliert beim Öffnen smooth auf 0 → Minus */
.pm-faq-icon {
  position: relative;
  flex-shrink: 0;
  width: 1.8125rem;
  height: 1.8125rem;
  display: block;
}

.pm-faq-icon-bar {
  position: absolute;
  top: 50%;
  left: 50%;
  background: #141414;
  border-radius: 0.0625rem;
  transition: transform 0.3s ease;
}

.pm-faq-icon-bar--h {
  width: 1.8125rem;
  height: 0.125rem;
  transform: translate(-50%, -50%);
}

.pm-faq-icon-bar--v {
  width: 0.125rem;
  height: 1.8125rem;
  transform: translate(-50%, -50%) scaleY(1);
}

.pm-faq-item--active .pm-faq-icon-bar--v {
  transform: translate(-50%, -50%) scaleY(0);
}

.pm-faq-content {
  overflow: hidden;
  height: 0;
  opacity: 0;
  padding: 0;
}

.pm-faq-content p {
  margin: 0 0 2rem;
  color: #141414;
  font-size: clamp(1.25rem, 1.4vw, 1.5rem);
  line-height: 1.5;
  letter-spacing: -0.015625rem;
  width: 70%;
}

/* ============================================================================
 * Tablet
 * ============================================================================*/
@media (min-width: 1025px) {
  .pm-faq-header {
    padding: 3rem 0rem;
  }

  .pm-faq-content {
    padding: 0rem 0rem 0rem;
  }

  .pm-faq-content p {
    margin: 0 0 4rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .pm-faq-header {
    padding: 1.75rem 0.5rem;
    gap: 2.2rem;
  }

  .pm-faq-content {
    padding: 0 0.5rem 1rem;
  }

  .pm-faq-question {
    font-size: clamp(1.8rem, 5vw, 3rem);
  }

  .pm-lead-text,
  .pm-card-desc,
  .pm-toggle-label,
  .pm-faq-content p {
    font-size: clamp(1.5rem, 1.4vw, 1.6rem);
  }

  /* Pille auf Tablet schlanker (Radius bleibt konstant 20px) */
  .pm-pill {
    border-width: 0.09375rem;
  }

  /* Card-Gap auf Tablet = Gap Card↔Details */
  .pm-cards {
    gap: 1.625rem;
  }
}

@media (max-width: 64rem) {
  .pm-hero {
    flex-direction: column;
    row-gap: 1rem;
  }

  .pm-intro {
    flex: none;
    width: 100%;
    min-height: auto;
  }

  .pm-chairs-wrap {
    display: none;
  }

  .pm-cards {
    width: 100%;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .pm-intro {
    display: contents;
  }

  .pm-intro-text {
    order: 1;
    margin: 0.6rem auto 2.6rem;
  }

  .pm-cards {
    order: 2;
  }

  .pm-chairs-wrap {
    display: block;
    order: 3;
    width: 100vw;
    max-width: 100vw;
    margin-left: calc(50% - 50vw);
    margin-right: calc(50% - 50vw);
    margin-top: 3rem;
    min-height: auto;
    overflow: hidden;
    transform: none;
  }

  .pm-chairs-picture--a,
  .pm-chairs-picture--b {
    display: none;
  }

  .pm-chairs-mixed-picture {
    display: block;
    width: 100%;
    height: 30rem;
  }

  .pm-chairs-mixed {
    display: block;
    width: 100%;
    height: auto;
    object-fit: contain;
    transform: translate(15rem, 4.5rem) scale(-1.5, 1.5);
  }

  .pm-hero {
    margin-bottom: 0rem;
  }

  .pm-faq {
    margin-top: 8rem;
  }
}

/* ============================================================================
 * Mobile
 * ============================================================================*/
@media (max-width: 40rem) {
  /* LandingPage-Pattern: .pricing-page hat KEIN horizontales Padding,
     jede Section setzt eigenes padding-inline. So kann .pm-faq mit
     width:95% + margin:auto sauber zentrieren — analog LandingPage.
     overflow-x: clip ist Safety-Net gegen horizontale Overflows aus
     Children (z.B. transform-translatable Bilder). */
  .pricing-page {
    padding: 1rem 0 6rem;
    overflow-x: clip;
  }

  .pp-close-btn {
    padding: 1rem 1rem;
    font-size: 0.95rem;
    gap: 0.5rem;
    bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px) + var(--pp-btn-lift, 0px));
  }

  .pm-topbar {
    padding-inline: 1rem;
    gap: 0.5rem;
    margin-bottom: 4rem;
  }

  .pm-logo {
    height: 3.25rem;
  }

  .pm-pill {
    height: 3.25rem;
    padding: 0 1rem;
    border-radius: 0.9rem;
    border-width: 0.09375rem;
  }

  .pm-pill-label {
    font-size: 1.75rem;
  }

  .pm-lead {
    padding-inline: 1rem;
    margin: -2rem 0 0;
  }

  .pm-lead-text {
    max-width: 100%;
    /* zusätzliche 0.5rem links/rechts */
    margin-inline: 0.5rem;
  }

  .pm-lead-chairs {
    margin-bottom: 0.5rem;
  }

  .pm-lead-chair {
    width: 54%;
  }

  .pm-cards {
    flex-direction: column;
    padding-inline: 1rem;
    gap: 1.625rem;
    margin-bottom: 3rem;
  }

  .card.pm-card {
    min-height: 20rem;
  }

  .pm-faq {
    width: 95%;
    margin: 7rem auto 7rem;
  }

  .pm-faq-label {
    height: 3.25rem;
    border-radius: 0.6rem;
    border-width: 0.09375rem;
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }

  .pm-faq-header {
    padding: 1.5rem 0.6rem 1.5rem 0.2rem;
  }

  .pm-faq-content {
    padding: 0 1rem;
  }

  .pm-faq-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .pm-faq-icon-bar--h {
    width: 1.5rem;
  }

  .pm-faq-icon-bar--v {
    height: 1.5rem;
  }

  .pm-faq-content p {
    width: 100%;
    font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
    line-height: 1.375;
  }

  .pm-faq-question {
    font-size: clamp(1.8rem, 5vw, 3rem);
    min-width: 0;
    /* nur deutsche Grammatik-Silbentrennung (lang=de), kein Umbruch mitten im Wort */
    hyphens: auto;
  }
}

/* ============================================================================
 * Preiskalkulator
 * ============================================================================*/
.pm-calc {
  border-top: 1px solid rgba(20, 20, 20, 0.15);
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.pm-calc-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pm-step-btn {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border: 1.5px solid #141414;
  border-radius: 0.5rem;
  background: transparent;
  font-size: 1.125rem;
  line-height: 1;
  font-family: 'LayGrotesk', sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #141414;
  transition: background 0.15s ease;
}

.pm-step-btn:hover:not(:disabled) {
  background: rgba(20, 20, 20, 0.07);
}

.pm-step-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.pm-calc-label {
  flex: 1;
  font-size: clamp(0.875rem, 1vw, 1rem);
  font-weight: 500;
  color: #141414;
  text-align: center;
}

.pm-calc-total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-top: 1px solid rgba(20, 20, 20, 0.15);
  margin-top: 0.25rem;
  padding-top: 0.75rem;
}

.pm-calc-total-label {
  font-size: clamp(0.875rem, 1vw, 1rem);
  font-weight: 400;
  color: #141414;
}

.pm-calc-total-price {
  font-size: clamp(1.25rem, 1.4vw, 1.5rem);
  font-weight: 900;
  color: #141414;
}

/* ============================================================================
 * Footer Breakout
 * ============================================================================*/
/* .pp-footer-wrap Full-Bleed-Pattern: Footer bricht via negativen Margins
   aus dem .pricing-page-Padding aus. Tablet/Desktop hat .pricing-page
   { padding: 5rem 7.25% 8rem } → -7.25vw kompensiert das.
   Auf Mobile hat .pricing-page { padding: 1rem 0 6rem } (kein H-Padding),
   daher müssen die negativen H-Margins dort 0 sein, sonst würde der
   Footer breiter als der Viewport. */
.pp-footer-wrap {
  margin-left: -7.25vw;
  margin-right: -7.25vw;
  margin-bottom: -8rem;
}

@media (max-width: 40rem) {
  .pp-footer-wrap {
    margin-left: 0;
    margin-right: 0;
    margin-bottom: -6rem;
  }
}

/* Mobile: prominente Border-Radien um 1/3 verringern (wie Startseite) */
@media (max-width: 40rem) {
  .card.pm-card,
  .pm-toggle-wrap { border-radius: 0.83rem; }
  .pm-pill { border-radius: 0.6rem; }
  .pp-close-btn { border-radius: 0.67rem; }
  .pm-chevron-wrap { border-radius: 0.42rem; }
}
</style>
