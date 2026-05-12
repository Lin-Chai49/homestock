<template>
  <header class="app-bar">
    <div class="app-bar-inner">
      <button v-if="back" class="back-btn" :aria-label="'返回'" @click="$router.back()">
        <span aria-hidden="true">‹</span>
      </button>
      <div class="title-block">
        <h1 class="page-title">
          <span v-if="icon" aria-hidden="true">{{ icon }}</span>
          <span>{{ title }}</span>
        </h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div class="actions">
        <slot name="actions" />
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: '' },
  back: { type: Boolean, default: false },
});
</script>

<style scoped>
.app-bar {
  padding: 16px 16px 8px;
}

.app-bar-inner {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  line-height: 1;
  color: var(--color-text-strong);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.title-block {
  flex: 1;
  min-width: 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
