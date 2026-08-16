<script setup>
/* ============================================================================
 * Imports
 * ============================================================================*/
import { ref, reactive, watch, nextTick, onBeforeUnmount } from 'vue'
import Modal from './Modal.vue'
import { usePricingStore } from '@/stores/pricing'
import pulkLogo from '@/assets/pulk-logo_E2.svg'
import pulkArrow from '@/assets/pulk-arrow-accordeon_e2.svg'
import chairYellow from '@/assets/pulk_pricing-chair-yellow-a_E2.png?format=avif;webp;png&as=picture'
import brushBusiness from '@/assets/brush-line-business.png?w=800&format=webp&as=src'
import brushCommunity from '@/assets/brush-line-community.png?w=800&format=webp&as=src'

/* Lazy GSAP loader */
import { getGsap } from '@/composables/lazyGsap'
import { track, trackDebounced } from '@/utils/tracking'

/* ============================================================================
 * Props & Emits
 * ============================================================================*/
const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close'])

/* ============================================================================
 * Stores
 * ============================================================================*/
const pricing = usePricingStore()

/* ============================================================================
 * Local State
 * ============================================================================*/
const rootRef = ref(null)
let tl = null
let brushObserver = null

/* ============================================================================
 * GSAP Modal Animation – Lazy loaded
 * ============================================================================*/
watch(
  () => props.visible,
  async (open) => {
    // Modal closing → cleanup
    if (!open) {
      tl?.kill()
      tl = null

      const root = rootRef.value
      const cards = root?.querySelectorAll('.card')
      if (cards?.length) {
        const gsap = await getGsap()
        gsap.set(cards, { opacity: 0, y: 24, clearProps: 'willChange' })
      }
      // Brush-Observer stoppen + is-inview zurücksetzen → beim nächsten Öffnen frischer Reveal
      brushObserver?.disconnect()
      root?.querySelectorAll('.pm-card-wrap').forEach((el) => el.classList.remove('is-inview'))
      return
    }

    /* Modal opening → animation */
    // Funnel-Startpunkt "Preise-Modal geöffnet" (analog pulk.contact.open)
    track('pulk.pricing.open', { source: 'pricing-modal' })

    await nextTick()

    const root = rootRef.value
    if (!root) return

    const cards = root.querySelectorAll('.card')
    if (!cards.length) return

    // Brush-Reveal auf Touch/Mobile: Card beim Viewport-Eintritt markieren
    // (Desktop nutzt reines CSS :hover). Bei jedem Öffnen frisch aufsetzen.
    brushObserver?.disconnect()
    brushObserver = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('is-inview')
          brushObserver.unobserve(e.target)
        }
      })
    }, { threshold: 0.4 })
    root.querySelectorAll('.pm-card-wrap').forEach((el) => brushObserver.observe(el))

    // Lazy load GSAP
    const gsap = await getGsap()

    // Clean previous instance
    tl?.kill()
    tl = null

    gsap.set(cards, { willChange: 'transform,opacity', opacity: 0, y: 32 })

    tl = gsap.timeline({
      delay: 0.4,
      defaults: { duration: 0.5, ease: 'power2.out' }
    })

    tl.to(cards, {
      opacity: 1,
      y: 0,
      stagger: {
        each: 0.28,
        onStart() {
          const card = this.targets()[0]
          const chunks = card.querySelectorAll(
            '.card-header, .card-price, .card-price-extra, .card-features, .card-features .features-list li, .card-description'
          )

          gsap.set(chunks, {
            opacity: 0,
            y: 10,
            willChange: 'transform,opacity'
          })

          gsap.to(chunks, {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.08,
            clearProps: 'willChange'
          })
        }
      },
      clearProps: 'willChange'
    })
  },
  // immediate: true — Modal mountet seit dem Lazy-Mount (App.vue,
  // v-if="pricingEverOpened") beim ersten Öffnen bereits mit visible=true;
  // ohne immediate feuert der Watcher dann nie → open-Event + Animation
  // würden beim Erst-Öffnen ausfallen (analog AboutModal-Fix).
  { immediate: true }
)

/* ============================================================================
 * Cleanup
 * ============================================================================*/
onBeforeUnmount(() => {
  tl?.kill()
  tl = null
  brushObserver?.disconnect()
})

/* ============================================================================
 * Price plans (Business + Gruppen only — Individuell → FAQ)
 * ============================================================================*/
const pricingPlans = pricing.plans.filter(p => p.key !== 'individuell')

/* ============================================================================
 * Preiskalkulator
 * ============================================================================*/
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
  calc[planKey].hours = Math.max(1, Math.min(7, calc[planKey].hours + delta))
  trackPricingAdjust(planKey)
}

function trackPricingAdjust(planKey) {
  const c = calc[planKey]
  trackDebounced('pulk.pricing.adjust', {
    package: planKey,
    persons: c.persons,
    hours: c.hours,
    total: pricing.calculatePrice(planKey, c.persons, c.hours),
    source: 'pricing-modal'
  })
}

function calcTotal(planKey) {
  const c = calc[planKey]
  return pricing.calculatePrice(planKey, c.persons, c.hours)
}

function hoursLabel(planKey) {
  const h = calc[planKey].hours
  if (h >= 7) return 'Ganztag (7 Std.)'
  return h === 1 ? '1 Stunde' : `${h} Stunden`
}

function personsLabel(planKey) {
  const p = calc[planKey].persons
  return p === 1 ? '1 Person' : `${p} Personen`
}

/* ============================================================================
 * Card detail toggle (Details anzeigen)
 * ============================================================================*/
const expandedPlan = ref(null)
const cardDetailRefs = {}
const cardArrowRefs = {}

async function togglePlan(key) {
  const willOpen = expandedPlan.value !== key
  expandedPlan.value = willOpen ? key : null
  if (willOpen) {
    track('pulk.pricing.expand-card', { package: key, source: 'pricing-modal' })
  }
  await nextTick()
  const gsap = await getGsap()
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
 * ============================================================================*/
const openFaqIndex = ref(null)
const faqContentRefs = []
const faqArrowRefs = []

const faqItems = [
  {
    q: 'Was wenn kein Paket passt?',
    a: 'Schreibt uns, was ihr vorhabt. Ob spezielles Ausstellungskonzept, Lesungsreihe oder ein anderes Kulturformat. Wir schauen gemeinsam, was sich im Pulk realisieren lässt. Teilt uns eure Idee in einer Anfrage mit, dann stecken wir die Köpfe zusammen und versuchen, ein passendes Konzept mit euch zu finden.'
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
    track('pulk.faq.open', { section: faqItems[i]?.q || '', page: 'pricing-modal' })
  }
  await nextTick()
  const gsap = await getGsap()
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
</script>

<template>
  <Modal :visible="props.visible" aria-label="Preise und Pakete im PULK" @close="emit('close')">
    <div
      v-if="props.visible"
      ref="rootRef"
      class="pricing-modal"
      data-lenis-prevent
    >
      <!-- ================================================================
           HERO: Intro + Preiskarten
           ================================================================ -->
      <!-- Topbar: Logo + preise-Pille -->
      <div class="pm-topbar">
        <img :src="pulkLogo" class="pm-logo" alt="PULK" width="169" height="92" />
        <div class="pm-pill"><span class="pm-pill-label">preise</span></div>
      </div>

      <!-- Preis-Leittext (Prosa) + Stühle -->
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
                  <button class="pm-step-btn" type="button" :disabled="calc[plan.key].hours >= 7" @click="stepHours(plan.key, 1)">+</button>
                </div>
                <div class="pm-calc-total">
                  <span class="pm-calc-total-label">{{ calc[plan.key].hours >= 7 ? 'Tagessatz' : 'Gesamt' }}</span>
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

      <!-- ================================================================
           FAQ Accordion
           ================================================================ -->
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
            <p>{{ item.a }}</p>
          </div>
        </div>
      </section>

    </div>
  </Modal>
</template>

<style scoped>
/* ============================================================================
 * Base
 * ============================================================================*/
.pricing-modal {
  background: #e7e8ec;
  width: 100%;
  min-height: 100%;
  align-self: flex-start;
  box-sizing: border-box;
  font-family: 'LayGrotesk', sans-serif;
  padding: 3.3rem 5.8% 8rem;
  position: relative;
}

.pricing-modal * {
  box-sizing: border-box;
}

/* ============================================================================
 * Hero: Intro + Karten
 * ============================================================================*/
/* ============================================================================
 * Topbar: Logo + preise-Pille
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
  flex-wrap: wrap-reverse;
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

@media (min-width: 75rem) {
  .pm-lead-chairs {
    align-self: flex-start;
    margin-top: -15rem;
  }
}

@media (max-width: 64rem) {
  .pm-lead {
    margin: 4rem 0 0;   /* Topbar→Inhalt 4rem (About-Referenz) */
    gap: 2rem;
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

/* Right: Cards */
.pm-cards {
  display: flex;
  gap: 3.25rem;
  align-items: stretch;
  width: 100%;
  box-sizing: border-box;
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
.pm-faq {
  width: 100%;
  margin-top: 12rem;
  margin-bottom: 6rem;
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

/* +/- Icon: vertikaler Balken skaliert beim Öffnen smooth auf 0 → Minus */
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

  .pm-pill {
    border-width: 0.09375rem;
  }

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
  /* LandingPage-Pattern: .pricing-modal hat KEIN horizontales Padding,
     jede Section setzt eigenes padding-inline. So kann .pm-faq mit
     width:95% + margin:auto sauber zentrieren — analog zur LandingPage
     `.accordion-section`. Kein negative-margin-Hack mehr nötig. */
  .pricing-modal {
    padding: 1rem 0 6rem;
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

  .pm-lead-chair {
    width: 54%;
  }

  .pm-cards {
    flex-direction: column;
    padding-inline: 1rem;
    gap: 1.625rem;
  }

  .card.pm-card {
    min-height: 20rem;
  }

  /* FAQ analog zur LandingPage `.accordion-section`:
     95% Viewport-Breite, zentriert via margin auto. */
  .pm-faq {
    width: 95%;
    margin: 7rem auto 0;
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

  .pm-faq-content {
    padding: 0rem 1rem;
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

/* Mobile: prominente Border-Radien um 1/3 verringern (wie Startseite) */
@media (max-width: 40rem) {
  .card.pm-card,
  .pm-toggle-wrap { border-radius: 0.83rem; }
  .pm-pill { border-radius: 0.6rem; }
  .pm-chevron-wrap { border-radius: 0.42rem; }
}
</style>
