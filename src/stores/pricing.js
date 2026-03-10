// src/stores/pricing.js
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const usePricingStore = defineStore('pricing', () => {
  const plans = reactive([
    {
      key:        'business',
      title:      'Business',
      audience:   '',
      context:    'Für Team- oder Business-Meetings, Workshops, Präsentationen, Weiterbildungen bis',
      maxPersons: 'max. 40 Personen',

      // Preisinfos
      price:      50, 
      unit:       'Euro / Stunde',
      priceAlt:   '350 Euro für 8 Stunden',
      priceNote:  'Preis zzgl. MwSt.',

      buttonText: 'Business-Paket anfragen',

      // Leistungen
      features: [
        'Ganzer Raum 100 qm',
        'Saalbestuhlung',
        '7 Tische',
        'Teeküche / Tresen',
        'Fernseher 50 Zoll',
        'Beamer',
        'Pinnwand',
        'Whiteboard'
      ],
      onRequest: [
        'Catering / Getränke',
        'Mikrofonierung'
      ],

      // Beschreibungstext
      description:
        ''
    },

    {
      key:        'gruppen',
      title:      'Gruppen',
      audience:   '',
      context:    'Für Netzwerktreffen, Workshops, Sprints, Team-Meetings, Seminare und Vorträge bis',
      maxPersons: 'max. 25 Personen',

      price:      25,
      unit:       'Euro / Stunde',
      priceAlt:   'Ab 5 Personen: + 5 Euro pro Person und Stunde',
      priceNote:  'Preis zzgl. MwSt.',

      buttonText: 'Gruppen-Paket anfragen',

      features: [
        'Workshop-Bereich',
        '7 Tische',
        '4 Werkbänke',
        'Teeküche / Tresen',
        'Fernseher 50 Zoll',
        'Pinnwand',
        'Whiteboard'
      ],
      onRequest: [
        'Catering / Getränke',
        'Mikrofonierung',
        'Beamer'
      ],

      description:
        ''
    },

    {
      key:        'individuell',
      title:      'Individuell',
      audience:   ' ',
      context:    'Kein Paket gefunden? Dann fragt uns bitte direkt an. Gemeinsam finden wir ein maßgeschneidertes Angebot, das sowohl deinem Vorhaben als auch unseren Möglichkeiten entspricht.',
      maxPersons: '',

      // Kein fixer Preis
      price:      null,
      unit:       '',
      priceLabel: '',

      buttonText: 'Individuelle Anfrage schicken',

      features: [
        'Kleine Gruppen',
        'Vereinsversammlungen',
        'Veranstaltungsreihen',
        'Ausstellungen',
        'Kurse',
        'Lesungen',
        'Apéro'
      ],

      onRequest: [],

      description:
        ''
    }
  ])

  return { plans }
})
