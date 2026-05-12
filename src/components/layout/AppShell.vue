<template>
  <div class="app-shell">
    <main class="app-main">
      <slot />
    </main>
    <BottomTabBar v-if="!route.meta?.hideShell" />
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import BottomTabBar from './BottomTabBar.vue';

const route = useRoute();
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background: var(--gradient-bg);
}

.app-main {
  flex: 1;
  width: 100%;
  position: relative;
}
</style>
