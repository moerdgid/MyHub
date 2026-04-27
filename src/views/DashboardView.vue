<template>
  <main class="legacy-page">
    <div class="legacy-card">
      <h1>Dashboard Moved</h1>
      <p>This app now uses Display and Settings views.</p>

      <div class="actions">
        <router-link to="/" class="primary-link">Open Display</router-link>
        <router-link to="/settings" class="secondary-link">Open Settings</router-link>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
</script>

<style scoped>
.legacy-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.legacy-card {
  background: #15181d;
  border: 1px solid #262b33;
  border-radius: 20px;
  padding: 2rem;
}

h1 {
  margin-top: 0;
}

p {
  color: #aab4c3;
}

.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.25rem;
}

.primary-link,
.secondary-link {
  text-decoration: none;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-weight: 700;
}

.primary-link {
  background: #5aa2ff;
  color: white;
}

.secondary-link {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid #262b33;
}
</style>