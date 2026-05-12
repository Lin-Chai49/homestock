<template>
  <button class="expiry-card" :class="`v-${status}`" type="button" @click="$emit('click', item)">
    <div class="edge" :class="`edge-${status}`" />
    <div class="content">
      <div class="left">
        <div class="icon" aria-hidden="true">{{ item.icon || categoryIcon(item.category) }}</div>
      </div>
      <div class="middle">
        <div class="name">{{ item.name }}</div>
        <div class="meta">
          <span>{{ item.quantity }} {{ item.unit }}</span>
          <span class="dot-sep">·</span>
          <span class="text-muted">{{ locationName(item.locationId) }}</span>
        </div>
        <div v-if="suggestion" class="hint">💡 {{ suggestion }}</div>
      </div>
      <div class="right">
        <div class="big-days">{{ Math.abs(item.daysUntilExpiry) }}</div>
        <div class="small-label">{{ item.daysUntilExpiry >= 0 ? '天后过期' : '天前过期' }}</div>
        <div class="date">{{ formatDate(item.expiryDate) }}</div>
      </div>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';
import { categoryIcon } from '@/constants/categories.js';
import { locationName } from '@/constants/locations.js';
import { formatDate } from '@/services/dateService.js';

const props = defineProps({
  item: { type: Object, required: true },
});
defineEmits(['click']);

const status = computed(() => props.item.expiryStatus || 'fresh');

const SUGGESTIONS = {
  food: '建议今明两天内食用',
  drug: '建议尽快服用完',
  daily: '可继续使用，注意效果',
  clean: '可继续使用',
  cond: '注意密封保存',
  can: '密封保存可适当延长',
  drink: '建议尽快饮用',
  other: '请按说明使用',
};

const suggestion = computed(() => {
  if (status.value === 'urgent') return SUGGESTIONS[props.item.category] || SUGGESTIONS.other;
  if (status.value === 'expired') return '建议丢弃，请勿食用';
  return '';
});
</script>

<style scoped>
.expiry-card {
  position: relative;
  width: 100%;
  display: block;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 12px 12px 12px 16px;
  text-align: left;
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.edge {
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 4px;
  border-radius: var(--radius-pill);
}

.edge-urgent {
  background: var(--color-danger);
}
.edge-warning {
  background: var(--color-warning);
}
.edge-info {
  background: var(--color-info);
}
.edge-fresh {
  background: var(--color-success);
}
.edge-expired {
  background: var(--color-text-muted);
}

.content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  flex-shrink: 0;
}

.middle {
  flex: 1;
  min-width: 0;
}

.name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text);
  margin-top: 2px;
}

.hint {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.dot-sep {
  color: var(--color-text-muted);
}

.right {
  text-align: right;
  flex-shrink: 0;
}

.big-days {
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.v-urgent .big-days {
  color: var(--color-danger);
}
.v-warning .big-days {
  color: var(--color-warning);
}
.v-info .big-days {
  color: var(--color-info);
}
.v-expired .big-days {
  color: var(--color-text-muted);
}
.v-fresh .big-days {
  color: var(--color-success);
}

.small-label {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

.date {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

.v-expired {
  opacity: 0.85;
}
</style>
