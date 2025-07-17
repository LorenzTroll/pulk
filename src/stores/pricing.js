// src/stores/pricing.js
import { defineStore } from 'pinia'
import { reactive }    from 'vue'

export const usePricingStore = defineStore('pricing', () => {
  const plans = reactive([
    {
      key:        'workshop',
      title:      'Workshop',
      subtitle:   'Ideal für Lernveranstaltungen kleiner und mittlerer Gruppen. Bei Gemeinnützigkeit gewähren wir Rabatt.',
      price:      100,
      unit:       '/halbtägig',
      buttonText: 'Workshop anfragen',
      features: [
        'max. 20 Personen',
        '7 Tische + 4 "Werkbänke"',
        'Teeküche',
        'Energiepauschale inbegriffen',
        'Catering/Getränke auf Anfrage',
        'Fernseher 50 Zoll & Pinnwände',
        'Beamer mieten möglich',
        'Reinigungspauschale 30 €'
      ]
    },
    {
      key:        'versammlung',
      title:      'Veranstaltung',
      subtitle:   'Firmenpräsentation, Firmenfeiern, Versammlungen, kleine Events oder Feierlichkeiten im Familiären Rahmen.',
      price:      300,
      unit:       '/pro Anlass',
      buttonText: 'Versammlung anfragen',
      features: [
        'max. 40 Personen',
        'Bestuhlung',
        'Teeküche',
        'Energiepauschale inbegriffen',
        'Catering/Getränke auf Anfrage',
        'Fernseher 50 Zoll & Pinnwände',
        'Beamer mieten möglich',
        'Reinigungspauschale 50 €'
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
        'Kurse'
      ]
    }
  ])

  return { plans }
})
