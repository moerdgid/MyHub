<template>
  <main class="dashboard-page">
    <div class="dashboard-header">
      <div>
        <h1>My Dashboards</h1>
        <p v-if="authStore.user">Logged in as {{ authStore.user.email }}</p>
      </div>

      <button class="logout-button" @click="handleLogout">Logout</button>
    </div>

    <!-- CREATE DASHBOARD -->
    <section class="card">
      <h2>Create Dashboard</h2>

      <form class="form-row" @submit.prevent="handleCreateDashboard">
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

    <!-- DASHBOARD LIST -->
    <section class="card">
      <h2>Your Dashboards</h2>

      <p v-if="loading">Loading dashboards...</p>
      <p v-else-if="dashboards.length === 0">You have no dashboards yet.</p>

      <div v-else class="dashboard-list">
        <div
          v-for="dashboard in dashboards"
          :key="dashboard.id"
          class="dashboard-card"
        >
          <div>
            <h3>{{ dashboard.name }}</h3>
          </div>

          <div class="actions">
            <router-link :to="`/dashboard/${dashboard.id}`">
              <button>Open</button>
            </router-link>

            <button @click="startRename(dashboard.id, dashboard.name)">
              Rename
            </button>

            <button class="danger" @click="handleDeleteDashboard(dashboard.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- RENAME -->
    <section v-if="renamingDashboardId" class="card">
      <h2>Rename Dashboard</h2>

      <form class="form-row" @submit.prevent="handleRenameDashboard">
        <input v-model="renameValue" required />
        <button type="submit">Save</button>
        <button type="button" class="secondary" @click="cancelRename">
          Cancel
        </button>
      </form>
    </section>

    <!-- CHANGE PASSWORD -->
    <section class="card">
      <h2>Change Password</h2>

      <div class="form-row">
        <input
          v-model="newPassword"
          type="password"
          placeholder="New password"
        />

        <button @click="handleChangePassword">
          Update Password
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import {
  createDashboard,
  getUserDashboards,
  renameDashboard,
  removeDashboard,
} from '../services/dashboards'
import { logoutUser, changePassword } from '../services/auth'

type Dashboard = {
  id: string
  name: string
}

const router = useRouter()
const authStore = useAuthStore()

const dashboards = ref<Dashboard[]>([])
const newDashboardName = ref('')
const renameValue = ref('')
const renamingDashboardId = ref('')
const loading = ref(true)
const creating = ref(false)

const newPassword = ref('')

const loadDashboards = async () => {
  if (!authStore.user) return

  loading.value = true

  try {
    dashboards.value = await getUserDashboards(authStore.user.uid)
  } catch (error) {
    console.error(error)
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
  } finally {
    creating.value = false
  }
}

const startRename = (id: string, name: string) => {
  renamingDashboardId.value = id
  renameValue.value = name
}

const cancelRename = () => {
  renamingDashboardId.value = ''
  renameValue.value = ''
}

const handleRenameDashboard = async () => {
  await renameDashboard(renamingDashboardId.value, renameValue.value)
  cancelRename()
  await loadDashboards()
}

const handleDeleteDashboard = async (id: string) => {
  await removeDashboard(id)
  await loadDashboards()
}

const handleLogout = async () => {
  await logoutUser()
  router.push('/login')
}

const handleChangePassword = async () => {
  try {
    await changePassword(newPassword.value)
    alert('Password updated successfully')
    newPassword.value = ''
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      alert('Log out and log back in before changing password.')
    } else {
      alert('Failed to update password')
    }
  }
}

onMounted(loadDashboards)
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
  margin-bottom: 2rem;
}

.card {
  background: #1b1b1b;
  border: 1px solid #333;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.form-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 200px;
  padding: 0.7rem;
  background: #111;
  border: 1px solid #444;
  color: white;
  border-radius: 6px;
}

button {
  padding: 0.7rem 1rem;
  background: #4ea1ff;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
}

.secondary {
  background: #666;
}

.danger {
  background: #d9534f;
}

.dashboard-list {
  display: grid;
  gap: 1rem;
}

.dashboard-card {
  display: flex;
  justify-content: space-between;
  background: #111;
  padding: 1rem;
  border-radius: 8px;
}

.actions {
  display: flex;
  gap: 0.5rem;
}
</style>