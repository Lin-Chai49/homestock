<template>
  <nav class="tab-bar" :aria-label="'底部导航'">
    <RouterLink
      v-for="tab in primaryTabs"
      :key="tab.path"
      :to="tab.path"
      class="tab"
      :class="{ active: isActive(tab) }"
    >
      <span class="tab-icon" aria-hidden="true">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="tab.badge && tab.badgeCount > 0" class="tab-badge">
        {{ tab.badgeCount > 99 ? '99+' : tab.badgeCount }}
      </span>
    </RouterLink>

    <RouterLink to="/add" class="tab tab-fab" :class="{ active: route.path === '/add' }">
      <span class="fab-button" aria-hidden="true">+</span>
      <span class="tab-label">入库</span>
    </RouterLink>

    <RouterLink
      v-for="tab in trailingTabs"
      :key="tab.path"
      :to="tab.path"
      class="tab"
      :class="{ active: isActive(tab) }"
    >
      <span class="tab-icon" aria-hidden="true">{{ tab.icon }}</span>
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="tab.badge && tab.badgeCount > 0" class="tab-badge">
        {{ tab.badgeCount > 99 ? '99+' : tab.badgeCount }}
      </span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { useItemsStore } from '@/stores/items.js';
import { storeToRefs } from 'pinia';

const route = useRoute();
const items = useItemsStore();
const { expiringSoon } = storeToRefs(items);

const primaryTabs = computed(() => [
  { path: '/', label: '总览', icon: '🏡' },
  { path: '/items', label: '物资', icon: '📋' },
]);

const trailingTabs = computed(() => [
  {
    path: '/expiry',
    label: '临期',
    icon: '🔔',
    badge: true,
    badgeCount: expiringSoon.value.length,
  },
  { path: '/more', label: '我的', icon: '👤' },
]);

function isActive(tab) {
  if (tab.path === '/') return route.path === '/';
  return route.path.startsWith(tab.path);
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
  box-shadow: 0 -2px 12px rgba(45, 42, 38, 0.06);
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  padding: 10px 4px 8px;
  color: var(--color-text-muted);
  font-size: 11px;
  font-weight: 500;
  position: relative;
  transition: color 0.15s ease, transform 0.15s ease;
}

.tab.active {
  color: var(--color-primary);
}

.tab-icon {
  font-size: 22px;
  line-height: 1;
}

.tab-label {
  font-size: 11px;
  line-height: 1.2;
}

.tab-fab {
  position: relative;
  margin-top: -18px;
  color: var(--color-primary);
}

.fab-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: var(--color-text-on-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  line-height: 1;
  box-shadow: var(--shadow-primary);
  transition: transform 0.15s ease;
}

.tab-fab:active .fab-button {
  transform: scale(0.94);
}

.tab-badge {
  position: absolute;
  top: 4px;
  right: 16px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: var(--radius-pill);
  background: var(--color-danger);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  line-height: 16px;
  text-align: center;
}

@media (min-width: 720px) {
  .tab-bar {
    max-width: 720px;
    margin: 0 auto;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  }
}
</style>
