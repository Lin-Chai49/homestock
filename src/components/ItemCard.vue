<template>
  <button class="item-card" type="button" @click="$emit('click', item)">
    <div class="item-icon-wrap">
      <div class="item-icon" aria-hidden="true">{{ item.icon || categoryIcon(item.category) }}</div>
      <StatusBadge v-if="item.expiryStatus" :status="item.expiryStatus" class="status-pill" />
    </div>
    <div class="item-name">{{ item.name }}</div>
    <div class="item-meta">
      <span>{{ categoryName(item.category) }}</span>
      <span class="dot-sep">·</span>
      <span class="text-muted">{{ locationName(item.locationId) }}</span>
    </div>
    <div class="item-footer">
      <div class="qty">
        <span class="qty-num">{{ item.quantity }}</span>
        <span class="qty-unit">{{ item.unit }}</span>
      </div>
      <div class="expiry">
        <div class="expiry-rel">{{ formatRelativeExpiry(item.expiryDate) }}</div>
        <div class="expiry-date text-muted">{{ formatDate(item.expiryDate) }}</div>
      </div>
    </div>
  </button>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue';
import { categoryName, categoryIcon } from '@/constants/categories.js';
import { locationName } from '@/constants/locations.js';
import { formatRelativeExpiry, formatDate } from '@/services/dateService.js';

defineProps({
  item: { type: Object, required: true },
});
defineEmits(['click']);
</script>

<style scoped>
.item-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  text-align: left;
  width: 100%;
  box-shadow: var(--shadow-sm);
  border: 1px solid transparent;
  transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
}

.item-card:active {
  transform: translateY(-2px);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.item-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
}

.item-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.status-pill {
  position: absolute;
  top: 0;
  right: 0;
}

.item-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 6px;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dot-sep {
  color: var(--color-text-muted);
}

.item-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
  padding-top: 6px;
  margin-top: 4px;
  border-top: 1px solid var(--color-divider);
}

.qty {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.qty-num {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1;
}

.qty-unit {
  font-size: 11px;
  color: var(--color-text-muted);
}

.expiry {
  text-align: right;
}

.expiry-rel {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text);
}

.expiry-date {
  font-size: 10px;
}
</style>
