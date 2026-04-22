<template>
  <main class="auth-page">
    <div class="auth-card">
      <h1>Create Account</h1>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="displayName">Display Name</label>
          <input id="displayName" v-model="displayName" type="text" required />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" required />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" required />
        </div>

        <button type="submit" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Register' }}
        </button>

        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      </form>
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
    router.push('/dashboard')
  } catch (error: any) {
    errorMessage.value = error.message || 'Registration failed.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: #1b1b1b;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #333;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

label {
  margin-bottom: 0.4rem;
  font-weight: bold;
}

input {
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid #444;
  background: #111;
  color: white;
}

button {
  width: 100%;
  padding: 0.85rem;
  border: none;
  border-radius: 8px;
  background: #4ea1ff;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error {
  color: #ff8080;
  margin-top: 1rem;
}
</style>