// src/stores/pricing.js
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const usePricingStore = defineStore('pricing', () => {
  const plans = reactive([
    {
      key:        'workshop',
      title:      'Workshop',
      subtitle:   'Max. 20 Personen. Ideal für kleine und mittlere Gruppen und unsere flexible Empfehlung. Preis exkl. MwSt.',
      price:      50,
      unit:       '/ pro Stunde + Mwst.',
      buttonText: 'Workshop anfragen',
      features: [
        '7 Tische + 4 "Werkbänke"',
        'Teeküche',
        'Fernseher 50 Zoll',
        'Pinnwand',
        'Whiteboard', 
        'Reinigungspauschale 20 €'
      ],
      onRequest: [
        'Catering / Getränke',
        'Mikrofon',
        'Beamer'
      ]
    },
    {
      key:        'versammlung',
      title:      'Veranstaltung',
      subtitle:   'Max. 40 Personen. Präsentation, Vernetzungstreffen, Versammlungen, kleine Events o. Apéro. Preis exkl. MwSt.',
      price:      300,
      unit:       '/ pro Anlass + Mwst.',
      buttonText: 'Versammlung anfragen',
      features: [
        'Bestuhlung',
        'Teeküche',
        'Fernseher 50 Zoll',
        'Pinnwand',
        'Whiteboard',
        'Reinigungspauschale 40 €'
      ],
      onRequest: [
        'Catering / Getränke',
        'Mikrofon',
        'Beamer'
      ]
    },
    {
      key:        'individuell',
      title:      'Individuelle Anfrage',
      subtitle:   'Für alles, was die anderen Pakete nicht abdecken. Bei Vorlage der Gemeinnützigkeit gewähren wir Rabatt.',
      price:      '–',
      unit:       '',
      buttonText: 'Anfrage schicken',
      features: [
        'Vereinssitzungen',
        'Ausstellungen',
        'Vorträge',
        'Screenings',
        'Lesungen',
        'Kursreihen'
      ]
    }
  ])

  return { plans }
})
