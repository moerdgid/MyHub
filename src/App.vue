<template>
  <div class="app-shell">
    <nav class="nav">
      <router-link to="/">Home</router-link>
      <router-link to="/login">Login</router-link>
      <router-link to="/register">Register</router-link>
      <router-link to="/dashboard">Dashboard</router-link>
    </nav>

    <main class="page-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  min-height: 100%;
  font-family: Arial, Helvetica, sans-serif;
  background-color: #111;
  color: white;
}

.app-shell {
  min-height: 100vh;
}

.nav {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background-color: #1c1c1c;
  border-bottom: 1px solid #333;
}

.nav a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

.nav a.router-link-active {
  color: #4ea1ff;
}

.page-content {
  padding: 1.5rem;
}
</style>