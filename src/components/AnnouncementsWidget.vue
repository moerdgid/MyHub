<template>
  <div class="widget-card">
    <h3>Announcements</h3>

    <form class="announcement-form" @submit.prevent="handleCreateAnnouncement">
      <input v-model="newTitle" type="text" placeholder="Announcement title" required />
      <textarea v-model="newBody" placeholder="Announcement body" rows="3" required></textarea>

      <button type="submit" :disabled="creating">
        {{ creating ? 'Posting...' : 'Post Announcement' }}
      </button>
    </form>

    <p v-if="loading" class="state-text">Loading announcements...</p>
    <p v-else-if="announcements.length === 0" class="state-text">No announcements yet.</p>

    <div v-else class="announcement-list">
      <article v-for="announcement in announcements" :key="announcement.id" class="announcement-item">
        <h4>{{ announcement.title }}</h4>
        <p>{{ announcement.body }}</p>
        <small>Posted by {{ announcement.authorEmail }}</small>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import {
  createAnnouncement,
  subscribeToAnnouncements,
  type Announcement,
} from '../services/announcements'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const announcements = ref<Announcement[]>([])
const newTitle = ref('')
const newBody = ref('')
const loading = ref(true)
const creating = ref(false)

let unsubscribe: (() => void) | undefined

const handleCreateAnnouncement = async () => {
  if (!authStore.user) return

  creating.value = true

  try {
    await createAnnouncement(
      newTitle.value,
      newBody.value,
      authStore.user.email || 'Unknown User'
    )

    newTitle.value = ''
    newBody.value = ''
  } catch (error) {
    console.error('Failed to create announcement:', error)
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  unsubscribe = subscribeToAnnouncements((items) => {
    announcements.value = items
    loading.value = false
  })
})

onUnmounted(() => {
  if (unsubscribe) unsubscribe()
})
</script>

<style scoped>
.widget-card {
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 1rem;
}

.announcement-form,
.announcement-list {
  display: grid;
  gap: 0.75rem;
}

.announcement-form {
  margin-bottom: 1rem;
}

input,
textarea {
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

.state-text,
.announcement-item small {
  color: #bbb;
}

.announcement-item {
  border: 1px solid #333;
  border-radius: 8px;
  padding: 0.85rem;
  background: #181818;
}

.announcement-item h4,
.announcement-item p {
  margin: 0 0 0.5rem 0;
}
</style>