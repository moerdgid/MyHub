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
          <p>Customize your dashboard.</p>
        </div>

        <router-link class="back-link" to="/dashboard">
          Back
        </router-link>
      </div>

      <!-- SETTINGS -->
      <section class="settings-card">
        <h2>Widgets</h2>

        <div class="toggle-list">
          <label><input type="checkbox" v-model="widgets.weather" /> Weather</label>
          <label><input type="checkbox" v-model="widgets.announcements" /> Announcements</label>
          <label><input type="checkbox" v-model="widgets.minecraft" /> Minecraft</label>
        </div>

        <button @click="handleSaveWidgets">
          Save Settings
        </button>
      </section>

      <!-- WEATHER SETTINGS -->
      <section v-if="widgets.weather" class="settings-card">
        <h2>Weather Location</h2>

        <div class="location-input">
          <input
            v-model="locationInput"
            placeholder="Enter city (e.g. Grand Rapids, MI)"
          />

          <button @click="updateLocation">
            Save Location
          </button>
        </div>
      </section>

      <!-- DASHBOARD -->
      <section class="preview-card">
        <h2>Dashboard</h2>

        <div class="widget-grid">

          <!-- WEATHER -->
          <div v-if="widgets.weather" class="widget-card">
            <h3>Weather</h3>

            <p v-if="weatherLoading">Loading...</p>

            <div v-else-if="weather">
              <p><strong>Temp:</strong> {{ weather.temperature }}°F</p>
              <p><strong>Wind:</strong> {{ weather.windspeed }} mph</p>
            </div>

            <p v-else>No data</p>
          </div>

          <!-- ANNOUNCEMENTS -->
          <AnnouncementsWidget v-if="widgets.announcements" />

          <!-- MINECRAFT -->
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
const weatherLoading = ref(true)

const locationInput = ref('')

/* ---------------- DASHBOARD ---------------- */

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

/* ---------------- WEATHER ---------------- */

const loadWeather = async (lat: number, lng: number) => {
  try {
    weather.value = await getWeather(lat, lng)
  } catch (err) {
    console.error('Weather error:', err)
    weather.value = null
  }
}

const loadSavedLocation = async () => {
  if (!authStore.user) return

  weatherLoading.value = true

  try {
    const profile = await getUserProfile(authStore.user.uid)

    if (profile?.defaultLocation) {
      locationInput.value = profile.defaultLocation

      const coords = await getCoordinatesFromCity(locationInput.value)

      await loadWeather(coords.latitude, coords.longitude)
    }

  } catch (err) {
    console.error('Load location error:', err)
    weather.value = null
  } finally {
    weatherLoading.value = false
  }
}

const updateLocation = async () => {
  if (!authStore.user) return

  weatherLoading.value = true

  try {
    const coords = await getCoordinatesFromCity(locationInput.value)

    await loadWeather(coords.latitude, coords.longitude)

    await updateUserLocation(
      authStore.user.uid,
      locationInput.value
    )

  } catch (err: any) {
    console.error('Location error:', err)

    weather.value = null
    alert('Could not find that location. Try something like "Chicago, IL"')

  } finally {
    weatherLoading.value = false
  }
}

/* ---------------- INIT ---------------- */

onMounted(async () => {
  await loadDashboard()
  await loadSavedLocation()
})
</script>

<style scoped>
.dashboard-detail-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.settings-card,
.preview-card {
  background: #1b1b1b;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.toggle-list {
  display: flex;
  gap: 1rem;
}

.location-input {
  display: flex;
  gap: 0.5rem;
}

input {
  flex: 1;
  padding: 0.7rem;
  background: #111;
  color: white;
  border-radius: 6px;
  border: 1px solid #333;
}

button {
  padding: 0.7rem 1rem;
  background: #4ea1ff;
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
}

.widget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.widget-card {
  background: #111;
  padding: 1rem;
  border-radius: 10px;
}
</style>