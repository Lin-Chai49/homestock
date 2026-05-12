<template>
  <button class="loc-card" type="button" @click="$emit('click', location)">
    <div class="loc-icon" :style="{ background: location.color || 'var(--color-primary)' }">
      <span aria-hidden="true">{{ location.icon }}</span>
    </div>
    <div class="loc-body">
      <div class="loc-name">{{ location.name }}</div>
      <div class="loc-desc">{{ location.description }}</div>
      <div class="loc-stats">
        <span class="qty">{{ location.itemCount || 0 }} 件</span>
        <span v-if="location.expiringCount > 0" class="badge badge-warning">
          临期 {{ location.expiringCount }}
        </span>
      </div>
    </div>
  </button>
</template>

<script setup>
defineProps({
  location: { type: Object, required: true },
});
defineEmits(['click']);
</script>

<style scoped>
.loc-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  text-align: left;
  box-shadow: var(--shadow-sm);
  border: 1px solid transparent;
  transition: transform 0.15s ease, border-color 0.15s ease;
  width: 100%;
}

.loc-card:active {
  transform: translateY(-2px);
  border-color: var(--color-primary);
}

.loc-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.loc-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.loc-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-strong);
}

.loc-desc {
  font-size: 11px;
  color: var(--color-text-muted);
}

.loc-stats {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
}

.qty {
  font-size: 12px;
  color: var(--color-primary);
  font-weight: 600;
}
</style>
