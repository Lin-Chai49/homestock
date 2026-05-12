<template>
  <div class="cat-tabs scroll-hide" role="tablist">
    <button
      class="cat-tab"
      :class="{ active: modelValue === 'all' }"
      role="tab"
      :aria-selected="modelValue === 'all'"
      @click="$emit('update:modelValue', 'all')"
    >
      <span aria-hidden="true">🗂️</span>
      <span>全部</span>
      <span v-if="counts && counts.all !== undefined" class="cat-count">{{ counts.all }}</span>
    </button>
    <button
      v-for="cat in categories"
      :key="cat.key"
      class="cat-tab"
      :class="{ active: modelValue === cat.key }"
      role="tab"
      :aria-selected="modelValue === cat.key"
      @click="$emit('update:modelValue', cat.key)"
    >
      <span aria-hidden="true">{{ cat.icon }}</span>
      <span>{{ cat.name }}</span>
      <span v-if="counts && counts[cat.key] !== undefined" class="cat-count">{{ counts[cat.key] }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: 'all' },
  categories: { type: Array, required: true },
  counts: { type: Object, default: null },
});
defineEmits(['update:modelValue']);
</script>

<style scoped>
.cat-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 16px 12px;
  margin: 0 -16px;
}

.cat-tab {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border-radius: var(--radius-pill);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.cat-tab:active {
  transform: scale(0.97);
}

.cat-tab.active {
  background: var(--gradient-primary);
  color: var(--color-text-on-primary);
  box-shadow: var(--shadow-primary);
}

.cat-tab.active .cat-count {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.cat-count {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-radius: var(--radius-pill);
  padding: 0 6px;
  font-size: 11px;
  font-weight: 600;
}
</style>
