<!-- src/components/ContactModal.vue -->
<script setup>
import { defineProps, defineEmits, onMounted, computed, ref, watch } from 'vue'
import { useOverlayStore }  from '@/stores/overlay'
import { Calendar }         from 'hkanev-vue-calendar'
import { useCalendarStore } from '@/stores/calendar'
import 'hkanev-vue-calendar/dist/style.css'
import Modal                from './Modal.vue'
import pulkLogo             from '@/assets/pulk-logo-neoncoral.svg'

const props    = defineProps({ visible: Boolean })
const emit     = defineEmits(['close'])
const overlay  = useOverlayStore()
const calendar = useCalendarStore()

// steuert Ein-/Ausblenden des Kalenders
const showCalendar = ref(false)

// reset, wenn das Modal geschlossen wird
watch(() => props.visible, v => {
  if (!v) showCalendar.value = false
})

onMounted(() => {
  calendar.fetchEvents()
})

// ausgewählter Bereich
const selectedRange = ref({ start: null, end: null })

const attributes = computed(() => {
  const used = calendar.events.map(evt => ({
    key: `used-${evt.id}`,
    dates: { start: evt.dates.start, end: evt.dates.end },
    highlight: {
      class: 'vc-disabled-bg',
      contentClass: 'vc-disabled-day'
    },
    customData: { disabled: true }
  }))
  const sel = (selectedRange.value.start && selectedRange.value.end)
    ? [{
        key: 'sel-range',
        dates: {
          start: selectedRange.value.start,
          end:   selectedRange.value.end
        },
        highlight: { class: 'vc-selected-range' }
      }]
    : []
  return [...used, ...sel]
})

function onDayClick(day) {
  if (day.customData?.disabled) return

  if (!selectedRange.value.start || selectedRange.value.end) {
    // 1. Klick: nur Start wählen
    selectedRange.value = { start: day.date, end: null }
    overlay.contactForm.dateStart = day.date
    overlay.contactForm.dateEnd   = null
    // hier NOCH NICHT schliessen, damit man die Auswahl sieht
  } else {
    // 2. Klick: End-Datum wählen
    selectedRange.value.end = day.date
    overlay.contactForm.dateEnd = day.date
    showCalendar.value = false    // erst jetzt schließen
  }
}

// für Anzeige im Input-Feld
const displayRange = computed(() => {
  const { start, end } = selectedRange.value
  if (start && end) return `${start} – ${end}`
  if (start) return start
  return ''
})
</script>


<template>
  <Modal :visible="props.visible" @close="emit('close')">
    <div class="contact-overlay">
      <img
        :src="pulkLogo"
        alt="Pulk Logo"
        class="absolute top-6 left-6 w-12 h-12"
      />

      <div class="contact-content">
        <!-- Formular -->
        <div class="form-section">
          <h2 class="contact-title">
            LUST WAS ZU STARTEN?<br/>
            SENDE UNS EINE ANFRAGE.
          </h2>

          <form class="contact-form" @submit.prevent="$emit('close')">
            <!-- Honeypot -->
            <input
              v-model="overlay.contactForm.honeypot"
              type="text"
              class="honeypot"
              name="hp"
              autocomplete="off"
            />

            <div class="row two-cols">
              <input
                v-model="overlay.contactForm.name"
                type="text"
                name="fullName"
                placeholder="Vollständiger Name*"
                required
              />
              <input
                v-model="overlay.contactForm.company"
                type="text"
                name="company"
                placeholder="Firma, Institution oder Verein*"
              />
            </div>

            <div class="row two-cols">
              <select
                v-model="overlay.contactForm.usage"
                name="usage"
                required
                class="usage-select"
              >
                <option value="" disabled>Art der Nutzung*</option>
                <option>Workshop</option>
                <option>Veranstaltung</option>
                <option>individuelle Anfrage</option>
              </select>

              <input
                type="text"
                :value="displayRange"
                name="dateRange"
                placeholder="Datum wählen*"
                readonly
                required
                class="date-input"
                @click="showCalendar = true"
              />
            </div>

            <div class="row">
              <textarea
                v-model="overlay.contactForm.message"
                name="message"
                placeholder="Gib uns bitte eine Beschreibung was du vor hast*"
                required
              />
            </div>
          </form>
        </div>
        
        <!-- Kalender-Overlay -->
        <div
          v-if="showCalendar"
          class="calendar-backdrop"
          @click.self="showCalendar = false"
        >
        <div class="calendar-overlay">
          <Calendar
            is-expanded
            :attributes="attributes"
            @dayclick="onDayClick"
          />
        </div>
        </div>
      </div>
    </div>
  </Modal>
</template>



<style scoped>
/* damit die absolute Positionierung in .form-section funktioniert */
.form-section {
  position: relative;
  flex: 1;
  padding: 4rem 0 4rem 7rem;
}

/* Kalender-Overlay-Hintergrund */
.calendar-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

/* Die Box mit Padding für den Kalender */
.calendar-overlay {
  background: #fff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  z-index: 2001;
}

/* Input-Feld und Select in einer Zeile */
.date-input {
  cursor: pointer;
}

.contact-overlay {
  background: #E7E8EC;
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
}

.absolute { margin: 2rem; }

.contact-content {
  display: flex;
  width: 100%;
  height: 100%;
}

/* Formular */
.form-section { flex: 1; padding: 4rem 0 4rem 7rem; }
.contact-title {
  color: #141414;
  font-family: 'TWK Everett', sans-serif;
  font-weight: 800;
  font-size: clamp(1.5rem, 3vw, 3rem);
  padding-bottom: 4rem;
  margin-top: 12rem;
  text-align: left;
}
.contact-form .row {
  display: flex; flex-wrap: wrap; gap: 1rem;
  width: 80%; margin-bottom: 1.5rem;
}
.contact-form .row.two-cols > * {
  flex: 1 1 calc(50% - 0.5rem);
}
.contact-form input,
.contact-form select,
.contact-form textarea {
  font-family: 'TWK Everett', sans-serif !important;
  padding: 0.9rem 1rem; border: none; border-radius: 8px;
  background: linear-gradient(to top left, rgb(237,238,245) 0.5%, #fff 100%);
  font-size: 1rem; color: #333; outline: none; width: 100%;
  box-sizing: border-box;
}
::placeholder {
  color: rgba(20,20,20,0.3);
  font-family: 'TWK Everett', sans-serif;
  font-size: 0.75rem; opacity: 1;
}
.honeypot { display: none; }

/* Kalender */
.calendar-section {
  flex: 0 0 40%;
  margin: 1.5rem 1.5rem 1.5rem 0;
}
.calendar-section .vc-pane {
  border: none;
  background: linear-gradient(to top left, rgb(237,238,245) 0.5%, #fff 100%);
  border-radius: 8px; padding: 1rem;
}
.calendar-section .vc-weekday,
.calendar-section .vc-day {
  font-family: 'TWK Everett', sans-serif;
  color: #333;
}
/* belegt = ausgegraut */
.vc-disabled-day .vc-day {
  color: rgba(0,0,0,0.2) !important;
  pointer-events: none;
}
/* ausgewählte Range */
.vc-selected-range .vc-day {
  background-color: #9687FF !important;
  color: #fff !important;
}
/* hover freier Tage */
.calendar-section .vc-day:not(.badge):hover {
  background-color: #eef1f6;
  cursor: pointer;
}

/* 1) Entfernt den blauen Hintergrund der „belegten“ Highlights */
::v-deep .vc-highlight.vc-disabled-bg {
  background:rgb(235, 235, 235) !important;
  background-image: none !important;
}

/* 2) Graut die Highlight-Layer (Anfang/Mitte/Ende) aus, damit wirklich kein Blau mehr zu sehen ist */
::v-deep .vc-highlight.vc-disabled-bg-base-start,
::v-deep .vc-highlight.vc-disabled-bg-base-middle,
::v-deep .vc-highlight.vc-disabled-bg-base-end {
  background: rgba(0, 0, 0, 0.05) !important;
}

/* 3) Graut die eigentliche Tageszahl aus und deaktiviert alle Pointer-Events */
::v-deep .vc-day-content.vc-disabled-day {
  color: rgba(20, 20, 20, 0.3) !important;
  pointer-events: none;
}

/* 4) Entfernt jeglichen Hover-Effekt auf bereits belegten Tagen */
::v-deep .vc-day-content.vc-disabled-day:hover {
  background: transparent !important;
  cursor: default !important;
}

/* markiere die Range-Highlights sauber in #FF3B42 */
::v-deep .vc-highlight.vc-selected-range-base-start,
::v-deep .vc-highlight.vc-selected-range-base-middle,
::v-deep .vc-highlight.vc-selected-range-base-end {
  background-color: #FF3B42 !important;
}

/* damit auch die Tageszahl im Range farbig wird */
::v-deep .vc-day-content.vc-selected-range {
  color: #fff !important;
}

.calendar-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

/* Bildbereich (wieder) */
.image-section {
  flex: 0 0 40%;
  margin: 1.5rem 1.5rem 1.5rem 0;
  position: relative;
  overflow: hidden;
}
.contact-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 1rem;
}

/* und die Calendar-Box selbst etwas prominenter */
.calendar-backdrop .vc-pane {
  z-index: 11; /* über dem Backdrop */
}

/* Responsive */
@media (max-width: 1024px) {
  .contact-content {
    flex-direction: column;
  }
  .form-section,
  .calendar-section {
    flex: none; width: 100%;
  }
  .form-section { padding: 2rem; }
}
@media (max-width: 640px) {
  .contact-title {
    font-size: clamp(2rem, 3vw, 3rem);
  }
}
</style>
