<template>
  <main class="dashboard-page">
    <div class="dashboard-header">
      <div>
        <h1>My Dashboards</h1>
        <p v-if="authStore.user">Logged in as {{ authStore.user.email }}</p>
      </div>

      <button class="logout-button" @click="handleLogout">Logout</button>
    </div>

    <section class="create-section">
      <h2>Create Dashboard</h2>

      <form class="create-form" @submit.prevent="handleCreateDashboard">
        <input
          v-model="newDashboardName"
          type="text"
          placeholder="Enter dashboard name"
          required
        />
        <button type="submit" :disabled="creating">
          {{ creating ? 'Creating...' : 'Create' }}
        </button>
      </form>
    </section>

    <section class="list-section">
      <h2>Your Dashboards</h2>

      <p v-if="loading">Loading dashboards...</p>
      <p v-else-if="dashboards.length === 0">You have no dashboards yet.</p>

      <div v-else class="dashboard-list">
        <div
          v-for="dashboard in dashboards"
          :key="dashboard.id"
          class="dashboard-card"
        >
          <div class="dashboard-info">
            <h3>{{ dashboard.name }}</h3>
            <p>ID: {{ dashboard.id }}</p>
          </div>

          <div class="dashboard-actions">
            <router-link :to="`/dashboard/${dashboard.id}`">
              <button>Open</button>
            </router-link>

            <button @click="startRename(dashboard.id, dashboard.name)">
              Rename
            </button>

            <button
              class="delete-button"
              @click="handleDeleteDashboard(dashboard.id)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="renamingDashboardId" class="rename-section">
      <h2>Rename Dashboard</h2>

      <form class="rename-form" @submit.prevent="handleRenameDashboard">
        <input
          v-model="renameValue"
          type="text"
          placeholder="New dashboard name"
          required
        />
        <button type="submit">Save Name</button>
        <button type="button" class="cancel-button" @click="cancelRename">
          Cancel
        </button>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { logoutUser } from '../services/auth'
import {
  createDashboard,
  getUserDashboards,
  renameDashboard,
  removeDashboard,
} from '../services/dashboards'

type Dashboard = {
  id: string
  name: string
  userId: string
  widgets: {
    weather: boolean
    calendar: boolean
    announcements: boolean
    minecraft: boolean
  }
  layout: unknown[]
}

const router = useRouter()
const authStore = useAuthStore()

const dashboards = ref<Dashboard[]>([])
const newDashboardName = ref('')
const renameValue = ref('')
const renamingDashboardId = ref('')
const loading = ref(true)
const creating = ref(false)

const loadDashboards = async () => {
  if (!authStore.user) return

  loading.value = true

  try {
    const results = await getUserDashboards(authStore.user.uid)
    dashboards.value = results as Dashboard[]
  } catch (error) {
    console.error('Failed to load dashboards:', error)
  } finally {
    loading.value = false
  }
}

const handleCreateDashboard = async () => {
  if (!authStore.user) return

  creating.value = true

  try {
    await createDashboard(authStore.user.uid, newDashboardName.value)
    newDashboardName.value = ''
    await loadDashboards()
  } catch (error) {
    console.error('Failed to create dashboard:', error)
  } finally {
    creating.value = false
  }
}

const startRename = (dashboardId: string, currentName: string) => {
  renamingDashboardId.value = dashboardId
  renameValue.value = currentName
}

const cancelRename = () => {
  renamingDashboardId.value = ''
  renameValue.value = ''
}

const handleRenameDashboard = async () => {
  if (!renamingDashboardId.value) return

  try {
    await renameDashboard(renamingDashboardId.value, renameValue.value)
    cancelRename()
    await loadDashboards()
  } catch (error) {
    console.error('Failed to rename dashboard:', error)
  }
}

const handleDeleteDashboard = async (dashboardId: string) => {
  try {
    await removeDashboard(dashboardId)
    await loadDashboards()
  } catch (error) {
    console.error('Failed to delete dashboard:', error)
  }
}

const handleLogout = async () => {
  await logoutUser()
  router.push('/login')
}

onMounted(() => {
  loadDashboards()
})
</script>

<style scoped>
.dashboard-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.create-section,
.list-section,
.rename-section {
  background: #1b1b1b;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.create-form,
.rename-form {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 220px;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #444;
  background: #111;
  color: white;
}

button {
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 8px;
  background: #4ea1ff;
  color: white;
  font-weight: bold;
  cursor: pointer;
}

.dashboard-list {
  display: grid;
  gap: 1rem;
}

.dashboard-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: #111;
  border: 1px solid #333;
  border-radius: 10px;
  padding: 1rem;
}

.dashboard-info h3 {
  margin: 0 0 0.4rem 0;
}

.dashboard-info p {
  margin: 0;
  color: #bbb;
  font-size: 0.9rem;
}

.dashboard-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.dashboard-actions a {
  text-decoration: none;
}

.delete-button {
  background: #d9534f;
}

.cancel-button,
.logout-button {
  background: #666;
}
</style>