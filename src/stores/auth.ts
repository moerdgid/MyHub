import { defineStore } from 'pinia'
import { ref } from 'vue'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../firebase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const authReady = ref(false)

  const initAuth = () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser
      authReady.value = true
    })
  }

  return {
    user,
    authReady,
    initAuth,
  }
})