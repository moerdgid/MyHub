<template>
  <main class="dashboard-page">
    <div class="dashboard-header">
      <div>
        <p class="eyebrow">Your workspace</p>
        <h1>My Dashboards</h1>
        <p v-if="authStore.user" class="subtext">
          Logged in as {{ authStore.user.email }}
        </p>
      </div>

      <button class="secondary-button" @click="handleLogout">Logout</button>
    </div>

    <section class="page-card">
      <div class="section-header">
        <div>
          <h2>Create Dashboard</h2>
          <p class="subtext">Make a new saved layout for your widgets.</p>
        </div>
      </div>

      <form class="form-row" @submit.prevent="handleCreateDashboard">
        <input
          v-model="newDashboardName"
          type="text"
          placeholder="Enter dashboard name"
          required
        />
        <button class="primary-button" type="submit" :disabled="creating">
          {{ creating ? 'Creating...' : 'Create' }}
        </button>
      </form>
    </section>

    <section class="page-card">
      <div class="section-header">
        <div>
          <h2>Your Dashboards</h2>
          <p class="subtext">Open, rename, or remove saved dashboards.</p>
        </div>
      </div>

      <p v-if="loading" class="subtext">Loading dashboards...</p>
      <p v-else-if="dashboards.length === 0" class="subtext">You have no dashboards yet.</p>

      <div v-else class="dashboard-list">
        <div
          v-for="dashboard in dashboards"
          :key="dashboard.id"
          class="dashboard-card"
        >
          <div class="dashboard-info">
            <h3>{{ dashboard.name }}</h3>
            <p class="subtext">Saved dashboard</p>
          </div>

          <div class="actions">
            <router-link :to="`/dashboard/${dashboard.id}`" class="link-reset">
              <button class="primary-button" type="button">Open</button>
            </router-link>

            <button class="secondary-button" @click="startRename(dashboard.id, dashboard.name)">
              Rename
            </button>

            <button class="danger-button" @click="handleDeleteDashboard(dashboard.id)">
              Delete
            </button>
          </div>
        </div>
      </div>
    </section>

    <section v-if="renamingDashboardId" class="page-card">
      <div class="section-header">
        <div>
          <h2>Rename Dashboard</h2>
          <p class="subtext">Update the label for this dashboard.</p>
        </div>
      </div>

      <form class="form-row" @submit.prevent="handleRenameDashboard">
        <input
          v-model="renameValue"
          type="text"
          placeholder="New dashboard name"
          required
        />
        <button class="primary-button" type="submit">Save</button>
        <button class="secondary-button" type="button" @click="cancelRename">
          Cancel
        </button>
      </form>
    </section>

    <section class="page-card">
      <div class="section-header">
        <div>
          <h2>Account Security</h2>
          <p class="subtext">Change your password while logged in.</p>
        </div>
      </div>

      <div class="form-row">
        <input
          v-model="newPassword"
          type="password"
          placeholder="New password"
        />
        <button class="primary-button" @click="handleChangePassword">
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
  max-width: 1100px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.45rem 0;
  color: var(--accent);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
}

h1 {
  margin: 0;
  font-size: 2.2rem;
}

h2 {
  margin: 0;
}

h3 {
  margin: 0;
}

.subtext {
  color: var(--muted);
  margin-top: 0.45rem;
}

.page-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.4rem;
  margin-bottom: 1.25rem;
  box-shadow: var(--shadow);
}

.section-header {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 220px;
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

.dashboard-list {
  display: grid;
  gap: 0.9rem;
}

.dashboard-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
}

.actions {
  display: flex;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.link-reset {
  text-decoration: none;
}

.primary-button,
.secondary-button,
.danger-button {
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: none;
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

.secondary-button:hover {
  border-color: rgba(90, 162, 255, 0.35);
}

.danger-button {
  background: rgba(217, 83, 79, 0.15);
  color: #ff9894;
  border: 1px solid rgba(217, 83, 79, 0.25);
}

.danger-button:hover {
  background: rgba(217, 83, 79, 0.24);
}
</style>