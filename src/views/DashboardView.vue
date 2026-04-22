<template>
  <main class="dashboard-page">
    <div class="dashboard-card">
      <h1>Dashboard</h1>

      <p v-if="authStore.user">
        Logged in as: <strong>{{ authStore.user.email }}</strong>
      </p>

      <button @click="handleLogout">Logout</button>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { logoutUser } from '../services/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await logoutUser()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-page {
  padding: 2rem;
}

.dashboard-card {
  max-width: 600px;
  background: #1b1b1b;
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid #333;
}

button {
  margin-top: 1rem;
  padding: 0.85rem 1.2rem;
  border: none;
  border-radius: 8px;
  background: #4ea1ff;
  color: white;
  font-weight: bold;
  cursor: pointer;
}
</style>