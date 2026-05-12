<template>
  <span class="badge" :class="`badge-${status}`">{{ labelMap[status] }}</span>
</template>

<script setup>
defineProps({
  status: {
    type: String,
    required: true,
    validator: (v) => ['fresh', 'info', 'warning', 'urgent', 'expired'].includes(v),
  },
});

const labelMap = {
  fresh: '新鲜',
  info: '关注',
  warning: '临期',
  urgent: '紧急',
  expired: '已过期',
};
</script>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-fresh {
  background: var(--color-success-soft);
  color: var(--color-success);
}
.badge-info {
  background: var(--color-info-soft);
  color: var(--color-info);
}
.badge-warning {
  background: var(--color-warning-soft);
  color: var(--color-warning);
}
.badge-urgent {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}
.badge-expired {
  background: var(--color-border);
  color: var(--color-text-muted);
}
</style>
