<template>
  <main class="dashboard-detail-page">
    <div v-if="loading" class="page-card">
      <p class="subtext">Loading dashboard...</p>
    </div>

    <div v-else-if="!dashboard" class="page-card">
      <p class="subtext">Dashboard not found.</p>
    </div>

    <div v-else>
      <div class="page-header">
        <div>
          <p class="eyebrow">Dashboard</p>
          <h1>{{ dashboard.name }}</h1>
          <p class="subtext">Customize your dashboard.</p>
        </div>

        <router-link class="back-link" to="/dashboard">
          Back
        </router-link>
      </div>

      <section class="page-card">
        <h2>Widgets</h2>

        <div class="toggle-list">
          <label><input type="checkbox" v-model="widgets.weather" /> Weather</label>
          <label><input type="checkbox" v-model="widgets.announcements" /> Announcements</label>
          <label><input type="checkbox" v-model="widgets.minecraft" /> Minecraft</label>
        </div>

        <button class="primary-button" @click="handleSaveWidgets">
          Save Settings
        </button>
      </section>

      <section v-if="widgets.weather" class="page-card">
        <h2>Weather Location</h2>

        <div class="location-input">
          <input
            v-model="locationInput"
            placeholder="Enter city (e.g. Grand Rapids, MI)"
          />

          <button class="primary-button" @click="updateLocation">
            Save Location
          </button>
        </div>

        <p v-if="weatherError" class="error-text">{{ weatherError }}</p>
      </section>

      <section class="page-card">
        <h2>Dashboard</h2>

        <div class="widget-grid">
          <div v-if="widgets.weather" class="widget-card">
            <h3>Weather</h3>

            <p v-if="weatherLoading" class="subtext">Loading...</p>

            <div v-else-if="weather">
              <p><strong>Temp:</strong> {{ weather.temperature }}°F</p>
              <p><strong>Wind:</strong> {{ weather.windspeed }} mph</p>
            </div>

            <p v-else class="subtext">No data</p>
          </div>

          <AnnouncementsWidget v-if="widgets.announcements" />
          <MinecraftWidget v-if="widgets.minecraft" />
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { getDashboardById, updateDashboardWidgets } from '../services/dashboards'
import { getWeather, getCoordinatesFromCity } from '../services/weather'
import { getUserProfile, updateUserLocation } from '../services/auth'
import AnnouncementsWidget from '../components/AnnouncementsWidget.vue'
import MinecraftWidget from '../components/MinecraftWidget.vue'

const route = useRoute()
const authStore = useAuthStore()

const dashboard = ref<any>(null)
const loading = ref(true)

const widgets = ref({
  weather: false,
  announcements: false,
  minecraft: false,
})

const weather = ref<any>(null)
const weatherLoading = ref(false)
const weatherError = ref('')

const locationInput = ref('')

const loadDashboard = async () => {
  try {
    const result = await getDashboardById(route.params.id as string)
    dashboard.value = result
    widgets.value = { ...result.widgets }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSaveWidgets = async () => {
  if (!dashboard.value) return
  await updateDashboardWidgets(dashboard.value.id, widgets.value)
}

const loadWeather = async (lat: number, lng: number) => {
  try {
    weather.value = await getWeather(lat, lng)
  } catch (err) {
    console.error(err)
    weather.value = null
  }
}

const loadSavedLocation = async () => {
  if (!authStore.user) return

  weatherLoading.value = true
  weatherError.value = ''

  try {
    const profile = await getUserProfile(authStore.user.uid)

    if (profile?.defaultLocation) {
      locationInput.value = profile.defaultLocation
      const coords = await getCoordinatesFromCity(locationInput.value)
      await loadWeather(coords.latitude, coords.longitude)
    }
  } catch (err) {
    console.error(err)
    weather.value = null
    weatherError.value = 'Could not load saved location.'
  } finally {
    weatherLoading.value = false
  }
}

const updateLocation = async () => {
  if (!authStore.user) return

  weatherLoading.value = true
  weatherError.value = ''

  try {
    const coords = await getCoordinatesFromCity(locationInput.value)
    await loadWeather(coords.latitude, coords.longitude)
    await updateUserLocation(authStore.user.uid, locationInput.value)
  } catch (err) {
    console.error(err)
    weather.value = null
    weatherError.value = 'Could not find that location. Try city and state.'
  } finally {
    weatherLoading.value = false
  }
}

onMounted(async () => {
  await loadDashboard()
  await loadSavedLocation()
})
</script>

<style scoped>
.dashboard-detail-page {
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.page-card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.4rem;
  margin-bottom: 1.25rem;
  box-shadow: var(--shadow);
}

.eyebrow {
  margin: 0 0 0.45rem 0;
  color: var(--accent);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.8rem;
}

h1,
h2,
h3 {
  margin: 0;
}

.subtext {
  color: var(--muted);
  margin-top: 0.45rem;
}

.back-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 700;
  padding-top: 0.25rem;
}

.toggle-list {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}

label {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.65rem 0.9rem;
}

.location-input {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

input {
  flex: 1;
  min-width: 230px;
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
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
  background: var(--accent);
  color: white;
}

.primary-button:hover {
  background: var(--accent-hover);
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.widget-card {
  background: var(--panel-2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
}

.error-text {
  color: #ff8d8d;
  margin-top: 0.8rem;
}
</style>