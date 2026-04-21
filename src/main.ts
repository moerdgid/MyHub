import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { auth, db } from './firebase'

console.log('Firebase auth ready:', auth)
console.log('Firestore ready:', db)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')