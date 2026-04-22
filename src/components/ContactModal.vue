<script setup>
/* -----------------------------------------------------------------------------
 * Imports
 * ---------------------------------------------------------------------------*/
import {
  ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
  computed
} from 'vue'

import { useHead } from '@vueuse/head'
import Modal from './Modal.vue'
import { Calendar } from 'hkanev-vue-calendar'

import { useOverlayStore } from '@/stores/overlay'
import { useCalendarStore } from '@/stores/calendar'

import { getGsap } from '@/composables/lazyGsap'
import { useRevealUp } from '@/composables/useRevealUp'
import { track } from '@/utils/tracking'

import 'hkanev-vue-calendar/dist/style.css'
import pulkContactImage from '@/assets/pulk_contact-imageA.png?w=640;1200;2000&format=avif;webp;png&as=picture'

/* -----------------------------------------------------------------------------
 * Props & Emits
 * ---------------------------------------------------------------------------*/
const props = defineProps({
  visible: { type: Boolean, required: true },
  enterDelay: { type: Number, default: 0.4 },
  stagger: { type: Number, default: 0.2 }
})

const emit = defineEmits(['close'])

/* -----------------------------------------------------------------------------
 * Stores
 * ---------------------------------------------------------------------------*/
const overlay = useOverlayStore()
const calendar = useCalendarStore()

/* -----------------------------------------------------------------------------
 * Refs & State
 * ---------------------------------------------------------------------------*/
const rootRef = ref(null)
const showCalendar = ref(false)
const selectedRange = ref({ start: null, end: null })
const formRef = ref(null)

let tl = null
let gsap = null

/* -----------------------------------------------------------------------------
 * Anti-Bot: Time-Lock + JS-Challenge
 * ---------------------------------------------------------------------------*/
const openTimestamp = ref(Date.now())
const jsChallenge = ref('')

onMounted(() => {
  jsChallenge.value = btoa(Math.random().toString(36).slice(2))
  openTimestamp.value = Date.now()

  calendar.fetchEvents()
  window.addEventListener('submit-contact', handleFormSubmit)
})

onBeforeUnmount(() => {
  window.removeEventListener('submit-contact', handleFormSubmit)
  if (reservedNoticeTimer) clearTimeout(reservedNoticeTimer)
})

/* -----------------------------------------------------------------------------
 * Reset beim Öffnen
 * ---------------------------------------------------------------------------*/
let contactStartFired = false
let contactSubmitted = false

function contactStage() {
  const f = overlay.contactForm
  const filled = [
    f.name?.trim(),
    f.company?.trim(),
    f.usage,
    selectedRange.value.start,
    f.message?.trim()
  ].filter(Boolean).length
  if (filled === 0) return 'empty'
  if (overlay.isContactValid) return 'near-complete'
  return 'partial'
}

function markContactStart(field) {
  if (contactStartFired) return
  contactStartFired = true
  track('pulk.contact.start', { source: 'contact-modal', field })
}

watch(
  () => props.visible,
  visible => {
    if (!visible) {
      if (contactStartFired && !contactSubmitted) {
        track('pulk.contact.abort', {
          via: 'modal-close',
          source: 'contact-modal',
          stage: contactStage()
        })
      }
      contactStartFired = false
      contactSubmitted = false
      showCalendar.value = false
      selectedRange.value = { start: null, end: null }
      overlay.contactForm.dateStart = null
      overlay.contactForm.dateEnd = null
      return
    }

    openTimestamp.value = Date.now()
    jsChallenge.value = btoa(Math.random().toString(36).slice(2))
    track('pulk.contact.open', { source: 'contact-modal' })
  }
)

watch(
  () => [overlay.contactForm.name, overlay.contactForm.company, overlay.contactForm.message],
  (newVals, oldVals) => {
    if (!props.visible || contactStartFired) return
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
  () => overlay.contactForm.usage,
  (val, oldVal) => {
    if (!props.visible) return
    if (val && val !== oldVal) {
      markContactStart('usage')
      track('pulk.contact.package-select', { package: val, source: 'contact-modal' })
    }
  }
)

watch(
  () => [selectedRange.value.start, selectedRange.value.end],
  ([start, end], [oldStart, oldEnd]) => {
    if (!props.visible || !start) return
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
      source: 'contact-modal'
    })
  }
)

/* -----------------------------------------------------------------------------
 * GSAP Reveal-Up Animations
 * ---------------------------------------------------------------------------*/
useRevealUp('.reveal-up', {
  container: rootRef,
  once: true
})

watch(
  () => props.visible,
  async visible => {
    if (!visible) {
      tl?.kill()
      tl = null
      if (rootRef.value) {
        const els = rootRef.value.querySelectorAll('.reveal-up')
        if (gsap) gsap.set(els, { clearProps: 'transform,opacity,willChange' })
      }
      return
    }

    await nextTick()

    gsap = await getGsap()
    if (!gsap) return

    const container = rootRef.value
    if (!container) return

    const targets = [...container.querySelectorAll('.reveal-up')]

    tl?.kill()
    tl = gsap.timeline({
      defaults: { duration: 0.8, ease: 'power2.out' },
      delay: props.enterDelay
    })

    tl.fromTo(
      targets,
      {
        y: (i, el) => (Number(gsap.getProperty(el, 'y')) || 0) + 32,
        opacity: 0,
        willChange: 'transform,opacity'
      },
      {
        y: (i, el) => Number(gsap.getProperty(el, 'y')) || 0,
        opacity: 1,
        delay: (i, el) => Number(el.getAttribute('data-modal-delay')) || 0,
        stagger: props.stagger,
        clearProps: 'willChange'
      },
      0
    )
  }
)

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

const startOfDay = d => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
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
  track('pulk.contact.date-blocked', { reason: kind, source: 'contact-modal' })
  if (reservedNoticeTimer) clearTimeout(reservedNoticeTimer)
  reservedNoticeTimer = setTimeout(() => {
    reservedNotice.value = null
  }, 2800)
}

/* -----------------------------------------------------------------------------
 * Calendar selection
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
    overlay.contactForm.dateStart = clicked
    overlay.contactForm.dateEnd = clicked
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
    overlay.contactForm.dateStart = clicked
    overlay.contactForm.dateEnd = clicked
    return
  }

  // Klick nach start → Range erweitern
  if (rangeHitsReserved(start, clicked)) {
    flashReservedNotice('range')
    return
  }

  selectedRange.value = { start, end: clicked }
  overlay.contactForm.dateEnd = clicked
  showCalendar.value = false
}

/* -----------------------------------------------------------------------------
 * Display Range
 * ---------------------------------------------------------------------------*/
const displayRange = computed(() => {
  const { start, end } = selectedRange.value
  if (!start) return ''

  const fmt = d =>
    new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(d))

  if (!end) return fmt(start)
  if (start.getTime() === end.getTime()) return fmt(start)
  return `${fmt(start)} – ${fmt(end)}`
})

const showMessageHint = computed(() => {
  const len = overlay.contactForm.message.trim().length
  return len > 0 && len < 30
})

/* -----------------------------------------------------------------------------
 * Form submit (anti-bot + Web3Forms)
 * ---------------------------------------------------------------------------*/
function handleFormSubmit() {
  const form = formRef.value
  if (!form) return

  const submitDelay = Date.now() - openTimestamp.value
  if (submitDelay < 1200) {
    console.warn('Blocked bot: submission too fast', submitDelay)
    showToast('Verdächtige Anfrage blockiert.')
    return
  }

  if (!jsChallenge.value) {
    console.warn('Blocked bot: JS challenge missing')
    showToast('Verdächtige Anfrage blockiert.')
    return
  }

  track('pulk.contact.submit', {
    method: 'web3forms',
    source: 'contact-modal',
    package: overlay.contactForm.usage || ''
  })

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: new FormData(form)
  })
    .then(res => {
      if (res.ok) {
        contactSubmitted = true
        track('pulk.contact.success', { source: 'contact-modal' })
        overlay.markSubmitted()
        overlay.close()
        overlay.resetForm()
      } else {
        track('pulk.contact.error', {
          type: 'web3forms-response',
          status: res.status,
          source: 'contact-modal'
        })
        showToast('Fehler beim Senden. Bitte versuche es erneut.')
      }
    })
    .catch(err => {
      track('pulk.contact.error', {
        type: 'network',
        message: err?.message || 'unknown-network-error',
        source: 'contact-modal'
      })
      showToast('Netzwerkfehler. Bitte später erneut versuchen.')
    })
}
</script>

<template>
  <Modal :visible="props.visible" aria-label="Kontaktformular — Anfrage an PULK" @close="emit('close')">
    <div
      ref="rootRef"
      class="contact-overlay"
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
    >
      <!-- Haupt-Layout -->
      <div class="co-content">

        <!-- Bildbereich -->
        <div class="co-image-wrap">
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
              class="co-image"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>

        <!-- Formularbereich -->
        <div class="co-form-wrap">
          <div class="co-text-block">
            <h1 class="co-title">Plant ihr was?</h1>
            <p class="co-subtitle">
              Erzähl uns davon und wir melden uns innerhalb von 24 Stunden mit einem Vorschlag. Unverbindlich, ohne Haken.
              Auf Wunsch könnt ihr den Raum vorher besichtigen.
            </p>
          </div>

          <form
            ref="formRef"
            class="co-form"
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
            <input v-model="overlay.contactForm.honeypot" type="text" class="co-honeypot" name="hp" autocomplete="off" />
            <input type="checkbox" name="botcheck" style="display:none" />

            <!-- Row 1: Name / Organisation | E-Mail -->
            <div class="co-row">
              <input
                aria-label="Vollständiger Name / Organisation"
                v-model="overlay.contactForm.name"
                type="text"
                name="fullName"
                placeholder="Vollständiger Name / Organisation"
                autocomplete="name"
                autocapitalize="words"
                required
              />
              <input
                aria-label="E-Mail"
                v-model="overlay.contactForm.company"
                type="email"
                name="company"
                placeholder="E-Mail"
                autocomplete="email"
                required
              />
            </div>

            <!-- Row 2: Preispaket | Datum -->
            <div class="co-row co-row--asymm">
              <div class="co-select-wrap">
                <select
                  aria-label="Preispaket wählen"
                  v-model="overlay.contactForm.usage"
                  name="usage"
                  required
                >
                  <option value="" disabled>Preispaket</option>
                  <option>Business</option>
                  <option>Community</option>
                  <option>Individuell</option>
                </select>
                <span class="co-select-arrow" aria-hidden="true">
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
                class="co-date-input"
                @click="showCalendar = true"
              />
            </div>

            <!-- Row 3: Nachricht -->
            <div class="co-row">
              <div class="co-message-wrap">
                <textarea
                  aria-label="Beschreibung"
                  v-model="overlay.contactForm.message"
                  name="message"
                  placeholder="Erzähl uns kurz, was ihr vorhabt. Format, Personenzahl, Zeitraum (mind. 30 Zeichen)."
                  minlength="30"
                  required
                />
                <p v-if="showMessageHint" class="co-message-hint">Ein paar Zeichen fehlen noch.</p>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Kalender Overlay (unverändert) -->
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
    </div>
  </Modal>
</template>

<style scoped>
/* ============================================================================
 * Container
 * ============================================================================*/
.contact-overlay {
  background: #e7e8ec;
  width: 100%;
  min-height: 100%;
  align-self: flex-start;
  box-sizing: border-box;
  font-family: 'LayGrotesk', sans-serif;
  padding: 2rem 7.25% 1.8rem 2rem;
  position: relative;
}

/* ============================================================================
 * Hero Layout: Bild links — Formular rechts
 * ============================================================================*/
.co-content {
  display: flex;
  align-items: stretch;
  gap: 8.625rem;
}

/* Bild */
.co-image-wrap {
  flex: 0 0 40%;
  border-radius: 0.625rem;
  overflow: hidden;
  min-height: 36rem;
}

.co-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
}

/* Formular */
.co-form-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4.625rem;
}

/* ============================================================================
 * Text
 * ============================================================================*/
.co-text-block {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.co-title {
  font-size: clamp(2.5rem, 4vw, 3.625rem);
  font-weight: 900;
  line-height: 1.1;
  color: #141414;
  margin: 0;
  padding-top: 5rem;
}

.co-subtitle {
  font-size: clamp(1.25rem, 1.4vw, 1.5625rem);
  font-weight: 400;
  line-height: 2rem;
  letter-spacing: -0.015625rem;
  color: #141414;
  margin: 0;
  max-width: 90%;
}

/* ============================================================================
 * Form
 * ============================================================================*/
.co-form {
  display: flex;
  flex-direction: column;
  gap: 1.1875rem;
}

.co-row {
  display: flex;
  gap: 0.875rem;
}

.co-message-wrap {
  position: relative;
  width: 100%;
}

.co-message-wrap textarea {
  padding-bottom: 2.75rem;
}

.co-message-hint {
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

.co-row--asymm .co-select-wrap {
  flex: 0 0 55%;
}

.co-row--asymm .co-date-input {
  flex: 1;
}

/* Inputs, Textarea */
.co-form input,
.co-form textarea {
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

.co-form input:focus,
.co-form textarea:focus {
  border-color: #9687FF;
}

.co-form input::placeholder,
.co-form textarea::placeholder {
  color: rgba(20, 20, 20, 0.7);
}

/* Browser-Autofill-Hintergrund unterbinden (Chrome/Safari/Firefox) */
.co-form input:-webkit-autofill,
.co-form input:-webkit-autofill:hover,
.co-form input:-webkit-autofill:focus,
.co-form input:-webkit-autofill:active {
  -webkit-text-fill-color: #141414;
  transition: background-color 600000s 0s, color 600000s 0s;
  caret-color: #141414;
}
.co-form input:autofill {
  background: transparent;
}

.co-form textarea {
  min-height: 13.875rem;
  resize: vertical;
  align-self: stretch;
}

/* Select wrapper */
.co-select-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.co-select-wrap select {
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

.co-select-wrap select:invalid,
.co-select-wrap select option[disabled] {
  color: rgba(20, 20, 20, 0.7);
}

.co-select-arrow {
  position: absolute;
  right: 1.25rem;
  pointer-events: none;
  display: flex;
  align-items: center;
}

/* Date input */
.co-date-input {
  cursor: pointer;
}

/* Honeypot */
.co-honeypot { display: none; }

/* ============================================================================
 * Calendar Overlay (unverändert)
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

:deep(.vc-arrow:hover) {
  background-color: rgba(150, 135, 255, 0.25) !important;
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
 * Tablet
 * ============================================================================*/
@media (max-width: 64rem) {
  .contact-overlay {
    padding: 2rem 7.25% 2rem;
  }

  .co-content {
    flex-direction: column;
    gap: 3rem;
  }

  .co-form-wrap {
    order: 1;
    margin-bottom: 3rem;
  }

  .co-image-wrap {
    order: 2;
    flex: none;
    width: 100%;
    min-height: 50rem;
    max-height: 50rem;
    overflow: hidden;
    margin-bottom: 5rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .co-subtitle {
    max-width: 90%;
  }
}

/* ============================================================================
 * Mobile
 * ============================================================================*/
@media (max-width: 40rem) {
  .contact-overlay {
    padding: 3rem 6% 6rem;
  }

  .co-content {
    gap: 0rem;
  }

  .co-row {
    flex-direction: column;
  }

  .co-row--asymm .co-select-wrap,
  .co-row--asymm .co-date-input {
    flex: none;
    width: 100%;
  }

  .co-form-wrap {
    order: 1;
  }

  .co-image-wrap {
    order: 2;
    min-height: 30rem;
  }
}
</style>
