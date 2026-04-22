<template>
  <main class="display-page">
    <div class="display-header">
      <div>
        <p class="eyebrow">Always-on display</p>
        <h1>MyHub</h1>
      </div>

      <div class="time-block">
        <p class="date-text">{{ formattedDate }}</p>
        <h2>{{ formattedTime }}</h2>
      </div>
    </div>

    <section class="display-grid">
      <article v-if="settings.showWeather" class="display-card weather-card">
        <div class="card-header">
          <h3>Weather</h3>
          <p class="muted">{{ locationLabel || 'No saved city' }}</p>
        </div>

        <div v-if="weather" class="weather-layout">
          <div class="weather-main">
            <div class="temp-line">
              <span class="temp">{{ weather.current.temperature }}°</span>
              <span class="unit">F</span>
            </div>
            <p class="muted big-muted">Wind {{ weather.current.windspeed }} mph</p>
          </div>

          <div class="weather-details">
            <div class="stat-box">
              <span class="stat-label">High</span>
              <span class="stat-value">{{ weather.daily.high }}°</span>
            </div>

            <div class="stat-box">
              <span class="stat-label">Low</span>
              <span class="stat-value">{{ weather.daily.low }}°</span>
            </div>

            <div class="stat-box">
              <span class="stat-label">Precip</span>
              <span class="stat-value">{{ weather.daily.precipitationSum }} in</span>
            </div>

            <div class="stat-box">
              <span class="stat-label">Chance</span>
              <span class="stat-value">{{ weather.daily.precipitationChance }}%</span>
            </div>
          </div>
        </div>

        <p v-else class="muted">No weather available.</p>
      </article>

      <article v-if="settings.showMinecraft" class="display-card minecraft-card">
        <div class="card-header">
          <h3>Minecraft</h3>
          <p class="muted">{{ minecraftServer || 'No saved server' }}</p>
        </div>

        <div v-if="minecraftData" class="stack">
          <p>
            <strong>Status:</strong>
            <span :class="minecraftData.online ? 'online' : 'offline'">
              {{ minecraftData.online ? 'Online' : 'Offline' }}
            </span>
          </p>

          <p v-if="minecraftData.version">
            <strong>Version:</strong> {{ minecraftData.version }}
          </p>

          <p v-if="minecraftData.players">
            <strong>Players:</strong>
            {{ minecraftData.players.online ?? 0 }} / {{ minecraftData.players.max ?? 0 }}
          </p>

          <div
            v-if="minecraftData.players?.list && minecraftData.players.list.length > 0"
            class="player-list"
          >
            <div
              v-for="player in minecraftData.players.list.slice(0, 8)"
              :key="player.name"
              class="player-row"
            >
              <img
                :src="getPlayerHeadUrl(player.name)"
                :alt="player.name"
                class="player-head"
                @error="handleImageError"
              />
              <span>{{ player.name }}</span>
            </div>
          </div>
        </div>

        <p v-else class="muted">No server data available.</p>
      </article>

      <article
        v-if="settings.showAnnouncements"
        class="display-card announcements-card"
      >
        <div class="card-header">
          <h3>Announcements</h3>
          <p class="muted">{{ announcements.length }} item(s)</p>
        </div>

        <div v-if="announcements.length > 0" class="announcement-stack">
          <div
            v-for="announcement in announcements.slice(0, 5)"
            :key="announcement.id"
            class="announcement-item"
          >
            <h4>{{ announcement.title }}</h4>
            <p>{{ announcement.body }}</p>
            <small>{{ announcement.authorEmail }}</small>
          </div>
        </div>

        <p v-else class="muted">No announcements yet.</p>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { getUserProfile } from '../services/auth'
import { getCoordinatesFromCity, getWeather } from '../services/weather'
import { getMinecraftStatus, type MinecraftStatus } from '../services/minecraft'
import { subscribeToAnnouncements, type Announcement } from '../services/announcements'

type WeatherBundle = {
  current: {
    temperature: number
    windspeed: number
    precipitation: number
    weatherCode: number
  }
  daily: {
    high: number
    low: number
    precipitationSum: number
    precipitationChance: number
  }
}

const authStore = useAuthStore()

const now = ref(new Date())
const weather = ref<WeatherBundle | null>(null)
const minecraftData = ref<MinecraftStatus | null>(null)
const announcements = ref<Announcement[]>([])

const locationLabel = ref('')
const minecraftServer = ref('')
const minecraftEdition = ref<'java' | 'bedrock'>('java')

const settings = ref({
  showWeather: true,
  showAnnouncements: true,
  showMinecraft: true,
  use24HourTime: false,
})

let clockInterval: number | undefined
let weatherInterval: number | undefined
let minecraftInterval: number | undefined
let unsubscribeAnnouncements: (() => void) | undefined

const formattedTime = computed(() => {
  return now.value.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !settings.value.use24HourTime,
  })
})

const formattedDate = computed(() => {
  return now.value.toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
})

const getPlayerHeadUrl = (playerName?: string) => {
  if (!playerName) {
    return 'https://mc-heads.net/avatar/Steve/48'
  }

  return `https://mc-heads.net/avatar/${encodeURIComponent(playerName)}/48`
}

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://mc-heads.net/avatar/Steve/48'
}

const loadProfileData = async () => {
  if (!authStore.user) return

  const profile = await getUserProfile(authStore.user.uid)
  if (!profile) return

  locationLabel.value = profile.defaultLocation || ''
  minecraftServer.value = profile.minecraftServer || ''
  minecraftEdition.value = profile.minecraftEdition || 'java'

  settings.value = {
    showWeather: profile.displaySettings?.showWeather ?? true,
    showAnnouncements: profile.displaySettings?.showAnnouncements ?? true,
    showMinecraft: profile.displaySettings?.showMinecraft ?? true,
    use24HourTime: profile.displaySettings?.use24HourTime ?? false,
  }
}

const refreshWeather = async () => {
  if (!locationLabel.value) return

  try {
    const coords = await getCoordinatesFromCity(locationLabel.value)
    weather.value = await getWeather(coords.latitude, coords.longitude)
  } catch (error) {
    console.error('Weather refresh failed:', error)
    weather.value = null
  }
}

const refreshMinecraft = async () => {
  if (!minecraftServer.value) return

  try {
    minecraftData.value = await getMinecraftStatus(
      minecraftServer.value,
      minecraftEdition.value
    )
  } catch (error) {
    console.error('Minecraft refresh failed:', error)
    minecraftData.value = null
  }
}

onMounted(async () => {
  await loadProfileData()
  await refreshWeather()
  await refreshMinecraft()

  unsubscribeAnnouncements = subscribeToAnnouncements((items) => {
    announcements.value = items
  })

  clockInterval = window.setInterval(() => {
    now.value = new Date()
  }, 1000)

  weatherInterval = window.setInterval(() => {
    refreshWeather()
  }, 1000 * 60 * 10)

  minecraftInterval = window.setInterval(() => {
    refreshMinecraft()
  }, 1000 * 60 * 5)
})

onUnmounted(() => {
  if (clockInterval) window.clearInterval(clockInterval)
  if (weatherInterval) window.clearInterval(weatherInterval)
  if (minecraftInterval) window.clearInterval(minecraftInterval)
  if (unsubscribeAnnouncements) unsubscribeAnnouncements()
})
</script>

<style scoped>
.display-page {
  max-width: 1650px;
  margin: 0 auto;
  min-height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.display-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  padding: 0.5rem 0 0.25rem;
}

.eyebrow {
  margin: 0 0 0.45rem 0;
  color: var(--accent);
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

h1 {
  margin: 0;
  font-size: clamp(2.6rem, 5vw, 4.6rem);
  line-height: 1;
}

.time-block {
  text-align: right;
}

.date-text {
  margin: 0 0 0.35rem 0;
  color: var(--muted);
  font-weight: 600;
  font-size: 1.15rem;
}

.time-block h2 {
  margin: 0;
  font-size: clamp(2.6rem, 5vw, 4rem);
  line-height: 1;
}

.display-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  grid-template-rows: auto auto;
  gap: 1rem;
  flex: 1;
}

.display-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.015));
  border: 1px solid var(--border);
  border-radius: 28px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  min-height: 260px;
}

.weather-card {
  min-height: 360px;
}

.minecraft-card {
  min-height: 360px;
}

.announcements-card {
  grid-column: 1 / -1;
  min-height: 280px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
  margin-bottom: 1.15rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.8rem;
}

.weather-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1.25rem;
  align-items: stretch;
}

.weather-main {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.temp-line {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
}

.temp {
  font-size: clamp(3.6rem, 7vw, 3.8rem);
  line-height: 1;
  font-weight: 700;
}

.unit {
  font-size: 1.7rem;
  color: var(--muted);
  font-weight: 700;
}

.big-muted {
  margin-top: 1rem;
  font-size: 1.2rem;
}

.weather-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 0.8rem;
}

.stat-box {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  justify-content: center;
  min-height: 110px;
}

.stat-label {
  color: var(--muted);
  font-size: 0.95rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
}

.muted {
  color: var(--muted);
}

.stack p {
  margin: 0.55rem 0;
  font-size: 1.35rem;
}

.online {
  color: var(--success);
  font-weight: 700;
}

.offline {
  color: #ff8d8d;
  font-weight: 700;
}

.player-list {
  display: grid;
  gap: 0.7rem;
  margin-top: 1rem;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.15rem;
}

.player-head {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  image-rendering: pixelated;
  border: 1px solid rgba(255, 255, 255, 0.08);
  object-fit: cover;
  flex-shrink: 0;
}

.announcement-stack {
  display: grid;
  gap: 0.8rem;
}

.announcement-item {
  padding: 1rem 1.05rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
}

.announcement-item h4 {
  margin: 0 0 0.35rem 0;
  font-size: 1.25rem;
}

.announcement-item p {
  margin: 0 0 0.45rem 0;
  color: var(--text);
  line-height: 1.5;
  font-size: 1.05rem;
}

.announcement-item small {
  color: var(--muted);
  font-size: 0.95rem;
}

@media (max-width: 1100px) {
  .display-grid {
    grid-template-columns: 1fr;
  }

  .announcements-card {
    grid-column: auto;
  }

  .weather-layout {
    grid-template-columns: 1fr;
  }

  .display-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .time-block {
    text-align: left;
  }
}
</style>