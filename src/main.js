import '@/assets/styles/main.css'
import '@/assets/css/modal.css'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
library.add(faCheck)

import hkanevCalendar from 'hkanev-vue-calendar'
import 'hkanev-vue-calendar/dist/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.component('font-awesome-icon', FontAwesomeIcon)
app.use(createPinia())
app.use(hkanevCalendar)
app.mount('#app')
