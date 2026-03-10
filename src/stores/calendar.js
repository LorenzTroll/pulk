import { defineStore } from 'pinia'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    // jedes Event muss mindestens ein `key` und ein `dates`-Feld haben
    events: [
      // Beispiel-Daten
      { id: 1, title: 'Reserviert',     dates: { start: '2026-02-07', end: '2026-02-07' } },
      // ... weitere Einträge
    ]
  }),
  actions: {
    async fetchEvents() {
      // hier könntest du via fetch() eine JSON laden
      // und dann this.events = geladenesArray
    },
    addEvent(evt) {
      this.events.push(evt)
    }
  }
})