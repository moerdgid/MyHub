<template>
  <main class="settings-page">
    <div class="settings-header">
      <div>
        <p class="eyebrow">Control panel</p>
        <h1>Display Settings</h1>
        <p class="subtext">Configure what appears on the full-screen display.</p>
      </div>

      <button class="secondary-button" @click="handleLogout">Logout</button>
    </div>

    <section class="page-card">
      <h2>Visible Widgets</h2>

      <div class="toggle-grid">
        <label><input type="checkbox" v-model="settings.showWeather" /> Weather</label>
        <label><input type="checkbox" v-model="settings.showAnnouncements" /> Announcements</label>
        <label><input type="checkbox" v-model="settings.showMinecraft" /> Minecraft</label>
        <label><input type="checkbox" v-model="settings.use24HourTime" /> 24-hour time</label>
      </div>
    </section>

    <section class="page-card">
      <h2>Weather</h2>

      <div class="form-row">
        <input
          v-model="locationInput"
          placeholder="City and state, like Grand Rapids, MI"
        />
        <button class="primary-button" @click="saveLocation">Save Location</button>
      </div>

      <p v-if="locationMessage" class="success-text">{{ locationMessage }}</p>
    </section>

    <section class="page-card">
      <h2>Minecraft</h2>

      <div class="form-row">
        <input
          v-model="minecraftServer"
          placeholder="Server address"
        />

        <select v-model="minecraftEdition">
          <option value="java">Java</option>
          <option value="bedrock">Bedrock</option>
        </select>

        <button class="primary-button" @click="saveMinecraft">Save Server</button>
      </div>

      <p v-if="minecraftMessage" class="success-text">{{ minecraftMessage }}</p>
    </section>

    <section class="page-card">
      <h2>Announcements</h2>

      <form class="announcement-form" @submit.prevent="handleCreateAnnouncement">
        <input
          v-model="announcementTitle"
          placeholder="Announcement title"
          required
        />
        <textarea
          v-model="announcementBody"
          placeholder="Announcement body"
          rows="4"
          required
        ></textarea>
        <button class="primary-button" type="submit">
          Post Announcement
        </button>
      </form>
    </section>

    <section class="page-card">
      <h2>Account Security</h2>

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

    <div class="footer-actions">
      <button class="primary-button large-button" @click="saveDisplaySettings">
        Save Display Settings
      </button>
      <router-link class="display-link" to="/">Open Full Display</router-link>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  changePassword,
  getUserProfile,
  logoutUser,
  updateUserDisplaySettings,
  updateUserLocation,
  updateUserMinecraftSettings,
} from '../services/auth'
import { createAnnouncement } from '../services/announcements'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const settings = ref({
  showWeather: true,
  showAnnouncements: true,
  showMinecraft: true,
  use24HourTime: false,
})

const locationInput = ref('')
const minecraftServer = ref('')
const minecraftEdition = ref<'java' | 'bedrock'>('java')

const announcementTitle = ref('')
const announcementBody = ref('')
const newPassword = ref('')

const locationMessage = ref('')
const minecraftMessage = ref('')

const loadProfile = async () => {
  if (!authStore.user) return

  const profile = await getUserProfile(authStore.user.uid)

  if (!profile) return

  locationInput.value = profile.defaultLocation || ''
  minecraftServer.value = profile.minecraftServer || ''
  minecraftEdition.value = profile.minecraftEdition || 'java'

  settings.value = {
    showWeather: profile.displaySettings?.showWeather ?? true,
    showAnnouncements: profile.displaySettings?.showAnnouncements ?? true,
    showMinecraft: profile.displaySettings?.showMinecraft ?? true,
    use24HourTime: profile.displaySettings?.use24HourTime ?? false,
  }
}

const saveDisplaySettings = async () => {
  if (!authStore.user) return
  await updateUserDisplaySettings(authStore.user.uid, settings.value)
  alert('Display settings saved.')
}

const saveLocation = async () => {
  if (!authStore.user) return
  await updateUserLocation(authStore.user.uid, locationInput.value)
  locationMessage.value = 'Location saved.'
  setTimeout(() => {
    locationMessage.value = ''
  }, 2500)
}

const saveMinecraft = async () => {
  if (!authStore.user) return
  await updateUserMinecraftSettings(
    authStore.user.uid,
    minecraftServer.value,
    minecraftEdition.value
  )
  minecraftMessage.value = 'Minecraft server saved.'
  setTimeout(() => {
    minecraftMessage.value = ''
  }, 2500)
}

const handleCreateAnnouncement = async () => {
  if (!authStore.user) return

  await createAnnouncement(
    announcementTitle.value,
    announcementBody.value,
    authStore.user.email || 'Unknown User'
  )

  announcementTitle.value = ''
  announcementBody.value = ''
  alert('Announcement posted.')
}

const handleChangePassword = async () => {
  try {
    await changePassword(newPassword.value)
    alert('Password updated successfully.')
    newPassword.value = ''
  } catch (error: any) {
    if (error.code === 'auth/requires-recent-login') {
      alert('Log out and log back in before changing password.')
    } else {
      alert('Failed to update password.')
    }
  }
}

const handleLogout = async () => {
  await logoutUser()
  router.push('/login')
}

onMounted(loadProfile)
</script>

<style scoped>
.settings-page {
  max-width: 1100px;
  margin: 0 auto;
}

.settings-header {
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

h1,
h2 {
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

.toggle-grid {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

label {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.7rem 0.95rem;
}

.form-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

input,
textarea,
select {
  width: 100%;
  padding: 0.85rem 0.95rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--panel-2);
  color: var(--text);
}

input,
select {
  flex: 1;
  min-width: 220px;
}

.announcement-form {
  display: grid;
  gap: 0.8rem;
  margin-top: 1rem;
}

.primary-button,
.secondary-button,
.large-button {
  padding: 0.85rem 1rem;
  border-radius: 12px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.primary-button,
.large-button {
  background: var(--accent);
  color: white;
}

.primary-button:hover,
.large-button:hover {
  background: var(--accent-hover);
}

.secondary-button {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text);
  border: 1px solid var(--border);
}

.success-text {
  color: var(--success);
  margin-top: 0.8rem;
}

.footer-actions {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}

.large-button {
  padding-inline: 1.4rem;
}

.display-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 700;
}
</style>