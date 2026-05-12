<template>
  <div>
    <AppBar :title="greeting" :subtitle="subtitle" icon="🏡" />
    <div class="app-container">
      <section class="grid grid-stats">
        <StatCard
          variant="primary"
          icon="📦"
          label="家庭物资总数"
          :value="totals.total"
          unit="件"
        />
        <StatCard variant="warning" icon="⏰" label="临期物品" :value="totals.expiring" unit="件" />
        <StatCard variant="danger" icon="⚠️" label="库存不足" :value="totals.lowStock" unit="件" />
        <StatCard
          variant="success"
          icon="💰"
          label="本月节约"
          :value="savedThisMonth"
        />
      </section>

      <section class="section">
        <div class="card-header">
          <h2 class="card-title">🗂️ 分类快捷查看</h2>
          <RouterLink to="/items" class="text-muted small-link">查看全部 ›</RouterLink>
        </div>
        <div class="grid grid-cats">
          <RouterLink
            v-for="cat in categories.enabled"
            :key="cat.key"
            :to="{ path: '/items', query: { cat: cat.key } }"
            class="cat-cell"
            :style="{ background: `${cat.color}1a` }"
          >
            <div class="cat-icon" :style="{ background: cat.color }">{{ cat.icon }}</div>
            <div class="cat-name">{{ cat.name }}</div>
            <div class="cat-num">{{ categoryCounts.get(cat.key) || 0 }}</div>
          </RouterLink>
        </div>
      </section>

      <section class="section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">⏰ 临期物品提醒</h2>
            <RouterLink to="/expiry" class="text-muted small-link">全部 ›</RouterLink>
          </div>
          <EmptyState
            v-if="topExpiring.length === 0"
            icon="🎉"
            title="没有临期物品"
            hint="您的家庭物资管理得很好。"
          />
          <div v-else class="vstack">
            <ExpiryCard
              v-for="it in topExpiring"
              :key="it.id"
              :item="it"
              @click="onItemClick"
            />
          </div>
        </div>
      </section>

      <section class="section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📉 库存不足</h2>
            <RouterLink to="/stock" class="text-muted small-link">查看追踪 ›</RouterLink>
          </div>
          <EmptyState
            v-if="topLowStock.length === 0"
            icon="✅"
            title="所有物品库存充足"
          />
          <div v-else class="vstack">
            <div v-for="it in topLowStock" :key="it.id" class="low-row">
              <div class="low-icon">{{ it.icon || categoryIcon(it.category) }}</div>
              <div class="low-name">
                <div class="row-between">
                  <span class="strong">{{ it.name }}</span>
                  <span class="text-muted small">剩 {{ it.quantity }} {{ it.unit }}</span>
                </div>
                <div class="low-track">
                  <div class="low-fill" :style="{ width: it.stockRatio * 100 + '%' }" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="grid grid-mid">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📊 本月消耗 Top 5</h2>
          </div>
          <EmptyState v-if="topConsumed.length === 0" icon="📭" title="本月暂无消耗记录" />
          <BarChart v-else :data="topConsumed" :height="200" />
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📍 存放位置分布</h2>
          </div>
          <EmptyState
            v-if="locationDistribution.length === 0"
            icon="📦"
            title="尚无物品"
          />
          <DoughnutChart
            v-else
            :data="locationDistribution"
            :height="220"
            center-label="总数"
            :center-value="String(totals.total)"
          />
        </div>
      </section>

      <section class="section">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">📅 近期动态</h2>
          </div>
          <EmptyState
            v-if="recentActivity.length === 0"
            icon="📭"
            title="尚无动态记录"
          />
          <ul v-else class="timeline">
            <li v-for="(ev, i) in recentActivity" :key="i" class="timeline-row">
              <span class="dot" />
              <div>
                <div class="text-strong">{{ ev.title }}</div>
                <div class="text-muted small">{{ ev.time }}</div>
              </div>
            </li>
          </ul>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRouter, RouterLink } from 'vue-router';
import AppBar from '@/components/layout/AppBar.vue';
import StatCard from '@/components/StatCard.vue';
import ExpiryCard from '@/components/ExpiryCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import BarChart from '@/components/charts/BarChart.vue';
import DoughnutChart from '@/components/charts/DoughnutChart.vue';
import { useItemsStore } from '@/stores/items.js';
import { useCategoriesStore } from '@/stores/categories.js';
import { useLocationsStore } from '@/stores/locations.js';
import { useConsumptionsStore } from '@/stores/consumptions.js';
import { useSettingsStore } from '@/stores/settings.js';
import { categoryIcon, categoryName } from '@/constants/categories.js';
import { locationName } from '@/constants/locations.js';
import { formatMoney } from '@/utils/format.js';
import { formatRelativeExpiry } from '@/services/dateService.js';
import dayjs from 'dayjs';

const router = useRouter();
const items = useItemsStore();
const categories = useCategoriesStore();
const locations = useLocationsStore();
const consumptions = useConsumptionsStore();
const settings = useSettingsStore();

const { active, expiringSoon, lowStock } = storeToRefs(items);

const totals = computed(() => items.totals());

const greeting = computed(() => {
  const h = new Date().getHours();
  const name = settings.data.nickname || '欢迎';
  if (h < 6) return `${name}，深夜了，注意休息`;
  if (h < 12) return `早上好，${name}`;
  if (h < 18) return `下午好，${name}`;
  return `晚上好，${name}`;
});

const subtitle = computed(() => dayjs().format('YYYY 年 M 月 D 日 · 库存总览'));

const categoryCounts = computed(() => {
  const map = new Map();
  for (const it of active.value) {
    map.set(it.category, (map.get(it.category) || 0) + 1);
  }
  return map;
});

const topExpiring = computed(() => expiringSoon.value.slice(0, 4));
const topLowStock = computed(() => lowStock.value.slice(0, 4));

const savedThisMonth = computed(() => {
  const monthStart = dayjs().startOf('month').valueOf();
  const saved = consumptions.list
    .filter((c) => c.timestamp >= monthStart)
    .reduce((acc, c) => {
      const item = items.list.find((i) => i.id === c.itemId);
      if (!item) return acc;
      const unitPrice = (item.price || 0) / Math.max(item.fullStock || item.quantity || 1, 1);
      return acc + unitPrice * Math.abs(c.amount || 0);
    }, 0);
  return formatMoney(saved);
});

const topConsumed = computed(() => {
  const top = consumptions.topN(items.list, 5);
  return top.map((t) => ({ x: t.itemName.slice(0, 6), y: t.count, color: '#FF6B35' }));
});

const locationDistribution = computed(() => {
  const counts = items.locationCounts();
  return [...counts.entries()]
    .map(([id, count]) => ({
      name: locationName(id),
      value: count,
      color: locations.byId(id)?.color,
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
});

const recentActivity = computed(() => {
  const events = [];
  // Recent additions
  const recent = [...active.value].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 3);
  for (const it of recent) {
    events.push({
      title: `新入库：${it.name}（${it.quantity} ${it.unit}） · ${categoryName(it.category)}`,
      time: dayjs(it.createdAt).fromNow ? dayjs(it.createdAt).format('MM-DD HH:mm') : dayjs(it.createdAt).format('MM-DD'),
    });
  }
  for (const it of expiringSoon.value.slice(0, 2)) {
    events.push({
      title: `${it.name} ${formatRelativeExpiry(it.expiryDate)}`,
      time: '临期提醒',
    });
  }
  return events;
});

function onItemClick(item) {
  router.push({ path: '/items', query: { itemId: item.id } });
}

const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    await Promise.all([
      categories.loadAll(),
      locations.loadAll(),
      items.loadAll(),
      consumptions.loadAll(),
    ]);
    await items.markExpiredItems();
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.small-link {
  font-size: 12px;
}
.small {
  font-size: 11px;
}
.section {
  margin-top: 16px;
}

.grid-mid {
  grid-template-columns: 1fr;
}

@media (min-width: 540px) {
  .grid-mid {
    grid-template-columns: 1fr 1fr;
  }
}

.cat-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: var(--radius-md);
  text-align: center;
  transition: transform 0.15s ease;
}
.cat-cell:active {
  transform: scale(0.96);
}
.cat-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
}
.cat-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text);
}
.cat-num {
  font-size: 11px;
  color: var(--color-text-muted);
  font-weight: 700;
}

.vstack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.low-row {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  align-items: center;
}
.low-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}
.low-name {
  flex: 1;
  min-width: 0;
}
.strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.low-track {
  height: 6px;
  background: var(--color-divider);
  border-radius: var(--radius-pill);
  overflow: hidden;
  margin-top: 4px;
}
.low-fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width 0.4s ease;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.timeline-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
}
.timeline-row .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  margin-top: 5px;
  flex-shrink: 0;
}
</style>
