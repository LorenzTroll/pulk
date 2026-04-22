<script setup>
/* -----------------------------------------------------------------------------
 * Imports
 * ---------------------------------------------------------------------------*/
import { ref, nextTick, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useHead } from '@vueuse/head'
import gsap from 'gsap'

import { Calendar } from 'hkanev-vue-calendar'
import { useCalendarStore } from '@/stores/calendar'
import SiteFooter from '@/components/SiteFooter.vue'
import { track } from '@/utils/tracking'

import 'hkanev-vue-calendar/dist/style.css'
import pulkContactImage from '@/assets/pulk_contact-imageA.png?w=640;1200;2000&format=avif;webp;png&as=picture'

/* -----------------------------------------------------------------------------
 * SEO / Meta
 * ---------------------------------------------------------------------------*/
useHead({
  title: 'PULK anfragen – Workshopraum mieten in Halle (Saale)',
  link: [{ rel: 'canonical', href: 'https://pulk.space/anfragen' }],
  meta: [
    {
      name: 'description',
      content:
        'Schreib uns, was du bei uns vorhast und welches Format du mitbringst. Verfügbarkeit prüfen, Anfrage schicken und wir antworten innerhalb von 24 Stunden.'
    },
    { name: 'robots', content: 'index,follow' },

    // Open Graph
    { property: 'og:title', content: 'PULK anfragen – Workshopraum mieten in Halle (Saale)' },
    {
      property: 'og:description',
      content:
        'Plant ihr einen Workshop, ein Seminar, Teammeeting oder ganz was anderes? Schickt uns eure Anfrage, wir melden uns innerhalb von 24 Stunden.'
    },
    { property: 'og:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'PULK – Workshopraum in Halle (Saale) anfragen' },
    { property: 'og:url', content: 'https://pulk.space/anfragen' },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'de_DE' },

    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'PULK anfragen – Workshopraum mieten in Halle (Saale)' },
    {
      name: 'twitter:description',
      content:
        'Schreib uns, was du bei uns vorhast und welches Format du mitbringst. Verfügbarkeit prüfen, Anfrage schicken und wir antworten innerhalb von 24 Stunden.'
    },
    { name: 'twitter:image', content: 'https://pulk.space/pulk-og-image_2025.jpg' }
  ],
  script: [
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ContactPage',
        name: 'Anfrage · PULK Halle (Saale)',
        description: 'Kontaktformular für Anfragen zur Miete des PULK Raums in Halle (Saale).',
        url: 'https://pulk.space/anfragen',
        mainEntity: {
          '@type': 'Organization',
          name: 'PULK',
          url: 'https://pulk.space'
        }
      })
    },
    {
      type: 'application/ld+json',
      children: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Start', item: 'https://pulk.space/' },
          { '@type': 'ListItem', position: 2, name: 'Raum mieten', item: 'https://pulk.space/anfragen' }
        ]
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

const contactForm = ref({
  name: '',
  company: '',
  usage: '',
  message: '',
  honeypot: ''
})

let contactStartFired = false
function markContactStart(field) {
  if (contactStartFired) return
  contactStartFired = true
  track('pulk.contact.start', { source: 'contact-page', field })
}

watch(
  () => [contactForm.value.name, contactForm.value.company, contactForm.value.message],
  (newVals, oldVals) => {
    if (contactStartFired) return
    const fieldKey = ['name', 'company', 'message']
    for (let i = 0; i < newVals.length; i++) {
      if ((newVals[i] || '').trim() && (newVals[i] || '').trim() !== (oldVals?.[i] || '').trim()) {
        markContactStart(fieldKey[i])
        break
      }
    }
  }
)

watch(
  () => contactForm.value.usage,
  (val, oldVal) => {
    if (val && val !== oldVal) {
      markContactStart('usage')
      track('pulk.contact.package-select', { package: val, source: 'contact-page' })
    }
  }
)

watch(
  () => [selectedRange.value.start, selectedRange.value.end],
  ([start, end], [oldStart, oldEnd]) => {
    if (!start) return
    if (start === oldStart && end === oldEnd) return
    markContactStart('date')

    const fmt = d => d instanceof Date ? d.toISOString().slice(0, 10) : ''
    const nights = end
      ? Math.max(1, Math.round((end - start) / 86400000))
      : 1
    track('pulk.contact.date-select', {
      start: fmt(start),
      end: fmt(end || start),
      nights,
      source: 'contact-page'
    })
  }
)

/* -----------------------------------------------------------------------------
 * Anti-Bot
 * ---------------------------------------------------------------------------*/
const openTimestamp = ref(Date.now())
const jsChallenge   = ref('')

/* -----------------------------------------------------------------------------
 * Submit-Feedback + Footer-Lift (neue Presentation-State)
 * ---------------------------------------------------------------------------*/
const submitFeedback    = ref(null)
const footerSentinelRef = ref(null)
const btnLift           = ref(0)
let scrollCleanup       = null

function updateLift() {
  const sentinel = footerSentinelRef.value
  if (!sentinel) return
  const rect = sentinel.getBoundingClientRect()
  const vh = window.innerHeight
  btnLift.value = Math.max(0, vh - rect.top)
}

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
let contactSubmitted = false

onMounted(async () => {
  await nextTick()

  jsChallenge.value = btoa(Math.random().toString(36).slice(2))
  openTimestamp.value = Date.now()

  track('pulk.contact.open', { source: 'contact-page' })

  calendar.fetchEvents()
  runPageReveal()

  const root = rootRef.value
  if (!root) return

  root.addEventListener('scroll', updateLift, { passive: true })
  scrollCleanup = () => root.removeEventListener('scroll', updateLift)
})

function contactStage() {
  const f = contactForm.value
  const filled = [
    f.name?.trim(),
    f.company?.trim(),
    f.usage,
    selectedRange.value.start,
    f.message?.trim()
  ].filter(Boolean).length
  if (filled === 0) return 'empty'
  if (isFormValid.value) return 'near-complete'
  return 'partial'
}

onBeforeUnmount(() => {
  tl?.kill()
  tl = null
  scrollCleanup?.()
  if (reservedNoticeTimer) clearTimeout(reservedNoticeTimer)

  if (!contactSubmitted && contactStartFired) {
    track('pulk.contact.abort', {
      via: 'page-leave',
      source: 'contact-page',
      stage: contactStage()
    })
  }
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

const disabledRanges = computed(() => {
  const past = { start: null, end: today }
  const reserved = calendar.events.map(evt => ({
    start: new Date(evt.dates.start),
    end: new Date(evt.dates.end ?? evt.dates.start)
  }))
  return [past, ...reserved]
})

const initialPage = computed(() => ({
  month: today.getMonth() + 1,
  year: today.getFullYear()
}))

function rangeHitsReserved(from, to) {
  const a = startOfDay(from)
  const b = startOfDay(to)
  const [lo, hi] = a <= b ? [a, b] : [b, a]
  return calendar.events.some(evt => {
    const s = startOfDay(new Date(evt.dates.start))
    const e = startOfDay(new Date(evt.dates.end ?? evt.dates.start))
    return s <= hi && e >= lo
  })
}

const reservedNotice = ref(null)
let reservedNoticeTimer = null

function flashReservedNotice(kind) {
  reservedNotice.value = kind
  track('pulk.contact.date-blocked', { reason: kind, source: 'contact-page' })
  if (reservedNoticeTimer) clearTimeout(reservedNoticeTimer)
  reservedNoticeTimer = setTimeout(() => {
    reservedNotice.value = null
  }, 2800)
}

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

  if (day.isDisabled || rangeHitsReserved(clicked, clicked)) {
    flashReservedNotice('day')
    return
  }

  // (a) kein Start, ODER (b) bereits bestätigter Range → neuen Single-Day starten
  if (!start || (end && start.getTime() !== end.getTime())) {
    selectedRange.value = { start: clicked, end: clicked }
    return
  }

  // Klick auf bereits ausgewählten Tag → bestätigen
  if (clicked.getTime() === start.getTime()) {
    showCalendar.value = false
    return
  }

  // Klick vor start → neuer Single-Day
  if (clicked < start) {
    selectedRange.value = { start: clicked, end: clicked }
    return
  }

  // Klick nach start → Range erweitern
  if (rangeHitsReserved(start, clicked)) {
    flashReservedNotice('range')
    return
  }

  selectedRange.value = { start, end: clicked }
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
    (contactForm.value.message?.trim().length ?? 0) >= 30
  )
)

const showMessageHint = computed(() => {
  const len = contactForm.value.message?.trim().length ?? 0
  return len > 0 && len < 30
})

/* -----------------------------------------------------------------------------
 * Submit handler — mit Anti-Bot + Tracking + Web3Forms
 * ---------------------------------------------------------------------------*/
const formRef = ref(null)

function handleFormSubmit() {
  const form = formRef.value
  if (!form) return

  if (Date.now() - openTimestamp.value < 1200) {
    console.warn('Blocked bot: too fast')
    if (typeof showToast === 'function') showToast('Verdächtige Anfrage blockiert.')
    return
  }

  if (!jsChallenge.value) {
    console.warn('Blocked bot: JS challenge missing')
    if (typeof showToast === 'function') showToast('Verdächtige Anfrage blockiert.')
    return
  }

  track('pulk.contact.submit', {
    method: 'web3forms',
    source: 'contact-page',
    package: contactForm.value.usage || ''
  })

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: new FormData(form)
  })
    .then(res => {
      if (res.ok) {
        contactSubmitted = true
        track('pulk.contact.success', { source: 'contact-page' })

        contactForm.value = {
          name: '',
          company: '',
          usage: '',
          message: '',
          honeypot: ''
        }
        selectedRange.value = { start: null, end: null }

        submitFeedback.value = 'submitted'
        setTimeout(() => { submitFeedback.value = null }, 5000)

        if (typeof showToast === 'function') {
          showToast('Danke für deine Anfrage – wir melden uns bei dir.')
        }
      } else {
        track('pulk.contact.error', {
          type: 'web3forms-response',
          status: res.status,
          source: 'contact-page'
        })
        if (typeof showToast === 'function') {
          showToast('Fehler beim Senden. Bitte versuche es erneut.')
        }
      }
    })
    .catch(err => {
      track('pulk.contact.error', {
        type: 'network',
        message: err?.message || 'unknown-network-error',
        source: 'contact-page'
      })
      if (typeof showToast === 'function') {
        showToast('Netzwerkfehler. Bitte später erneut versuchen.')
      }
    })
}
</script>

<template>
  <main ref="rootRef" class="contact-page">

    <!-- Haupt-Layout -->
    <div class="cp-content">

      <!-- Bildbereich -->
      <div class="image-section reveal-up">
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
            alt="PULK Raum"
            class="contact-image"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>

      <!-- Formularbereich -->
      <div class="form-section reveal-up">
        <div class="cp-text-block">
          <h1 class="contact-title">Planst du was?</h1>
          <p class="cp-subtitle">
            Schreibt uns, was ihr plant und wir melden uns innerhalb von 24 Stunden mit einem Vorschlag. Unverbindlich, ohne Haken.
            Auf Wunsch könnt ihr den Raum vorher besichtigen.
          </p>
        </div>

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
          <input type="hidden" name="js_challenge" :value="jsChallenge" />

          <!-- Honeypot -->
          <input
            v-model="contactForm.honeypot"
            type="text"
            class="honeypot"
            name="hp"
            autocomplete="off"
          />
          <input type="checkbox" name="botcheck" style="display:none" />

          <!-- Row 1: Name / Organisation | E-Mail -->
          <div class="row">
            <input
              aria-label="Vollständiger Name / Organisation"
              v-model="contactForm.name"
              type="text"
              name="fullName"
              placeholder="Vollständiger Name / Organisation"
              autocomplete="name"
              autocapitalize="words"
              required
            />
            <input
              aria-label="E-Mail"
              v-model="contactForm.company"
              type="email"
              name="company"
              placeholder="E-Mail"
              autocomplete="email"
              required
            />
          </div>

          <!-- Row 2: Preispaket | Datum -->
          <div class="row row--asymm">
            <div class="cp-select-wrap">
              <select
                aria-label="Preispaket wählen"
                v-model="contactForm.usage"
                name="usage"
                class="usage-select"
                required
              >
                <option value="" disabled>Preispaket</option>
                <option>Business</option>
                <option>Community</option>
                <option>Individuell</option>
              </select>
              <span class="cp-select-arrow" aria-hidden="true">
                <svg width="13" height="8" viewBox="0 0 13 8" fill="none">
                  <path d="M1 1L6.5 7L12 1" stroke="#141414" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </div>
            <input
              type="text"
              :value="displayRange"
              name="dateRange"
              placeholder="Datum auswählen"
              readonly
              class="date-input"
              @click="showCalendar = true"
            />
          </div>

          <!-- Row 3: Nachricht -->
          <div class="row">
            <div class="cp-message-wrap">
              <textarea
                aria-label="Beschreibung"
                v-model="contactForm.message"
                name="message"
                placeholder="Erzähl uns kurz, was ihr vorhabt. Format, Personenzahl, Zeitraum (mind. 30 Zeichen)."
                minlength="30"
                required
              />
              <p v-if="showMessageHint" class="cp-message-hint">Ein paar Zeichen fehlen noch.</p>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Kalender Overlay -->
    <div
      v-if="showCalendar"
      class="calendar-backdrop"
      @click.self="showCalendar = false"
    >
      <div class="calendar-overlay">
        <p
          class="calendar-hint"
          :class="{ 'is-warn': reservedNotice }"
          aria-live="polite"
        >
          <template v-if="reservedNotice">
            Dieser Tag ist bereits reserviert
          </template>
          <template v-else>
            Rot markierte Tage sind bereits vergeben.
          </template>
        </p>
        <Calendar
          is-expanded
          :attributes="attributes"
          :min-date="minDate"
          :max-date="maxDate"
          :disabled-dates="disabledRanges"
          :initial-page="initialPage"
          :from-page="initialPage"
          @dayclick="onDayClick"
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="cp-footer-wrap">
      <div ref="footerSentinelRef"></div>
      <SiteFooter
        instagram-url="https://instagram.com/pulk.space"
        impressum-href="/impressum"
        datenschutz-href="/datenschutz"
        company="Pulk"
      />
    </div>

    <!-- Bottom Nav -->
    <nav
      class="cp-bottom-nav"
      :style="{ bottom: `calc(2rem + env(safe-area-inset-bottom, 0px) + ${btnLift}px)` }"
    >
      <button
        class="cp-tab cp-submit"
        :disabled="!isFormValid && submitFeedback !== 'submitted'"
        @click="handleFormSubmit"
      >
        {{ submitFeedback === 'submitted' ? 'Abgesendet' : 'Abschicken' }}
      </button>
      <router-link to="/" class="cp-tab cp-close">
        <span>Schließen</span>
        <span class="cp-close-icon">✕</span>
      </router-link>
    </nav>

  </main>
</template>

<style scoped>
/* ============================================================================
 * Container
 * ============================================================================*/
.contact-page {
  background: #e7e8ec;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  box-sizing: border-box;
  font-family: 'LayGrotesk', sans-serif;
  padding: 2rem 7.25% 1.5rem 2rem;
}

/* ============================================================================
 * Hero Layout: Bild links — Formular rechts
 * ============================================================================*/
.cp-content {
  display: flex;
  align-items: stretch;
  gap: 8.625rem;
}

/* Bild */
.image-section {
  flex: 0 0 40%;
  border-radius: 0.625rem;
  overflow: hidden;
  min-height: 36rem;
}

.image-section picture {
  display: block;
  width: 100%;
  height: 100%;
}

.contact-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
}

/* Formular */
.form-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4.625rem;
}

/* ============================================================================
 * Text
 * ============================================================================*/
.cp-text-block {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contact-title {
  font-size: clamp(2.5rem, 4vw, 3.625rem);
  font-weight: 900;
  line-height: 1.1;
  color: #141414;
  margin: 0;
  padding-top: 5rem;
}

.cp-subtitle {
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  font-weight: 400;
  line-height: 2rem;
  letter-spacing: -0.015625rem;
  color: #141414;
  margin: 0;
  max-width: 80%;
}

/* ============================================================================
 * Form
 * ============================================================================*/
.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.1875rem;
}

.row {
  display: flex;
  gap: 0.875rem;
}

.cp-message-wrap {
  position: relative;
  width: 100%;
}

.cp-message-wrap textarea {
  padding-bottom: 2.75rem;
}

.cp-message-hint {
  position: absolute;
  left: 1.25rem;
  bottom: 1rem;
  margin: 0;
  font-family: 'LayGrotesk', sans-serif;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: rgba(20, 20, 20, 0.55);
  pointer-events: none;
}

.row--asymm .cp-select-wrap {
  flex: 0 0 55%;
}

.row--asymm .date-input {
  flex: 1;
}

/* Inputs, Textarea */
.contact-form input,
.contact-form textarea {
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
  width: 100%;
  box-sizing: border-box;
  min-height: 4.5rem;
}

.contact-form input:focus,
.contact-form textarea:focus {
  border-color: #9687FF;
}

.contact-form input::placeholder,
.contact-form textarea::placeholder {
  color: rgba(20, 20, 20, 0.7);
}

/* Browser-Autofill-Hintergrund unterbinden (Chrome/Safari/Firefox) */
.contact-form input:-webkit-autofill,
.contact-form input:-webkit-autofill:hover,
.contact-form input:-webkit-autofill:focus,
.contact-form input:-webkit-autofill:active {
  -webkit-text-fill-color: #141414;
  transition: background-color 600000s 0s, color 600000s 0s;
  caret-color: #141414;
}
.contact-form input:autofill {
  background: transparent;
}

.contact-form textarea {
  min-height: 9rem;
  resize: vertical;
  align-self: stretch;
  line-height: 1.5rem;
}

/* Select wrapper */
.cp-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.cp-select-wrap select {
  font-family: 'LayGrotesk', sans-serif;
  font-size: 1rem;
  line-height: 2rem;
  letter-spacing: -0.01rem;
  color: #141414;
  padding: 1.25rem 3rem 1.25rem 1.25rem;
  border: 0.125rem solid #141414;
  border-radius: 0.625rem;
  background: transparent;
  outline: none;
  width: 100%;
  min-height: 4.5rem;
  box-sizing: border-box;
  appearance: none;
  -webkit-appearance: none;
  cursor: pointer;
}

.cp-select-wrap select:invalid,
.cp-select-wrap select option[disabled] {
  color: rgba(20, 20, 20, 0.7);
}

.cp-select-arrow {
  position: absolute;
  right: 1.25rem;
  pointer-events: none;
  display: flex;
  align-items: center;
}

/* Date input */
.date-input {
  cursor: pointer;
}

/* Honeypot */
.honeypot { display: none; }

/* ============================================================================
 * Calendar Overlay
 * ============================================================================*/
.calendar-backdrop {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.calendar-overlay {
  background: #fff;
  border-radius: 0.5rem;
  padding: 1rem 1rem 0 1rem;
  box-shadow: 0 0.25rem 1rem rgba(0, 0, 0, 0.2);
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
}

:deep(.vc-container) {
  --vc-accent-200: rgba(150, 135, 255, 0.2);
  --vc-accent-300: rgba(150, 135, 255, 0.4);
  --vc-accent-400: #9687FF;
  --vc-accent-500: #9687FF;
  --vc-accent-600: #9687FF;
  --vc-accent-700: #7e6fe0;
  --vc-accent-800: #6558c8;
  --vc-accent-900: #4d41b0;
  --vc-day-content-hover-bg: rgba(150, 135, 255, 0.25);
  --vc-header-arrow-hover-bg: rgba(150, 135, 255, 0.25);
  --vc-nav-hover-bg: rgba(150, 135, 255, 0.25);
  --vc-focus-ring: 0 0 0 2px rgba(150, 135, 255, 0.5);
}

:deep(.vc-focus:focus-within) {
  box-shadow: 0 0 0 2px rgba(150, 135, 255, 0.5) !important;
}

:deep(.vc-arrow:hover) {
  background: rgba(150, 135, 255, 0.25) !important;
}

:deep(.vc-day-content:hover) {
  background-color: rgba(150, 135, 255, 0.25) !important;
}

:deep(.vc-highlight-bg-solid) {
  background-color: #9687FF !important;
}

:deep(.vc-highlight-bg-light) {
  background-color: rgba(150, 135, 255, 0.25) !important;
}

:deep(.vc-highlight-bg-outline),
:deep(.vc-highlight-bg-none) {
  border-color: #9687FF !important;
}

:deep(.vc-highlight-content-solid),
:deep(.vc-highlight-content-outline),
:deep(.vc-highlight-content-none) {
  color: #fff !important;
}

:deep(.vc-highlight-content-light) {
  color: #141414 !important;
}

:deep(.vc-nav-item.is-active) {
  background-color: #9687FF !important;
}

:deep(.vc-highlight.vc-disabled-bg) {
  background: #FF464E !important;
  background-image: none !important;
}

:deep(.vc-bordered),
:deep(.vc-pane),
:deep(.vc-header),
:deep(.vc-weeks),
:deep(.vc-days),
:deep(.vc-day) {
  border: 0 !important;
}

:deep(.vc-day.is-disabled) {
  cursor: not-allowed;
  pointer-events: none;
}

:deep(.vc-day.is-disabled .vc-day-content) {
  opacity: 0.4;
  color: #999;
}

/* Reservierte Tage bleiben voll sichtbar in Rot, nicht ausgegraut */
:deep(.vc-day.is-disabled .vc-day-content.vc-disabled-day) {
  opacity: 1;
  color: #fff !important;
}

.calendar-hint {
  font-family: 'LayGrotesk', sans-serif;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.3;
  color: #141414;
  margin: 0 0 0.75rem;
  padding: 0.625rem 0.875rem;
  border-radius: 0.375rem;
  background: rgba(20, 20, 20, 0.06);
  transition: background 0.2s ease, color 0.2s ease;
}

.calendar-hint.is-warn {
  background: rgba(255, 70, 78, 0.12);
  color: #B02E35;
}

/* ============================================================================
 * Bottom Nav
 * ============================================================================*/
.cp-bottom-nav {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  transition: bottom 0.3s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2000;
  white-space: nowrap;
}

.cp-tab {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-family: 'LayGrotesk', sans-serif;
  font-weight: 500;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: transform 0.2s ease, background 0.2s ease;
}

.cp-tab:hover {
  transform: scale(1.05);
}

.cp-submit {
  background: #141414;
  color: #fff;
}

.cp-submit:disabled {
  background: #ccc;
  color: #666;
  cursor: not-allowed;
  transform: none;
}

.cp-close {
  background: #eef1f6;
  color: #141414;
}

.cp-close-icon {
  font-size: 1rem;
}

/* ============================================================================
 * Footer Breakout
 * ============================================================================*/
.cp-footer-wrap {
  margin-top: 8rem;
  margin-left: -7.25vw;
  margin-right: -7.25vw;
  margin-bottom: -10rem;
}

/* SiteFooter hat default position:absolute — hier auf flow zurücksetzen */
.cp-footer-wrap :deep(.site-footer) {
  position: relative;
  left: auto;
  right: auto;
  bottom: auto;
}

/* ============================================================================
 * Tablet
 * ============================================================================*/
@media (max-width: 64rem) {
  .contact-page {
    padding: 2rem 7.25% 10rem;
  }

  .cp-content {
    flex-direction: column;
    gap: 3rem;
  }

  .form-section {
    order: 1;
  }

  .image-section {
    order: 2;
    flex: none;
    width: 100%;
    min-height: 50rem;
    max-height: 50rem;
    height: 50rem;
    overflow: hidden;
    margin-bottom: 5rem;
    display: flex;
    align-items: stretch;
  }

  .image-section picture {
    flex: 1;
    display: block;
    width: 100%;
    height: 100%;
  }

  .contact-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .cp-footer-wrap {
    margin-left: -7.25vw;
    margin-right: -7.25vw;
  }
}

/* ============================================================================
 * Mobile
 * ============================================================================*/
@media (max-width: 40rem) {
  .contact-page {
    padding: 3rem 6% 10rem;
  }

  .contact-title {
    padding-top: 2rem;
  }

  .cp-subtitle {
    max-width: 100%;
  }

  .row {
    flex-direction: column;
  }

  .row--asymm .cp-select-wrap,
  .row--asymm .date-input {
    flex: none;
    width: 100%;
  }

  .image-section {
    min-height: 40rem;
    max-height: unset;
    height: 40rem;
    margin-bottom: 2rem;
  }

  .image-section picture {
    flex: 1;
    width: 100%;
    height: 100%;
  }

  .cp-bottom-nav {
    gap: 0.5rem;
  }

  .cp-tab {
    padding: 1rem;
    font-size: 0.95rem;
  }

  .cp-footer-wrap {
    margin-left: -6vw;
    margin-right: -6vw;
    margin-bottom: -10rem;
  }
}
</style>
