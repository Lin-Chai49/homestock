<template>
  <div>
    <AppBar title="临期预警" subtitle="按紧急度排序，优先消耗" icon="🔔" />
    <div class="app-container">
      <section class="grid grid-stats">
        <StatCard variant="danger" icon="⚠️" label="2 天内过期" :value="counts.urgent" unit="件" />
        <StatCard variant="warning" icon="⏰" label="7 天内过期" :value="counts.warning" unit="件" />
        <StatCard variant="info" icon="📅" label="30 天内过期" :value="counts.info" unit="件" />
        <StatCard variant="success" icon="💰" label="本月已避免浪费" :value="savedFormatted" />
      </section>

      <section class="card">
        <div class="card-header">
          <h2 class="card-title">⏰ 临期物品 ({{ expiring.length }})</h2>
          <span class="text-muted small">按紧急度排序</span>
        </div>
        <EmptyState
          v-if="expiring.length === 0"
          icon="🎉"
          title="没有临期物品"
          hint="您的家庭物资管理得很好。"
        />
        <div v-else class="vstack">
          <ExpiryCard v-for="it in expiring" :key="it.id" :item="it" @click="onCardClick" />
        </div>
      </section>

      <section class="grid grid-mid">
        <div class="card">
          <div class="card-header"><h2 class="card-title">💡 临期食品妙用</h2></div>
          <ul class="hints">
            <li v-for="(tip, i) in tips" :key="i">{{ tip }}</li>
          </ul>
        </div>

        <div class="card">
          <div class="card-header"><h2 class="card-title">📊 临期处理统计</h2></div>
          <BarChart :data="handlingStats" :height="180" />
          <div class="info-banner">
            ✓ 浪费率仅 {{ wastePct }}%，远低于全国平均 18%
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
import BarChart from '@/components/charts/BarChart.vue';
import { useItemsStore } from '@/stores/items.js';
import { useConsumptionsStore } from '@/stores/consumptions.js';
import { formatMoney, formatPercent } from '@/utils/format.js';
import { wasteRate } from '@/services/algorithmService.js';
import dayjs from 'dayjs';

const items = useItemsStore();
const consumptions = useConsumptionsStore();
const router = useRouter();

const expiring = computed(() =>
  items.active
    .filter((i) => ['urgent', 'warning', 'info', 'expired'].includes(i.expiryStatus))
    .sort((a, b) => (a.daysUntilExpiry ?? 9999) - (b.daysUntilExpiry ?? 9999)),
);

const counts = computed(() => {
  const c = { urgent: 0, warning: 0, info: 0 };
  for (const it of expiring.value) {
    if (it.expiryStatus === 'urgent') c.urgent++;
    else if (it.expiryStatus === 'warning') c.warning++;
    else if (it.expiryStatus === 'info') c.info++;
  }
  return c;
});

const savedThisMonth = computed(() => {
  const monthStart = dayjs().startOf('month').valueOf();
  return consumptions.list
    .filter((c) => c.timestamp >= monthStart)
    .reduce((acc, c) => {
      const item = items.list.find((i) => i.id === c.itemId);
      if (!item) return acc;
      const unitPrice = (item.price || 0) / Math.max(item.fullStock || item.quantity || 1, 1);
      return acc + unitPrice * Math.abs(c.amount || 0);
    }, 0);
});

const savedFormatted = computed(() => formatMoney(savedThisMonth.value));

const tips = [
  '🥛 临期牛奶：可制作奶昔、酸奶或燕麦粥',
  '🍞 临期面包：切片冷冻、烤面包屑、或做面包布丁',
  '🍎 临期水果：榨汁、做果酱、或冷冻保存',
  '🥚 临期鸡蛋：尽量当日食用，可做蒸蛋、烘焙',
  '🧀 临期奶酪：火锅、披萨、焗饭都是不错选择',
];

const handlingStats = computed(() => [
  { x: '已消费', y: 85, color: '#7FB069' },
  { x: '待处理', y: 10, color: '#FFC857' },
  { x: '分享', y: 3, color: '#3D7EC9' },
  { x: '浪费', y: 2, color: '#E54B4B' },
]);

const wastePct = computed(() => formatPercent(wasteRate(items.list, { sinceDays: 180 }), 1));

function onCardClick(item) {
  router.push({ path: '/items', query: { itemId: item.id } });
}

onMounted(async () => {
  await Promise.all([items.loadAll(), consumptions.loadAll()]);
});
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

.hints {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text);
}

.info-banner {
  margin-top: 12px;
  padding: 10px 12px;
  background: var(--color-success-soft);
  color: var(--color-success);
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.grid-mid {
  grid-template-columns: 1fr;
  gap: 12px;
}

@media (min-width: 540px) {
  .grid-mid {
    grid-template-columns: 1fr 1fr;
  }
}

.small {
  font-size: 11px;
}
</style>
