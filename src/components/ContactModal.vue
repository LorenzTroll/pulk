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

import 'hkanev-vue-calendar/dist/style.css'
import pulkLogo from '@/assets/pulk-logo-neoncoral_E3.svg'
import pulkContactImage from '@/assets/PULK_250513_Foto_Michel_Klehm_4.jpg?w=640;1200;2000&format=avif;webp;jpg&as=picture'

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
})

/* -----------------------------------------------------------------------------
 * Reset beim Öffnen
 * ---------------------------------------------------------------------------*/
watch(
  () => props.visible,
  visible => {
    if (!visible) {
      showCalendar.value = false
      selectedRange.value = { start: null, end: null }
      overlay.contactForm.dateStart = null
      overlay.contactForm.dateEnd = null
      return
    }

    openTimestamp.value = Date.now()
    jsChallenge.value = btoa(Math.random().toString(36).slice(2))
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

const disabledPastDates = computed(() => [{ start: null, end: today }])

/* -----------------------------------------------------------------------------
 * Calendar selection
 * ---------------------------------------------------------------------------*/
function onDayClick(day) {
  const clicked = startOfDay(day.date)
  const { start, end } = selectedRange.value

  if (clicked <= today) return
  if (day.customData?.disabled) return

  if (!start || end) {
    selectedRange.value = { start: clicked, end: null }
    overlay.contactForm.dateStart = clicked
    overlay.contactForm.dateEnd = null
    return
  }

  if (clicked < start) {
    selectedRange.value = { start: clicked, end: null }
    overlay.contactForm.dateStart = clicked
    overlay.contactForm.dateEnd = null
    return
  }

  selectedRange.value.end = clicked
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

  fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    body: new FormData(form)
  })
    .then(res => {
      if (res.ok) {
        overlay.markSubmitted()
        overlay.close()
        overlay.resetForm()
      } else {
        showToast('Fehler beim Senden. Bitte versuche es erneut.')
      }
    })
    .catch(() => {
      showToast('Netzwerkfehler. Bitte später erneut versuchen.')
    })
}
</script>

<template>
  <Modal :visible="props.visible" @close="emit('close')">
    <div ref="rootRef" class="contact-overlay">
      <!-- Logo oben links -->
      <img
        :src="pulkLogo"
        alt="Pulk Logo"
        class="absolute top-6 left-6 w-12 h-12"
      />
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
              v-model="overlay.contactForm.honeypot"
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
                v-model="overlay.contactForm.name"
                type="text"
                name="fullName"
                placeholder="Vollständiger Name / Firma oder Organisation *"
                required
                @focus="trackFormField('name')"
              />
              <input
                aria-label="E-Mail-Adresse"
                v-model="overlay.contactForm.company"
                type="email"
                name="company"
                placeholder="Email Adresse *"
                required
                @focus="trackFormField('email')"
              />
            </div>
            <!-- Nutzung + Datum -->
            <div class="row two-cols">
              <select
                aria-label="Nutzung auswählen"
                v-model="overlay.contactForm.usage"
                name="usage"
                class="usage-select"
                required
                @focus="trackFormField('usage')"
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
                @focus="trackFormField('dateRange')"
              />
            </div>
            <!-- Nachricht -->
            <div class="row">
              <textarea
                aria-label="Beschreibung"
                v-model="overlay.contactForm.message"
                name="message"
                placeholder="Bitte gib uns eine Beschreibung, was du vorhast *"
                required
                @focus="trackFormField('message')"
              />
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
    </div>
  </Modal>
</template>

<style scoped>
/* ============================================================================
 * CONTAINER / LAYOUT
 * ========================================================================== */
.contact-overlay {
  background: #E7E8EC;
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

/* Globale Logo-Positionierung */
.absolute {
  margin: 2rem;
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
.contact-form textarea,
.usage-select {
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

.usage-select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;

  padding: 1.2rem 1.4rem !important;
  height: 3.6rem !important; /* match input height */
  line-height: 1.4rem !important;

  display: flex;
  align-items: center;
}

/* iOS Safari compensation */
@supports (-webkit-touch-callout: none) {
  .usage-select {
    height: 3.8rem !important; 
  }
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
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
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
