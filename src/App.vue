<template>
  <div class="app-shell">
    <header class="topbar">
      <div class="brand">
        <router-link to="/">MyHub</router-link>
      </div>

      <nav class="nav-links">
        <router-link to="/">Display</router-link>
        <router-link to="/settings">Settings</router-link>
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </nav>
    </header>

    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
:root {
  --bg: #0b0d10;
  --panel: #15181d;
  --panel-2: #101317;
  --border: #262b33;
  --text: #f4f7fb;
  --muted: #aab4c3;
  --accent: #5aa2ff;
  --accent-hover: #3f8ef5;
  --danger: #d9534f;
  --success: #69d07d;
  --shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
}

html,
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100%;
  background: radial-gradient(circle at top, #131821 0%, #0b0d10 45%);
  color: var(--text);
  font-family: Arial, Helvetica, sans-serif;
}

* {
  box-sizing: border-box;
}

a {
  color: inherit;
}

button,
input,
textarea,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(14, 17, 22, 0.86);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border);
}

.brand a {
  text-decoration: none;
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.nav-links {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-links a {
  text-decoration: none;
  color: var(--muted);
  padding: 0.65rem 0.9rem;
  border-radius: 10px;
  transition: 0.2s ease;
  font-weight: 600;
}

.nav-links a:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
}

.nav-links a.router-link-active {
  background: rgba(90, 162, 255, 0.14);
  color: var(--text);
  border: 1px solid rgba(90, 162, 255, 0.28);
}

.page-content {
  padding: 1.25rem;
}
</style>