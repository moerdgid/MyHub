<template>
  <div class="widget-card">
    <h3>Minecraft Server</h3>

    <div class="mc-form">
      <input
        v-model="serverAddress"
        type="text"
        placeholder="Enter server address"
      />

      <select v-model="edition">
        <option value="java">Java</option>
        <option value="bedrock">Bedrock</option>
      </select>

      <button @click="handleLoadServer" :disabled="loading">
        {{ loading ? 'Checking...' : 'Check Server' }}
      </button>

      <button @click="handleSaveServer" :disabled="saving">
        {{ saving ? 'Saving...' : 'Save Server' }}
      </button>
    </div>

    <p class="helper-text">
      Example: <code>hypixel.net</code>
    </p>

    <p v-if="saveMessage" class="save-text">{{ saveMessage }}</p>
    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>

    <div v-if="loading" class="state-text">
      Loading server status...
    </div>

    <div v-else-if="serverData" class="server-status">
      <p>
        <strong>Status:</strong>
        <span :class="serverData.online ? 'online-text' : 'offline-text'">
          {{ serverData.online ? 'Online' : 'Offline' }}
        </span>
      </p>

      <p v-if="serverData.hostname">
        <strong>Hostname:</strong> {{ serverData.hostname }}
      </p>

      <p v-if="serverData.version">
        <strong>Version:</strong> {{ serverData.version }}
      </p>

      <p v-if="serverData.players">
        <strong>Players:</strong>
        {{ serverData.players.online ?? 0 }} / {{ serverData.players.max ?? 0 }}
      </p>

      <div
        v-if="serverData.players?.list && serverData.players.list.length > 0"
        class="player-list"
      >
        <strong>Online Players:</strong>
        <ul>
          <li v-for="player in serverData.players.list" :key="player.uuid || player.name">
            {{ player.name }}
          </li>
        </ul>
      </div>

      <div v-if="serverData.motd?.clean && serverData.motd.clean.length > 0">
        <strong>MOTD:</strong>
        <p v-for="line in serverData.motd.clean" :key="line">
          {{ decodeHtml(line) }}
        </p>
      </div>
    </div>

    <div v-else class="state-text">
      No server loaded yet.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getMinecraftStatus, type MinecraftStatus } from '../services/minecraft'
import { getUserProfile, updateUserMinecraftSettings } from '../services/auth'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const serverAddress = ref('')
const edition = ref<'java' | 'bedrock'>('java')
const serverData = ref<MinecraftStatus | null>(null)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')
const saveMessage = ref('')

const decodeHtml = (text: string) => {
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  return textarea.value
}

const loadSavedSettings = async () => {
  if (!authStore.user) return

  try {
    const profile = await getUserProfile(authStore.user.uid)

    if (profile) {
      serverAddress.value = profile.minecraftServer || ''
      edition.value = profile.minecraftEdition || 'java'

      if (serverAddress.value.trim()) {
        await handleLoadServer()
      }
    }
  } catch (error) {
    console.error('Failed to load saved Minecraft settings:', error)
  }
}

const handleLoadServer = async () => {
  saveMessage.value = ''
  errorMessage.value = ''

  if (!serverAddress.value.trim()) {
    errorMessage.value = 'Please enter a server address.'
    return
  }

  loading.value = true

  try {
    serverData.value = await getMinecraftStatus(
      serverAddress.value.trim(),
      edition.value
    )
  } catch (error) {
    console.error('Minecraft server fetch failed:', error)
    errorMessage.value = 'Could not load server status.'
    serverData.value = null
  } finally {
    loading.value = false
  }
}

const handleSaveServer = async () => {
  saveMessage.value = ''
  errorMessage.value = ''

  if (!authStore.user) {
    errorMessage.value = 'You must be logged in.'
    return
  }

  if (!serverAddress.value.trim()) {
    errorMessage.value = 'Please enter a server address before saving.'
    return
  }

  saving.value = true

  try {
    await updateUserMinecraftSettings(
      authStore.user.uid,
      serverAddress.value.trim(),
      edition.value
    )

    saveMessage.value = 'Server saved to your account.'
  } catch (error) {
    console.error('Failed to save Minecraft settings:', error)
    errorMessage.value = 'Could not save server settings.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadSavedSettings()
})
</script>

<style scoped>
.widget-card {
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1rem;
}

.mc-form {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

input,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #444;
  border-radius: 6px;
  background: #181818;
  color: white;
  box-sizing: border-box;
}

button {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 6px;
  background: #4ea1ff;
  color: white;
  cursor: pointer;
  font-weight: bold;
}

.helper-text,
.state-text {
  color: #bbb;
}

.error-text {
  color: #ff8080;
}

.save-text {
  color: #69d07d;
}

.online-text {
  color: #69d07d;
}

.offline-text {
  color: #ff8080;
}

.server-status p {
  margin: 0.4rem 0;
}

.player-list ul {
  margin: 0.5rem 0 0 1.2rem;
}
</style>