<template>
  <div class="stat-card" :class="`v-${variant}`">
    <div class="stat-top">
      <span class="stat-label">{{ label }}</span>
      <span v-if="icon" class="stat-icon" aria-hidden="true">{{ icon }}</span>
    </div>
    <div class="stat-value">
      <span class="value">{{ value }}</span>
      <span v-if="unit" class="unit">{{ unit }}</span>
    </div>
    <p v-if="hint" class="stat-hint">{{ hint }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  unit: { type: String, default: '' },
  icon: { type: String, default: '' },
  hint: { type: String, default: '' },
  variant: {
    type: String,
    default: 'default',
    validator: (v) =>
      ['default', 'primary', 'warning', 'danger', 'success', 'info'].includes(v),
  },
});
</script>

<style scoped>
.stat-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 14px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 88px;
}

.stat-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--color-text-muted);
}

.stat-icon {
  font-size: 16px;
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--color-text-strong);
}

.value {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.1;
}

.unit {
  font-size: 12px;
  color: var(--color-text-muted);
}

.stat-hint {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: auto;
}

.v-primary {
  background: var(--gradient-primary);
  color: var(--color-text-on-primary);
}
.v-primary .stat-top,
.v-primary .stat-hint,
.v-primary .unit {
  color: rgba(255, 255, 255, 0.9);
}
.v-primary .value {
  color: #fff;
}

.v-warning .value {
  color: var(--color-warning);
}
.v-danger .value {
  color: var(--color-danger);
}
.v-success .value {
  color: var(--color-success);
}
.v-info .value {
  color: var(--color-info);
}

.v-warning {
  background: var(--color-warning-soft);
}
.v-danger {
  background: var(--color-danger-soft);
}
.v-success {
  background: var(--color-success-soft);
}
.v-info {
  background: var(--color-info-soft);
}
</style>
