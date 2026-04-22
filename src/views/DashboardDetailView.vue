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
          <p>Customize your dashboard and widgets.</p>
        </div>

        <router-link class="back-link" to="/dashboard">
          Back
        </router-link>
      </div>

      <!-- WIDGET SETTINGS -->
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
            Minecraft
          </label>
        </div>

        <button @click="handleSaveWidgets" :disabled="saving">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </section>

      <!-- WEATHER SETTINGS -->
      <section v-if="widgets.weather" class="settings-card">
        <h2>Weather Settings</h2>

        <div class="location-input">
          <label>Location (lat, lng)</label>

          <input
            v-model="locationInput"
            placeholder="Example: 42.9634, -85.6681"
          />

          <button @click="updateLocation">
            Update Location
          </button>
        </div>
      </section>

      <!-- DASHBOARD PREVIEW -->
      <section class="preview-card">
        <h2>Dashboard Preview</h2>

        <div class="widget-grid">

          <!-- WEATHER -->
          <div v-if="widgets.weather" class="widget-card">
            <h3>Weather</h3>

            <p v-if="weatherLoading">Loading weather...</p>

            <div v-else-if="weather">
              <p><strong>Temperature:</strong> {{ weather.temperature }}°F</p>
              <p><strong>Wind Speed:</strong> {{ weather.windspeed }} mph</p>
            </div>

            <p v-else>Unable to load weather.</p>
          </div>

          <!-- PLACEHOLDERS -->
          <div v-if="widgets.calendar" class="widget-card">
            <h3>Calendar</h3>
            <p>Coming soon</p>
          </div>

          <div v-if="widgets.announcements" class="widget-card">
            <h3>Announcements</h3>
            <p>Coming soon</p>
          </div>

          <div v-if="widgets.minecraft" class="widget-card">
            <h3>Minecraft</h3>
            <p>Coming soon</p>
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
import { getWeather } from '../services/weather'

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

type WeatherData = {
  temperature: number
  windspeed: number
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

const weather = ref<WeatherData | null>(null)
const weatherLoading = ref(true)

const locationInput = ref('42.9634, -85.6681')

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

const loadWeather = async (lat: number, lng: number) => {
  weatherLoading.value = true

  try {
    const result = await getWeather(lat, lng)
    weather.value = result
  } catch (error) {
    console.error('Weather error:', error)
    weather.value = null
  } finally {
    weatherLoading.value = false
  }
}

const updateLocation = async () => {
  try {
    const [lat, lng] = locationInput.value.split(',').map(Number)

    if (!isNaN(lat) && !isNaN(lng)) {
      await loadWeather(lat, lng)
    } else {
      console.error('Invalid location format')
    }
  } catch (error) {
    console.error('Location parse error:', error)
  }
}

const handleSaveWidgets = async () => {
  if (!dashboard.value) return

  saving.value = true

  try {
    await updateDashboardWidgets(dashboard.value.id, widgets.value)
    await loadDashboard()
  } catch (error) {
    console.error('Failed to save widgets:', error)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadDashboard()

  const [lat, lng] = locationInput.value.split(',').map(Number)
  if (!isNaN(lat) && !isNaN(lng)) {
    await loadWeather(lat, lng)
  }
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
  margin-bottom: 1.5rem;
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
  margin: 1rem 0;
}

.location-input {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 200px;
  padding: 0.7rem;
  border-radius: 6px;
  border: 1px solid #444;
  background: #111;
  color: white;
}

button {
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 6px;
  background: #4ea1ff;
  color: white;
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
  border-radius: 8px;
  padding: 1rem;
}
</style>