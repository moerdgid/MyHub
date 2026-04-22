<template>
  <main class="auth-page">
    <div class="auth-card">
      <p class="auth-eyebrow">Create your account</p>
      <h1>Register</h1>

      <form @submit.prevent="handleRegister" class="form">
        <label>
          <span>Display Name</span>
          <input v-model="displayName" type="text" placeholder="Your name" required />
        </label>

        <label>
          <span>Email</span>
          <input v-model="email" type="email" placeholder="you@example.com" required />
        </label>

        <label>
          <span>Password</span>
          <input v-model="password" type="password" placeholder="Create password" required />
        </label>

        <button class="primary-button" type="submit" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '../services/auth'

const router = useRouter()

const displayName = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

const handleRegister = async () => {
  errorMessage.value = ''
  loading.value = true

  try {
    await registerUser(email.value, password.value, displayName.value)
    router.push('/')
  } catch (error: any) {
    errorMessage.value = error.code || 'Registration failed'
  } finally {
    loading.value = false
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

.form {
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

.primary-button {
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
  background: var(--accent);
  color: white;
}

.primary-button:hover {
  background: var(--accent-hover);
}

.error {
  color: #ff8d8d;
  margin-top: 1rem;
}
</style>