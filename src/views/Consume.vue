<template>
  <div>
    <AppBar title="消耗记录" subtitle="每日物品消耗事件追踪" icon="📝" back />
    <div class="app-container">
      <section class="grid grid-stats">
        <StatCard variant="primary" icon="📝" label="本月记录" :value="thisMonth.length" unit="条" />
        <StatCard variant="info" icon="📦" label="本月品种" :value="varietyCount" unit="类" />
        <StatCard variant="warning" icon="📊" label="日均消耗" :value="dailyAvg" unit="条" />
        <StatCard variant="success" icon="💸" label="日均金额" :value="formatMoney(dailyMoney)" />
      </section>

      <section class="card">
        <div class="card-header">
          <h2 class="card-title">🔍 筛选</h2>
        </div>
        <div class="filter-grid">
          <input v-model="search" class="input" placeholder="物品名称…" />
          <select v-model="filterCat" class="select">
            <option value="all">全部类别</option>
            <option v-for="c in categories.enabled" :key="c.key" :value="c.key">
              {{ c.icon }} {{ c.name }}
            </option>
          </select>
          <select v-model="filterScene" class="select">
            <option value="all">全部场景</option>
            <option v-for="s in CONSUMPTION_SCENES" :key="s.key" :value="s.key">
              {{ s.icon }} {{ s.name }}
            </option>
          </select>
        </div>
      </section>

      <section class="card">
        <div class="card-header">
          <h2 class="card-title">📋 记录列表 ({{ filtered.length }})</h2>
        </div>
        <EmptyState v-if="filtered.length === 0" icon="📭" title="没有匹配的记录" />
        <div v-else class="consume-list">
          <div v-for="c in filtered" :key="c.id" class="consume-row">
            <span class="cons-icon">{{ iconFor(c.itemId) }}</span>
            <div class="cons-body">
              <div class="row-between">
                <span class="strong">{{ c.itemName }}</span>
                <span class="text-danger">{{ c.amount }}</span>
              </div>
              <div class="row text-muted small">
                <span>{{ formatDateTime(c.timestamp) }}</span>
                <span>·</span>
                <span class="badge badge-info">{{ sceneName(c.scene) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid grid-mid">
        <div class="card">
          <div class="card-header"><h2 class="card-title">⏰ 每日消耗时段分布</h2></div>
          <BarChart :data="timeBins" :height="200" />
        </div>
        <div class="card">
          <div class="card-header"><h2 class="card-title">🏆 本月最常消耗 Top 5</h2></div>
          <EmptyState v-if="topItems.length === 0" icon="📭" title="尚无消耗记录" />
          <BarChart v-else :data="topItems" :height="200" horizontal />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import AppBar from '@/components/layout/AppBar.vue';
import StatCard from '@/components/StatCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import BarChart from '@/components/charts/BarChart.vue';
import { useConsumptionsStore } from '@/stores/consumptions.js';
import { useItemsStore } from '@/stores/items.js';
import { useCategoriesStore } from '@/stores/categories.js';
import { categoryIcon } from '@/constants/categories.js';
import { CONSUMPTION_SCENES } from '@/constants/thresholds.js';
import { formatDateTime, formatMoney } from '@/utils/format.js';
import dayjs from 'dayjs';

const consumptions = useConsumptionsStore();
const items = useItemsStore();
const categories = useCategoriesStore();

const search = ref('');
const filterCat = ref('all');
const filterScene = ref('all');

const thisMonth = computed(() => {
  const start = dayjs().startOf('month').valueOf();
  return consumptions.list.filter((c) => c.timestamp >= start);
});

const filtered = computed(() => {
  let list = [...consumptions.list];
  const q = search.value.trim().toLowerCase();
  if (q) list = list.filter((c) => c.itemName.toLowerCase().includes(q));
  if (filterCat.value !== 'all') {
    const itemMap = new Map(items.list.map((i) => [i.id, i.category]));
    list = list.filter((c) => itemMap.get(c.itemId) === filterCat.value);
  }
  if (filterScene.value !== 'all') {
    list = list.filter((c) => c.scene === filterScene.value);
  }
  return list.sort((a, b) => b.timestamp - a.timestamp).slice(0, 30);
});

const varietyCount = computed(() => new Set(thisMonth.value.map((c) => c.itemId)).size);

const dailyAvg = computed(() => {
  const dayInMonth = dayjs().date();
  return Math.round((thisMonth.value.length / dayInMonth) * 10) / 10;
});

const dailyMoney = computed(() => {
  const dayInMonth = dayjs().date();
  const total = thisMonth.value.reduce((acc, c) => {
    const item = items.list.find((i) => i.id === c.itemId);
    if (!item) return acc;
    const unit = (item.price || 0) / Math.max(item.fullStock || item.quantity || 1, 1);
    return acc + unit * Math.abs(c.amount || 0);
  }, 0);
  return total / dayInMonth;
});

const timeBins = computed(() => {
  const bins = consumptions.timeOfDayDistribution(thisMonth.value);
  return [
    { x: '早餐', y: bins.breakfast, color: '#FFC857' },
    { x: '上午', y: bins.morning, color: '#FF6B35' },
    { x: '午餐', y: bins.lunch, color: '#7FB069' },
    { x: '下午', y: bins.afternoon, color: '#3D7EC9' },
    { x: '晚餐', y: bins.dinner, color: '#C44569' },
    { x: '睡前', y: bins.night, color: '#A89888' },
  ];
});

const topItems = computed(() => {
  const top = consumptions.topN(items.list, 5);
  return top.map((t) => ({ x: t.itemName.slice(0, 8), y: t.count, color: '#FF6B35' }));
});

function iconFor(itemId) {
  const item = items.list.find((i) => i.id === itemId);
  if (item) return item.icon || categoryIcon(item.category);
  return '📦';
}

function sceneName(key) {
  const s = CONSUMPTION_SCENES.find((s) => s.key === key);
  return s ? `${s.icon} ${s.name}` : key;
}

onMounted(async () => {
  await Promise.all([items.loadAll(), categories.loadAll(), consumptions.loadAll()]);
});
</script>

<style scoped>
.card {
  margin-bottom: 16px;
}
.filter-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
@media (min-width: 540px) {
  .filter-grid {
    grid-template-columns: 2fr 1fr 1fr;
  }
}
.consume-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.consume-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
}
.cons-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.cons-body {
  flex: 1;
  min-width: 0;
}
.strong {
  font-weight: 600;
  color: var(--color-text-strong);
}
.small {
  font-size: 11px;
}
.grid-mid {
  grid-template-columns: 1fr;
}
@media (min-width: 540px) {
  .grid-mid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
