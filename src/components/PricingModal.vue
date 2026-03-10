<script setup>
/* ============================================================================
 * Imports
 * ============================================================================*/
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import Modal from './Modal.vue'
import { usePricingStore } from '@/stores/pricing'
import pulkLogo from '@/assets/pulk-logo-black_E3.svg'

/* Lazy GSAP loader */
import { getGsap } from '@/composables/lazyGsap'

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
      defaults: { duration: 0.35, ease: 'power2.out' }
    })

    tl.to(cards, {
      opacity: 1,
      y: 0,
      stagger: {
        each: 0.25,
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
            duration: 0.45,
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
</script>

<template>
  <Modal :visible="props.visible" @close="emit('close')">
    <!-- Render only when visible (prevents initial layout flash) -->
    <div v-if="props.visible" ref="rootRef" class="pricing-modal">
      <img
        :src="pulkLogo"
        alt="Pulk Logo"
        class="absolute top-6 left-6 w-12 h-12"
      />

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

            <!-- Fallback, falls noch alte Daten mit subtitle existieren -->
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
    </div>
  </Modal>
</template>

<style scoped>
/* ============================================================================
 * Base Layout
 * ============================================================================*/
.pricing-modal {
  background: #e7e8ec;
  width: 100%;
  min-height: 100vh;
  max-height: 100vh;
  overflow-y: auto;
  box-sizing: border-box;
  font-family: 'LayGrotesk', sans-serif;
  padding: 2rem;
  position: relative;

  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

/* Logo positioning */
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

/* Du könntest hier noch unterschiedliche Feinheiten setzen, falls gewünscht */
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
  .pricing-modal {
    padding: 2rem;
    gap: 1.25rem;
  }

  .absolute {
    margin-top: 0.5rem;
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
