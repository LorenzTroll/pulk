<script setup>
/* ============================================================================
 * Imports
 * ============================================================================*/
import { ref, reactive, watch, nextTick, onBeforeUnmount } from 'vue'
import Modal from './Modal.vue'
import { usePricingStore } from '@/stores/pricing'
import pulkLogo from '@/assets/pulk-logo-black_E3.svg'
import pulkArrow from '@/assets/pulk-arrow-accordeon_e2.svg'
import imgPricingA from '@/assets/pulk_pricing-imageA.png?format=avif;webp;png&as=picture'
import imgPricingB from '@/assets/pulk_pricing-imageB.png?format=avif;webp;png&as=picture'
import imgChairsMixed from '@/assets/hero-chair-mixed-row.png?format=avif;webp;png&as=picture'

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
      return
    }

    /* Modal opening → animation */
    await nextTick()

    const root = rootRef.value
    if (!root) return

    const cards = root.querySelectorAll('.card')
    if (!cards.length) return

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
  }
)

/* ============================================================================
 * Cleanup
 * ============================================================================*/
onBeforeUnmount(() => {
  tl?.kill()
  tl = null
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
      <section class="pm-hero">

        <!-- LEFT: Intro text + Stühle-Bild -->
        <div class="pm-intro">
          <div class="pm-intro-text">
            <h1 class="pm-intro-title">Preise und Pakete</h1>
            <p class="pm-intro-heading">
              Mietet stundenweise, ohne Mindest­buchung ohne Cateringzwang. Alle Preise zzgl. 19 % MwSt.
            </p>
          </div>
          <div class="pm-chairs-wrap">
            <!-- Hocker (B) links, kleiner -->
            <picture class="pm-chairs-picture pm-chairs-picture--b">
              <source
                v-for="(srcset, format) in imgPricingB.sources"
                :key="format"
                :srcset="srcset"
                :type="`image/${format}`"
              />
              <img
                :src="imgPricingB.img.src"
                alt="Grafik eines dreibeinigen Hockers in Lila aus der Corporate Identity des Pulk"
                class="pm-chairs-img"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <!-- Stühle-Stapel (A) rechts, größer, horizontal gespiegelt -->
            <picture class="pm-chairs-picture pm-chairs-picture--a">
              <source
                v-for="(srcset, format) in imgPricingA.sources"
                :key="format"
                :srcset="srcset"
                :type="`image/${format}`"
              />
              <img
                :src="imgPricingA.img.src"
                alt="Grafik verschiedenfarbiger Stühle im Profil aus der Corporate Identity des Pulk"
                class="pm-chairs-img pm-chairs-img--flipped"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <!-- Tablet-only: Stühle-Reihe als Full-Bleed -->
            <picture class="pm-chairs-mixed-picture">
              <source
                v-for="(srcset, format) in imgChairsMixed.sources"
                :key="format"
                :srcset="srcset"
                :type="`image/${format}`"
              />
              <img
                :src="imgChairsMixed.img.src"
                alt="Reihe verschiedenfarbiger Stuhlsilhouetten als Grafikelement der Corporate Identity des Pulk"
                class="pm-chairs-mixed"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
        </div>

        <!-- RIGHT: Preiskarten -->
        <div class="pm-cards">
          <div
            v-for="plan in pricingPlans"
            :key="plan.key"
            class="pm-card-wrap"
          >
            <!-- Karte -->
            <div class="card pm-card">
              <header class="card-header pm-card-header">
                <h2 class="pm-card-title">{{ plan.key === 'gruppen' ? 'Community' : plan.title }}</h2>
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
        </div>
      </section>

      <!-- ================================================================
           FAQ Accordion
           ================================================================ -->
      <section class="pm-faq">
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
            <div class="pm-faq-chevron-wrap">
              <img
                :src="pulkArrow"
                :ref="el => { if (el) faqArrowRefs[i] = el }"
                class="pm-faq-chevron"
                alt=""
                aria-hidden="true"
              />
            </div>
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
  padding: 5rem 7.25% 8rem;
  position: relative;
}

/* ============================================================================
 * Hero: Intro + Karten
 * ============================================================================*/
.pm-hero {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 5rem;
}

/* Left: Intro */
.pm-intro {
  flex: 0 0 36%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 36rem;
}

.pm-intro-text {
  margin: 2.6rem auto;
}

.pm-intro-title {
  font-size: clamp(2.5rem, 3.5vw, 3.625rem);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: -0.015625rem;
  color: #141414;
  margin: 0 0 1.5rem;
}

.pm-intro-heading {
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  font-weight: 400;
  line-height: 1.375;
  letter-spacing: -0.015625rem;
  color: #141414;
  margin: 0;
  width: 80%;
}

@media (max-width: 64rem) {
  .pm-intro-heading {
    width: 100%;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .pm-intro-heading {
    width: 70%;
  }
}

.pm-intro-heading strong {
  font-size: clamp(1.5rem, 2vw, 1.5625rem);
  font-weight: 900;
  display: block;
  margin-bottom: 0.75rem;
}

.pm-chairs-wrap {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 0;
  min-height: 20rem;
  overflow: hidden;
  transform: translateX(-10rem) translateY(3rem) scale(1.3);
}

.pm-chairs-picture {
  display: block;
  flex-shrink: 0;
}

.pm-chairs-picture--b {
  width: clamp(5rem, 9vw, 13rem);
  transform: translateX(1rem);
}

.pm-chairs-picture--a {
  width: clamp(9rem, 20vw, 26rem);
}

.pm-chairs-img {
  width: 95%;
  height: auto;
  object-fit: contain;
  display: block;
}

.pm-chairs-img--flipped {
  width: 85%;
  transform: scaleX(1);
}

/* Tablet-only Full-Bleed Chair-Row */
.pm-chairs-mixed-picture {
  display: none;
}

/* Right: Cards */
.pm-cards {
  flex: 1;
  display: flex;
  gap: 1.625rem;
  align-items: flex-start;
}

.pm-card-wrap {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  gap: 1.625rem;
}

/* Card */
.card.pm-card {
  border: 2px solid #141414;
  border-radius: 0.625rem;
  padding: 1.6875rem 2.1875rem;
  display: flex;
  flex-direction: column;
  min-height: 34rem;
  background: transparent;
  box-shadow: none;
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
  border: 2px solid #141414;
  border-radius: 0.625rem;
  overflow: hidden;
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

.pm-faq-item {
  border-top: 1px solid rgba(20, 20, 20, 0.3);
}


.pm-faq-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 2.25rem 0;
  cursor: pointer;
}

.pm-faq-question {
  flex: 1;
  font-size: clamp(1.5rem, 3vw, 3.625rem);
  font-weight: 900;
  line-height: 1.2;
  color: #141414;
  margin: 0;
}

.pm-faq-chevron-wrap {
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

.pm-faq-item--active .pm-faq-chevron-wrap {
  background: #9687FF;
}

.pm-faq-chevron {
  width: 1.5625rem;
  transform-origin: center;
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
    font-size: clamp(2rem, 5vw, 3rem);
  }

  .pm-intro-heading,
  .pm-card-desc,
  .pm-toggle-label,
  .pm-faq-content p {
    font-size: clamp(1.5rem, 1.4vw, 1.6rem);
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
  .pricing-modal {
    padding: 1rem 6% 6rem;
  }

  .pm-hero {
    gap: 1rem;
  }

  .pm-intro {
    display: contents;
  }

  .pm-intro-text {
    order: 1;
  }

  .pm-cards {
    flex-direction: column;
    order: 2;
  }

  .card.pm-card {
    min-height: 20rem;
  }

  .pm-chairs-wrap {
    display: block;
    order: 3;
    width: 100%;
    max-width: 100%;
    margin: 3rem 0 0;
    min-height: auto;
    overflow: hidden;
    transform: none;
  }

  .pm-chairs-picture--b,
  .pm-chairs-mixed-picture {
    display: none;
  }

  .pm-chairs-picture--a {
    display: block;
    width: 100%;
  }

  .pm-chairs-img--flipped {
    width: 100%;
    height: auto;
    transform: scaleX(1) translateX(-0.5rem);
  }

  .pm-faq {
    margin-top: 7rem;
  }

  .pm-faq-content p {
    width: 100%;
    font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
    line-height: 1.375;
  }

  .pm-faq-question {
    font-size: clamp(2rem, 5vw, 3rem);
    min-width: 0;
    overflow-wrap: break-word;
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
</style>
