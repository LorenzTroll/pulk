// src/stores/overlay.js
import { defineStore } from 'pinia'

export const useOverlayStore = defineStore('overlay', {
  state: () => ({
    current: null,
    feedback: null,
    contactForm: {
      honeypot: '',
      name: '',          // Vollständiger Name
      company: '',       // Firma, Institution oder Verein
      usage: '',         // ausgewählte Nutzungsart
      message: '',       // Freitext-Beschreibung
      dateStart: null,   // gewähltes Start‑Datum
      dateEnd: null      // gewähltes End‑Datum
    }
  }),

  getters: {
    // true, wenn alle Pflicht‑Felder befüllt sind
    isContactValid: (state) => {
      const f = state.contactForm
      return Boolean(
        f.name.trim() &&
        f.usage &&
        f.dateStart &&
        f.dateEnd &&
        f.message.trim().length >= 30
      )
    }
  },

  actions: {
    open(type) {
      this.current = type
    },
    close() {
      this.current = null
    },
    resetForm() {
      this.contactForm = {
        honeypot: '',
        name: '',
        company: '',
        usage: '',
        message: '',
        dateStart: null,
        dateEnd: null
      }
    },
    markSubmitted() {
      this.feedback = 'submitted'
      setTimeout(() => { this.feedback = null }, 5000)
    }
  }
})
