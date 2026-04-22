<template>
  <main class="auth-page">
    <div class="auth-card">
      <p class="auth-eyebrow">Welcome back</p>
      <h1>Login</h1>

      <form @submit.prevent="handleLogin" class="form">
        <label>
          <span>Email</span>
          <input v-model="email" type="email" placeholder="you@example.com" required />
        </label>

        <label>
          <span>Password</span>
          <input v-model="password" type="password" placeholder="Enter password" required />
        </label>

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <button class="text-button" @click="showReset = !showReset">
        {{ showReset ? 'Hide reset' : 'Forgot password?' }}
      </button>

      <div v-if="showReset" class="reset-box">
        <label>
          <span>Reset Email</span>
          <input v-model="resetEmail" type="email" placeholder="you@example.com" />
        </label>

        <button class="secondary-button" @click="handleResetPassword" :disabled="resetLoading">
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
    router.push('/')
  } catch (error: any) {
    console.error(error)
    errorMessage.value = error.code || 'Login failed'
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
    errorMessage.value = error.code || 'Could not send reset email'
  } finally {
    resetLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-card {
  width: 100%;
  max-width: 430px;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 22px;
  padding: 2rem;
  box-shadow: var(--shadow);
}

.auth-eyebrow {
  margin: 0 0 0.5rem 0;
  color: var(--accent);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0 0 1.25rem 0;
}

.form,
.reset-box {
  display: grid;
  gap: 0.9rem;
}

label {
  display: grid;
  gap: 0.4rem;
}

span {
  color: var(--muted);
  font-size: 0.92rem;
  font-weight: 600;
}

input {
  width: 100%;
  padding: 0.85rem 0.95rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--panel-2);
  color: var(--text);
}

input:focus {
  outline: none;
  border-color: rgba(90, 162, 255, 0.5);
}

.primary-button,
.secondary-button {
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary-button {
  background: var(--accent);
  color: white;
}

.primary-button:hover {
  background: var(--accent-hover);
}

.secondary-button {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  border: 1px solid var(--border);
}

.text-button {
  margin-top: 1rem;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-weight: 700;
}

.reset-box {
  margin-top: 1rem;
}

.success {
  color: var(--success);
  margin-top: 1rem;
}

.error {
  color: #ff8d8d;
  margin-top: 1rem;
}
</style>