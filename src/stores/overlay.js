import { defineStore } from 'pinia'
import { ref, reactive, computed } from 'vue'

export const useOverlayStore = defineStore('overlay', () => {
  // aktuelles Overlay: 'contact' | 'about' | 'pricing' | null
  const current = ref(null)

  function open(type) {
    current.value = type
  }
  function close() {
    current.value = null
  }

  // Kontakt-Formular im Store
  const contactForm = reactive({
    name:     '',
    company:  '',
    usage:    '',
    message:  '',
    honeypot: ''
  })

  // Computed: Pflichtfelder + Honeypot prüfen
  const isContactValid = computed(() =>
    contactForm.name.trim()    !== '' &&
    contactForm.usage.trim()   !== '' &&
    contactForm.message.trim() !== '' &&
    contactForm.honeypot.trim() === ''
  )

  return {
    current,
    open,
    close,
    contactForm,
    isContactValid
  }
})
