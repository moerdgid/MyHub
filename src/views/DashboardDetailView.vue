<template>
  <main class="dashboard-detail-page">
    <div v-if="loading">
      <p>Loading dashboard...</p>
    </div>

    <div v-else-if="!dashboard">
      <p>Dashboard not found.</p>
    </div>

    <div v-else>
      <div class="page-header">
        <div>
          <h1>{{ dashboard.name }}</h1>
          <p>Customize which widgets appear on this dashboard.</p>
        </div>

        <router-link class="back-link" to="/dashboard">Back to Dashboards</router-link>
      </div>

      <section class="settings-card">
        <h2>Widget Settings</h2>

        <div class="toggle-list">
          <label>
            <input type="checkbox" v-model="widgets.weather" />
            Weather
          </label>

          <label>
            <input type="checkbox" v-model="widgets.calendar" />
            Calendar
          </label>

          <label>
            <input type="checkbox" v-model="widgets.announcements" />
            Announcements
          </label>

          <label>
            <input type="checkbox" v-model="widgets.minecraft" />
            Minecraft Server
          </label>
        </div>

        <button @click="handleSaveWidgets" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Widget Settings' }}
        </button>
      </section>

      <section class="preview-card">
        <h2>Dashboard Preview</h2>

        <div class="widget-grid">
          <div v-if="widgets.weather" class="widget-card">
            <h3>Weather Widget</h3>
            <p>Weather content will go here.</p>
          </div>

          <div v-if="widgets.calendar" class="widget-card">
            <h3>Calendar Widget</h3>
            <p>Calendar content will go here.</p>
          </div>

          <div v-if="widgets.announcements" class="widget-card">
            <h3>Announcements Widget</h3>
            <p>Announcements content will go here.</p>
          </div>

          <div v-if="widgets.minecraft" class="widget-card">
            <h3>Minecraft Widget</h3>
            <p>Minecraft server content will go here.</p>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getDashboardById, updateDashboardWidgets } from '../services/dashboards'

type WidgetSettings = {
  weather: boolean
  calendar: boolean
  announcements: boolean
  minecraft: boolean
}

type Dashboard = {
  id: string
  userId: string
  name: string
  widgets: WidgetSettings
  layout: unknown[]
}

const route = useRoute()

const dashboard = ref<Dashboard | null>(null)
const loading = ref(true)
const saving = ref(false)

const widgets = ref<WidgetSettings>({
  weather: false,
  calendar: false,
  announcements: false,
  minecraft: false,
})

const loadDashboard = async () => {
  loading.value = true

  try {
    const result = await getDashboardById(route.params.id as string)

    if (result) {
      dashboard.value = result as Dashboard
      widgets.value = { ...dashboard.value.widgets }
    } else {
      dashboard.value = null
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error)
  } finally {
    loading.value = false
  }
}

const handleSaveWidgets = async () => {
  if (!dashboard.value) return

  saving.value = true

  try {
    await updateDashboardWidgets(dashboard.value.id, widgets.value)
    await loadDashboard()
  } catch (error) {
    console.error('Failed to save widget settings:', error)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadDashboard()
})
</script>

<style scoped>
.dashboard-detail-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.back-link {
  color: #4ea1ff;
  text-decoration: none;
  font-weight: bold;
}

.settings-card,
.preview-card {
  background: #1b1b1b;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.toggle-list {
  display: grid;
  gap: 0.75rem;
  margin: 1rem 0 1.25rem 0;
}

label {
  display: flex;
  align-items: center;
  gap: 0.6rem;
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

.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.widget-card {
  background: #111;
  border: 1px solid #333;
  border-radius: 10px;
  padding: 1rem;
}
</style>