<template>
  <main class="auth-page">
    <div class="auth-card">
      <h1>Login</h1>

      <form @submit.prevent="handleLogin" class="form">
        <input v-model="email" type="email" placeholder="Email" required />
        <input v-model="password" type="password" placeholder="Password" required />

        <button type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="link-text" @click="showReset = !showReset">
        Forgot Password?
      </p>

      <div v-if="showReset" class="reset-box">
        <input v-model="resetEmail" type="email" placeholder="Enter your email" />

        <button @click="handleResetPassword" :disabled="resetLoading">
          {{ resetLoading ? 'Sending...' : 'Send Reset Email' }}
        </button>
      </div>

      <p v-if="message" class="success">{{ message }}</p>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser, resetPassword } from '../services/auth'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)

const showReset = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)

const message = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  message.value = ''

  try {
    const user = await loginUser(email.value, password.value)
    authStore.setUser(user)
    router.push('/dashboard')
  } catch (error: any) {
    console.error(error)
    errorMessage.value = error.code
  } finally {
    loading.value = false
  }
}

const handleResetPassword = async () => {
  resetLoading.value = true
  errorMessage.value = ''
  message.value = ''

  try {
    await resetPassword(resetEmail.value)
    message.value = 'Password reset email sent.'
    resetEmail.value = ''
  } catch (error: any) {
    console.error(error)
    errorMessage.value = error.code
  } finally {
    resetLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.auth-card {
  width: 320px;
  background: #1b1b1b;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #333;
}

.form {
  display: grid;
  gap: 0.75rem;
}

input {
  padding: 0.7rem;
  border-radius: 6px;
  border: 1px solid #444;
  background: #111;
  color: white;
}

button {
  padding: 0.7rem;
  border: none;
  border-radius: 6px;
  background: #4ea1ff;
  color: white;
  cursor: pointer;
}

.link-text {
  margin-top: 1rem;
  color: #4ea1ff;
  cursor: pointer;
}

.reset-box {
  margin-top: 1rem;
  display: grid;
  gap: 0.5rem;
}

.success {
  color: #69d07d;
  margin-top: 1rem;
}

.error {
  color: #ff8080;
  margin-top: 1rem;
}
</style>