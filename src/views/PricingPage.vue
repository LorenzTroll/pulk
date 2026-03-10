<script setup>
/* ============================================================================
 * Imports
 * ===========================================================================*/
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useHead } from '@vueuse/head'
import gsap from 'gsap'

import { usePricingStore } from '@/stores/pricing'
import SeoClose from '@/components/SeoClose.vue'

import pulkLogo from '@/assets/pulk-logo-black_E3.svg'

/* ============================================================================
 * SEO / Meta
 * ===========================================================================*/
useHead({
  title: 'Preise & Pakete · PULK Raum Halle (Saale)',
  meta: [
    {
      name: 'description',
      content:
        'Business-Paket, Gruppen-Paket und individuelle Anfragen: Faire Preise für euren Workshop, euer Vernetzungstreffen oder eure Veranstaltung im PULK Raum in Halle (Saale).'
    },
    { name: 'robots', content: 'index,follow' },
    {
      property: 'og:title',
      content: 'Preise & Pakete · PULK Raum Halle (Saale)'
    },
    {
      property: 'og:description',
      content:
        'Transparente Preise im PULK: Business-Paket für Unternehmen, Gruppen-Paket für Organisationen und individuelle Angebote für besondere Formate in Halle (Saale).'
    },
    { property: 'og:image', content: 'https://pulk.space/og-image-preise.jpg' },
    { property: 'og:url', content: 'https://pulk.space/preise' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Raumangebote & Pakete – PULK Raum Halle (Saale)',
        description:
          'Business-Paket für Unternehmen, Gruppen-Paket für Organisationen und individuelle Lösungen für kleine Gruppen und kulturelle Formate im PULK Raum in Halle (Saale).',
        brand: 'PULK',
        image: 'https://pulk.space/PULK_250513_Foto_Michel_Klehm_03.jpg',
        offers: [
          {
            '@type': 'Offer',
            name: 'Business-Paket (pro Stunde)',
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
            name: 'Business-Paket (pro Tag/Anlass)',
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
            name: 'Gruppen-Paket (Basispreis pro Stunde)',
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              minPrice: 25,
              priceCurrency: 'EUR',
              unitCode: 'HUR'
            },
            availability: 'https://schema.org/InStock',
            priceValidUntil: '2026-12-31'
          }
        ],
        url: 'https://pulk.space/preise'
      })
    }
  ]
})

/* ============================================================================
 * Stores
 * ===========================================================================*/
const pricing = usePricingStore()

/* ============================================================================
 * State
 * ===========================================================================*/
const rootRef = ref(null)
let tl = null

/* ============================================================================
 * GSAP Page Reveal (Modal-Style)
 * ===========================================================================*/
onMounted(async () => {
  await nextTick()
  const root = rootRef.value
  if (!root) return

  const cards = [...root.querySelectorAll('.card')]
  if (!cards.length) return

  tl?.kill()
  tl = gsap.timeline({
    defaults: { duration: 0.8, ease: 'power2.out' },
    delay: 0.25
  })

  gsap.set(cards, {
    opacity: 0,
    y: 32,
    willChange: 'transform,opacity'
  })

  tl.to(cards, {
    opacity: 1,
    y: 0,
    stagger: 0.25,
    clearProps: 'willChange',
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
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out',
        clearProps: 'willChange',
        delay: 0.25
      })
    }
  })
})

/* ============================================================================
 * Cleanup
 * ===========================================================================*/
onBeforeUnmount(() => {
  tl?.kill()
  tl = null
})
</script>

<template>
  <main ref="rootRef" class="pricing-page">
    <router-link to="/" class="seo-logo">
      <img :src="pulkLogo" alt="Pulk Logo" class="logo-img" />
    </router-link>
    <SeoClose />

    <div class="cards-wrapper">
      <div
        v-for="plan in pricing.plans"
        :key="plan.key"
        :class="['card', { 'card--highlight': plan.key === 'gruppen' }]"
      >
        <!-- Header -->
        <header class="card-header">
          <h2 class="card-title">{{ plan.title }}</h2>

          <!-- Zielgruppe / Kontext / max. Personen -->
          <p
            v-if="plan.audience"
            class="card-subtitle card-subtitle--audience"
          >
            {{ plan.audience }}
          </p>
          <p
            v-if="plan.context"
            class="card-subtitle card-subtitle--context"
          >
            {{ plan.context }}
          </p>
          <p
            v-if="plan.maxPersons"
            class="card-subtitle card-subtitle--max"
          >
            {{ plan.maxPersons }}
          </p>

          <!-- Fallback für alte subtitle-Daten -->
          <p
            v-if="!plan.audience && !plan.context && !plan.maxPersons && plan.subtitle"
            class="card-subtitle"
          >
            {{ plan.subtitle }}
          </p>
        </header>

        <!-- Price (Zahlenpreis oder "Preis auf Anfrage") -->
        <div class="card-price" v-if="plan.price || plan.priceLabel">
          <!-- Business / Gruppen (Zahlenpreis) -->
          <template v-if="plan.price">
            <span class="price-amount">
              {{ plan.price }} €
            </span>
            <span class="price-unit">
              {{ plan.unit }}
            </span>
          </template>

          <!-- Individuell (Textpreis) -->
          <template v-else-if="plan.priceLabel">
            <span class="price-amount">
              {{ plan.priceLabel }}
            </span>
          </template>
        </div>

        <!-- Zusätzliche Preisinfos: zweite Zeile + MwSt-Hinweis -->
        <div class="card-price-extra" v-if="plan.priceAlt || plan.priceNote">
          <p v-if="plan.priceAlt" class="price-alt">
            {{ plan.priceAlt }}
          </p>
          <p v-if="plan.priceNote" class="price-note">
            {{ plan.priceNote }}
          </p>
        </div>

        <!-- Included features -->
        <section class="card-features" v-if="plan.features?.length">
          <h3 class="features-heading">
            {{ plan.key === 'individuell' ? 'Beispielsweise:' : 'Was enthalten ist:' }}
          </h3>
          <ul aria-label="Enthaltene Leistungen" class="features-list">
            <li
              v-for="(feature, i) in plan.features"
              :key="i"
              class="feature-item"
            >
              <font-awesome-icon icon="check" class="feature-check" />
              <span class="feature-text">{{ feature }}</span>
            </li>
          </ul>
        </section>

        <!-- On request -->
        <section class="card-features" v-if="plan.onRequest?.length">
          <h3 class="features-heading">Auf Anfrage:</h3>
          <ul class="features-list">
            <li
              v-for="(item, i) in plan.onRequest"
              :key="i"
              class="feature-item"
            >
              <font-awesome-icon icon="check" class="feature-check" />
              <span class="feature-text">{{ item }}</span>
            </li>
          </ul>
        </section>

        <!-- Beschreibungstext -->
        <section class="card-description" v-if="plan.description">
          <p>{{ plan.description }}</p>
        </section>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* ============================================================================
 * Base Layout
 * ============================================================================*/
.pricing-page {
  background: #e7e8ec;
  width: 100%;
  min-height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
  font-family: 'LayGrotesk', sans-serif;
  padding: 2rem;
  position: relative;
}

/* Logo positioning SEO */
.seo-logo {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: block;
  z-index: 5000;
}

.logo-img {
  width: max(7rem, 9%);
}

/* Optional: .absolute wie im Modal */
.absolute {
  margin: 0;
  width: max(7rem, 9%);
}

/* Card grid */
.cards-wrapper {
  display: flex;
  gap: 2rem;
  flex-wrap: no-wrap;
  justify-content: center;
  margin-top: 6rem;
}

/* Card base */
.card {
  background: linear-gradient(
    to top left,
    rgb(237, 238, 245) 0.5%,
    #ffffff 100%
  );
  border-radius: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 3rem;
  display: flex;
  flex-direction: column;
  flex: 1 1 20rem;
  width: 85%;
  max-width: 20rem;
  opacity: 0; /* initial state for GSAP */
  transform: translateY(50px); /* initial offset */
}

.card:hover {
  transform: translateY(-0.5rem);
  transition: transform 0.2s ease;
}

/* Highlight card (Gruppen) */
.card--highlight {
  background: #141414;
}
.card--highlight .card-title,
.card--highlight .card-subtitle,
.card--highlight .price-amount,
.card--highlight .price-unit,
.card--highlight .feature-text,
.card--highlight .features-heading,
.card--highlight .price-alt,
.card--highlight .price-note,
.card--highlight .card-description {
  color: #fff;
}
.card--highlight .feature-check {
  color: #fff;
}
.card--highlight .price-amount {
  color: #ff5a00;
}

/* ============================================================================
 * Typography & Layout: Card Content
 * ============================================================================*/
.card-header {
  margin-bottom: 1.3rem;
}

.card-title {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.06rem;
  line-height: 1.1;
  color: #141414;
  margin: 0.5rem 0 1.1rem;
}

.card-subtitle {
  font-size: 1rem;
  color: #666666;
  margin: 0.15rem 0;
  line-height: 1.4;
}

.card-subtitle--audience {
  font-weight: 600;
}
.card-subtitle--context {
  font-style: normal;
}
.card-subtitle--max {
  font-weight: 400;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 1.25rem 0 0.5rem;
}

.price-amount {
  font-size: 2rem;
  font-weight: 900;
  color: #ff5a00;
  line-height: 1;
}

.price-unit {
  font-size: 0.9rem;
  color: #888;
}

.card-price-extra {
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  color: #666;
}

.price-alt {
  margin: 0;
}

.price-note {
  margin: 0.25rem 0 0;
  font-style: normal;
}

.features-heading {
  font-size: 1rem;
  font-weight: 400;
  color: #141414;
  margin: 0.5rem 0 1rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.75rem;
}

.feature-check {
  font-size: 1rem;
  color: #141414;
  padding-right: 0.75rem;
}

.feature-text {
  flex: 1;
}

/* Beschreibungstext */
.card-description {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #444;
}

/* ============================================================================
 * Responsive Layout
 * ============================================================================*/
@media (max-width: 1024px) {
  .cards-wrapper {
    flex-direction: column;
    align-items: center;
  }

  .card {
    max-width: 22rem;
  }
}

@media (max-width: 640px) {
  .pricing-page {
    padding: 2rem;
    gap: 1.25rem;
  }

  .logo-img {
    width: max(7rem, 9%);
  }

  .card {
    max-width: 100%;
    padding: 2rem;
    margin: 0 1rem;
  }

  .feature-text,
  .card-subtitle {
    font-size: clamp(1.3rem, 3.6vw, 1.05rem);
    line-height: 1.5rem;
    font-weight: 200;
  }
}
</style>
