import { defineStore } from 'pinia'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    // jedes Event muss mindestens ein `key` und ein `dates`-Feld haben
    events: [
      // Beispiel-Daten
      { id: 1, title: 'Workshop',     dates: { start: '2025-07-15', end: '2025-07-16' } },
      { id: 2, title: 'Vereinstreffen', dates: { start: '2025-07-20', end: '2025-07-20' } },
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