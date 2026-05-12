<template>
  <div class="empty">
    <div class="empty-icon" aria-hidden="true">{{ icon }}</div>
    <h3 class="empty-title">{{ title }}</h3>
    <p v-if="hint" class="empty-hint">{{ hint }}</p>
    <button v-if="actionLabel" class="btn btn-primary" @click="$emit('action')">
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, required: true },
  hint: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
});
defineEmits(['action']);
</script>

<style scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 16px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-strong);
}

.empty-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  max-width: 280px;
}

.btn-primary {
  margin-top: 8px;
}
</style>
