<script setup>
/* -----------------------------------------------------------------------------
 * Imports
 * ---------------------------------------------------------------------------*/
import { ref, nextTick, onMounted, onBeforeUnmount, computed } from 'vue'
import { useHead } from '@vueuse/head'
import gsap from 'gsap'

import { Calendar } from 'hkanev-vue-calendar'
import { useCalendarStore } from '@/stores/calendar'
import SeoClose from '@/components/SeoClose.vue'

import 'hkanev-vue-calendar/dist/style.css'
import pulkLogo from '@/assets/pulk-logo-neoncoral_E3.svg'
import pulkContactImage from '@/assets/PULK_250513_Foto_Michel_Klehm_4.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'

/* -----------------------------------------------------------------------------
 * SEO / Meta
 * ---------------------------------------------------------------------------*/
useHead({
  title: 'Workshopraum mieten in Halle (Saale) · PULK',
  link: [{ rel: 'canonical', href: 'https://pulk.space/miete' }],
  meta: [
    {
      name: 'description',
      content:
        'Jetzt Seminarraum, Workshop- oder Meetingraum in Halle (Saale) flexibel mieten. Für Teams, Organisationen und kreative Formate im PULK Raum anfragen.'
    },
    { name: 'robots', content: 'index,follow' },
    { property: 'og:title', content: 'Workshopraum mieten in Halle (Saale) · PULK' },
    {
      property: 'og:description',
      content:
        'Der ideale Raum in Halle (Saale) für Workshops, Seminare oder Meetings. Jetzt flexibel anfragen und gestalten.'
    },
    { property: 'og:url', content: 'https://pulk.space/miete' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Anfrage · PULK Halle (Saale)',
        description: 'Kontaktformular für Anfragen zur Miete des PULK Raums in Halle (Saale).',
        url: 'https://pulk.space/miete',
        mainEntity: {
          '@type': 'Organization',
          name: 'PULK',
          url: 'https://pulk.space'
        }
      })
    }
  ]
})

/* -----------------------------------------------------------------------------
 * Stores
 * ---------------------------------------------------------------------------*/
const calendar = useCalendarStore()

/* -----------------------------------------------------------------------------
 * State
 * ---------------------------------------------------------------------------*/
const rootRef       = ref(null)
const showCalendar  = ref(false)
const selectedRange = ref({ start: null, end: null })
let tl              = null

// Kontaktformular (lokal)
const contactForm = ref({
  name: '',
  company: '',
  usage: '',
  message: '',
  honeypot: ''
})

/* -----------------------------------------------------------------------------
 * Anti-Bot
 * ---------------------------------------------------------------------------*/
const openTimestamp = ref(Date.now())
const jsChallenge   = ref('')

/* -----------------------------------------------------------------------------
 * GSAP Seite-Initial-Animation
 * ---------------------------------------------------------------------------*/
async function runPageReveal() {
  await nextTick()
  const container = rootRef.value
  if (!container) return

  const targets = [...container.querySelectorAll('.reveal-up')]
  if (!targets.length) return

  tl?.kill()

  tl = gsap.timeline({
    defaults: { duration: 0.8, ease: 'power2.out' },
    delay: 0.3
  })

  gsap.set(targets, {
    opacity: 0,
    y: 32,
    willChange: 'transform,opacity'
  })

  tl.to(targets, {
    opacity: 1,
    y: 0,
    stagger: 0.2,
    clearProps: 'willChange'
  })
}

/* -----------------------------------------------------------------------------
 * Lifecycle
 * ---------------------------------------------------------------------------*/
onMounted(async () => {
  jsChallenge.value = btoa(Math.random().toString(36).slice(2))
  openTimestamp.value = Date.now()

  calendar.fetchEvents()
  runPageReveal()
})

onBeforeUnmount(() => {
  tl?.kill()
  tl = null
})

/* -----------------------------------------------------------------------------
 * Calendar utils
 * ---------------------------------------------------------------------------*/
const startOfDay = date => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const today = startOfDay(new Date())

const minDate = computed(() => {
  const d = new Date(today)
  d.setDate(d.getDate() + 1)
  return d
})

const maxDate = computed(() => {
  const d = new Date(today)
  d.setMonth(d.getMonth() + 12)
  return d
})

const disabledPastDates = computed(() => [
  { start: null, end: today }
])

/* -----------------------------------------------------------------------------
 * Calendar attributes
 * ---------------------------------------------------------------------------*/
const attributes = computed(() => {
  const reserved = calendar.events.map(evt => ({
    key: `used-${evt.id}`,
    dates: { start: evt.dates.start, end: evt.dates.end },
    highlight: { class: 'vc-disabled-bg', contentClass: 'vc-disabled-day' },
    customData: { disabled: true }
  }))

  const range =
    selectedRange.value.start && selectedRange.value.end
      ? [
          {
            key: 'sel-range',
            dates: {
              start: selectedRange.value.start,
              end: selectedRange.value.end
            },
            highlight: { class: 'vc-selected-range' }
          }
        ]
      : []

  return [...reserved, ...range]
})

/* -----------------------------------------------------------------------------
 * Calendar selection handling
 * ---------------------------------------------------------------------------*/
function onDayClick(day) {
  const clicked = startOfDay(day.date)
  const { start, end } = selectedRange.value

  if (clicked <= today) return
  if (day.customData?.disabled) return

  if (!start || end || clicked < start) {
    selectedRange.value = { start: clicked, end: null }
    return
  }

  selectedRange.value.end = clicked
  showCalendar.value = false
}

/* -----------------------------------------------------------------------------
 * Display selected date range
 * ---------------------------------------------------------------------------*/
const displayRange = computed(() => {
  const { start, end } = selectedRange.value
  if (!start) return ''

  const fmt = d =>
    new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d)

  if (!end || start.getTime() === end.getTime()) return fmt(start)
  return `${fmt(start)} – ${fmt(end)}`
})

/* -----------------------------------------------------------------------------
 * Form validation
 * ---------------------------------------------------------------------------*/
const isFormValid = computed(() =>
  Boolean(
    contactForm.value.name?.trim() &&
    contactForm.value.usage &&
    selectedRange.value.start &&
    contactForm.value.message?.trim()
  )
)

/* -----------------------------------------------------------------------------
* Submit handler — mit Anti-Bot + Tracking + Web3Forms *
------------------------------------------------------------------------------*/
const formRef = ref(null)

function handleFormSubmit() {
  const form = formRef.value
  if (!form) return

/* -------------------------------------------------------
* Anti-Bot: 1) Time-lock *
------------------------------------------------------- */
  if (Date.now() - openTimestamp.value < 1200) {
    console.warn('Blocked bot: too fast')
    if (typeof showToast === 'function') showToast('Verdächtige Anfrage blockiert.')
    return
  }

/* -------------------------------------------------------
* Anti-Bot: 2) JS-Challenge *
------------------------------------------------------- */
  if (!jsChallenge.value) {
    console.warn('Blocked bot: JS challenge missing')
    if (typeof showToast === 'function') showToast('Verdächtige Anfrage blockiert.')
    return
  }

/* -------------------------------------------------------
* Sitesight tracking (optional, wie im Modal) *
------------------------------------------------------- */
  if (window.MDAL?.event) {
    MDAL.event({
      Name: 'modal-submit',
      Parameters: [{ Name: 'method', Value: 'web3forms' }]
    })
  }

/* -------------------------------------------------------
* Web3Forms API submit *
------------------------------------------------------- */
  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: new FormData(form)
  })
    .then(res => {
      if (res.ok) {
        contactForm.value = {
          name: '',
          company: '',
          usage: '',
          message: '',
          honeypot: ''
        }
        selectedRange.value = { start: null, end: null }

        if (typeof showToast === 'function') {
          showToast('Danke für deine Anfrage – wir melden uns bei dir.')
        }
      } else {
        if (window.MDAL?.event) {
          MDAL.event({
            Name: 'form-submit-error',
            Parameters: [
              { Name: 'type', Value: 'web3forms-response' },
              { Name: 'status', Value: res.status }
            ]
          })
        }
        if (typeof showToast === 'function') {
          showToast('Fehler beim Senden. Bitte versuche es erneut.')
        }
      }
    })
    .catch(err => {
      if (window.MDAL?.event) {
        MDAL.event({
          Name: 'form-submit-error',
          Parameters: [
            { Name: 'type', Value: 'network' },
            { Name: 'message', Value: err?.message || 'unknown-network-error' }
          ]
        })
      }
      if (typeof showToast === 'function') {
        showToast('Netzwerkfehler. Bitte später erneut versuchen.')
      }
    })
}
</script>

<template>
  <main ref="rootRef" class="contact-overlay">
    <!-- Logo oben links -->
    <router-link to="/" class="seo-logo">
      <img :src="pulkLogo" alt="Pulk Logo" class="logo-img" />
    </router-link>
    <SeoClose />
    <!-- Haupt-Layout -->
    <div class="contact-content">
      <!-- Bildbereich ----------------------------------------------------- -->
      <div class="image-section reveal-up" data-modal-delay="0">
        <picture>
          <source
            v-for="src in pulkContactImage.sources"
            :key="src.type"
            :srcset="src.srcset"
            :type="src.type"
          />

          <img
            :src="pulkContactImage.img.src"
            :srcset="pulkContactImage.img.srcset"
            :width="pulkContactImage.img.width"
            :height="pulkContactImage.img.height"
            alt="Studio Bild"
            class="contact-image"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>

      <!-- Formularbereich ------------------------------------------------- -->
      <div class="form-section reveal-up" data-modal-delay="0.15">
        <h2 class="contact-title">
          Der erste Schritt? <br>Eine kurze Nachricht
        </h2>
        <form
          ref="formRef"
          class="contact-form"
          method="POST"
          action="https://api.web3forms.com/submit"
          @submit.prevent="handleFormSubmit"
        >
          <!-- Hidden Web3Forms Data -->
          <input type="hidden" name="access_key" value="a8ef790f-fa7e-404d-b711-ed9764960209" />
          <input type="hidden" name="subject" value="Neue Anfrage von PULK Website" />
          <input type="hidden" name="from_name" value="PULK Website" />

          <!-- Anti-bot JS challenge -->
          <input type="hidden" name="js_challenge" :value="jsChallenge" />

          <!-- Honeypot -->
          <input
            v-model="contactForm.honeypot"
            type="text"
            class="honeypot"
            name="hp"
            autocomplete="off"
          />
          <input type="checkbox" name="botcheck" class="hidden" style="display:none" />

          <!-- Name + Email -->
          <div class="row two-cols">
            <input
              aria-label="Name oder Organisation"
              v-model="contactForm.name"
              type="text"
              name="fullName"
              placeholder="Vollständiger Name / Firma oder Organisation *"
              required
            />

            <input
              aria-label="E-Mail-Adresse"
              v-model="contactForm.company"
              type="email"
              name="company"
              placeholder="Email Adresse *"
              required
            />
          </div>

          <!-- Nutzung + Datum -->
          <div class="row two-cols">
            <select
              aria-label="Nutzung auswählen"
              v-model="contactForm.usage"
              name="usage"
              class="usage-select"
              required
            >
              <option value="" disabled>Art der Nutzung *</option>
              <option>Workshop</option>
              <option>Veranstaltung</option>
              <option>Andere Nutzung</option>
            </select>

            <input
              type="text"
              :value="displayRange"
              name="dateRange"
              placeholder="Datum wählen"
              readonly
              class="date-input"
              @click="showCalendar = true"
            />
          </div>

          <!-- Nachricht -->
          <div class="row">
            <textarea
              aria-label="Beschreibung"
              v-model="contactForm.message"
              name="message"
              placeholder="Bitte gib uns eine Beschreibung, was du vorhast *"
              required
            />
          </div>

          <!-- Submit-Button (Seitenvariante) -->
          <div class="row">
            <button
              type="submit"
              class="submit-btn"
              :disabled="!isFormValid"
            >
              Abschicken
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Kalender Overlay ---------------------------------------------------- -->
    <div
      v-if="showCalendar"
      class="calendar-backdrop"
      @click.self="showCalendar = false"
    >
      <div class="calendar-overlay">
        <Calendar
          is-expanded
          :attributes="attributes"
          :min-date="minDate"
          :max-date="maxDate"
          :disabled-dates="disabledPastDates"
          @dayclick="onDayClick"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
/* ============================================================================
 * CONTAINER / LAYOUT
 * ========================================================================== */
.contact-overlay {
  background: #E7E8EC;
  width: 100%;
  min-height: 100vh;
  overflow: auto;
  position: relative;
}

/* Globale Logo-Positionierung */
.absolute {
  margin: 2rem;
  width: max(7rem, 9%);
}

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

/* Haupt-Grid: Bild links, Formular rechts */
.contact-content {
  display: grid;
  grid-template-columns: 1fr 2.2fr;
  gap: 7rem;
  width: min(1400px, 92vw);
  margin: 11rem auto;
}


/* ============================================================================
 * FORM
 * ========================================================================== */
.form-section {
  grid-column: 2;
  max-width: 100%;
}

.contact-title {
  color: #141414;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 900;
  line-height: 1.07;
  margin: 0 0 3rem 0;
  font-size: clamp(2rem, 6vw, 3.8rem);
}

/* Zeilenlayout */
.contact-form .row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.contact-form .row.two-cols > * {
  flex: 1 1 calc(50% - 0.5rem);
}

/* Inputs */
.contact-form input,
.contact-form select,
.contact-form textarea {
  font-family: 'LayGrotesk', sans-serif !important;
  padding: 1.2rem 1.4rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(to top left, rgb(237,238,245) 0.5%, #fff 100%);
  font-size: 1rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
}

.contact-form textarea {
  min-height: 8rem;
  resize: vertical;
}

/* Placeholder */
::placeholder {
  color: rgba(20,20,20,0.4);
  font-size: 0.8rem;
  opacity: 1;
}

/* Select disabled */
.usage-select:invalid {
  color: rgba(0,0,0,0.4);
  font-size: 0.75rem;
}

/* Honeypot */
.honeypot { display: none; }

/* Submit Button */
.submit-btn {
  background: #000;
  color: #fff;
  border-radius: 9999px;
  border: none;
  padding: 0.9rem 2.2rem;
  font-family: 'LayGrotesk', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #141414;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
}

/* ============================================================================
 * IMAGE
 * ========================================================================== */
.image-section {
  grid-column: 1;
  overflow: hidden;
  border-radius: 1rem;
}

.contact-image {
  width: 100%;
  min-height: 32rem;
  object-fit: cover;
  border-radius: 1rem;
}


/* ============================================================================
 * CALENDAR OVERLAY
 * ========================================================================== */
.calendar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.calendar-overlay {
  background: #fff;
  border-radius: 8px;
  padding: 1rem 1rem 0 1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

/* Zusatz: klickbar markieren */
.date-input {
  cursor: pointer;
}

/* Ausgewählte Range */
.vc-selected-range .vc-day {
  background-color: #9687FF !important;
  color: #fff !important;
}

/* Reservierte Tage rot */
:deep(.vc-highlight.vc-disabled-bg) {
  background: #FF464E !important;
  background-image: none !important;
}

/* Kalender-Standardcleaning */
:deep(.vc-bordered),
:deep(.vc-pane),
:deep(.vc-header),
:deep(.vc-weeks),
:deep(.vc-days),
:deep(.vc-day) {
  border: 0 !important;
}

/* Disabled Days (Vergangenheit & Reserviert) */
:deep(.vc-day.is-disabled) {
  opacity: 0.4;
  cursor: default;
  pointer-events: none;
}

:deep(.vc-day.is-disabled .vc-day-content) {
  color: #999;
}


/* ============================================================================
 * RESPONSIVE BREAKPOINTS
 * ========================================================================== */
@media (max-width: 1024px){
  .contact-content{
    display: flex;
    flex-direction: column;
    gap: 2rem;
    width: min(900px, 92vw);
    margin: 6rem auto;
  }
  .form-section { order: 1; }
  .image-section { order: 2; }
}

@media (min-width: 641px) and (max-width: 1024px){
  .contact-content{
    grid-template-columns: 1fr;
    place-items: center;
    width: min(900px, 92vw);
    margin: 12rem auto;
    min-height: 80vh;
  }
  .form-section{
    width: min(720px, 88vw);
    margin: 0 auto;
  }
  .image-section { display: none !important; }
}

@media (max-width: 640px){
  .contact-title {
    font-size: clamp(3rem, 6vw, 3rem);
    margin: 0rem 1rem 3rem;
  }

  .contact-form .row.two-cols > * {
    flex: 1 1 100%;
    margin-bottom: 0.3rem;
  }

  .contact-image {
    width: 95svw;
    max-width: 92vw;
    margin: 0 auto;
    border-radius: 1rem;
  }
}
</style>
