<template>
  <div>
    <AppBar title="已过期" subtitle="已过期物资分析与处理建议" icon="⚠️" back />
    <div class="app-container">
      <section class="grid grid-stats">
        <StatCard variant="danger" icon="⚠️" label="已过期总数" :value="stats.count" unit="件" />
        <StatCard variant="warning" icon="⏰" label="最久过期" :value="stats.maxDays" unit="天" />
        <StatCard variant="primary" icon="💸" label="浪费金额" :value="stats.wasteMoney" />
        <StatCard variant="info" icon="📊" label="浪费率" :value="stats.wastePct" />
      </section>

      <div class="warn-banner">
        💡 已过期食品/药品请勿食用，建议按当地分类垃圾处理方法妥善处置。
      </div>

      <section class="card">
        <div class="card-header">
          <h2 class="card-title">已过期物品清单 ({{ expired.length }})</h2>
        </div>
        <EmptyState v-if="expired.length === 0" icon="✨" title="没有已过期物品" />
        <div v-else class="vstack">
          <ExpiryCard v-for="it in expired" :key="it.id" :item="it" @click="onClick" />
        </div>
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">📊 浪费原因分析</h2></div>
        <div class="grid three-cols">
          <div v-for="r in reasons" :key="r.key" class="reason" :class="r.key">
            <div class="reason-pct">{{ Math.round(r.percent * 100) }}%</div>
            <div class="reason-label">{{ r.label }}</div>
            <p class="reason-hint">{{ r.hint }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppBar from '@/components/layout/AppBar.vue';
import StatCard from '@/components/StatCard.vue';
import ExpiryCard from '@/components/ExpiryCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useItemsStore } from '@/stores/items.js';
import { calculateWaste, wasteRate, wasteReasons } from '@/services/algorithmService.js';
import { formatMoney, formatPercent } from '@/utils/format.js';
import { daysUntilExpiry } from '@/services/dateService.js';

const items = useItemsStore();
const router = useRouter();

const expired = computed(() =>
  items.list.filter(
    (i) => i.status === 'expired' || daysUntilExpiry(i.expiryDate) < 0,
  ),
);

const stats = computed(() => {
  const waste = calculateWaste(expired.value);
  const maxDays = expired.value.reduce(
    (acc, it) => Math.max(acc, Math.abs(daysUntilExpiry(it.expiryDate) || 0)),
    0,
  );
  return {
    count: expired.value.length,
    maxDays,
    wasteMoney: formatMoney(waste.amount),
    wastePct: formatPercent(wasteRate(items.list, { sinceDays: 180 }), 1),
  };
});

const REASON_HINTS = {
  forgotten: '建议在显眼位置贴上效期标签，或使用本应用的临期提醒',
  overbought: '入库时合理估算消耗速度，避免一次购买过多',
  taste: '常备的口味/品牌优先囤货，新口味少量试买',
};

const reasons = computed(() =>
  wasteReasons(expired.value).map((r) => ({ ...r, hint: REASON_HINTS[r.key] })),
);

function onClick(item) {
  router.push({ path: '/items', query: { itemId: item.id } });
}

onMounted(() => items.loadAll());
</script>

<style scoped>
.card {
  margin-bottom: 16px;
}
.vstack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.warn-banner {
  background: var(--color-warning-soft);
  color: var(--color-warning);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 13px;
  margin: 12px 0;
  font-weight: 600;
}
.three-cols {
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.reason {
  padding: 12px 8px;
  border-radius: var(--radius-md);
  text-align: center;
  background: var(--color-surface-2);
}
.reason.forgotten {
  background: var(--color-warning-soft);
}
.reason.overbought {
  background: var(--color-danger-soft);
}
.reason.taste {
  background: var(--color-success-soft);
}
.reason-pct {
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-strong);
}
.reason.forgotten .reason-pct {
  color: var(--color-warning);
}
.reason.overbought .reason-pct {
  color: var(--color-danger);
}
.reason.taste .reason-pct {
  color: var(--color-success);
}
.reason-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text);
  margin-top: 2px;
}
.reason-hint {
  font-size: 10px;
  color: var(--color-text-muted);
  margin-top: 6px;
  line-height: 1.4;
}
</style>
