<template>
  <div>
    <AppBar title="库存追踪" subtitle="日常消耗品库存量与补货预测" icon="📈" back />
    <div class="app-container">
      <section class="grid grid-stats">
        <StatCard variant="primary" icon="📦" label="追踪物品" :value="totals.tracked" unit="件" />
        <StatCard variant="danger" icon="🚨" label="急需补货" :value="totals.critical" unit="件" />
        <StatCard variant="warning" icon="⏳" label="即将耗尽" :value="totals.warning" unit="件" />
        <StatCard variant="success" icon="✅" label="充足" :value="totals.ok" unit="件" />
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">📉 库存量可视化</h2></div>
        <EmptyState
          v-if="ringItems.length === 0"
          icon="📦"
          title="尚未追踪任何物品"
          hint="入库时设置最低库存即可开启自动追踪。"
          action-label="去入库"
          @action="$router.push('/add')"
        />
        <div v-else class="ring-grid">
          <div v-for="it in ringItems" :key="it.id" class="ring-cell">
            <ProgressRing
              :percent="it.stockRatio"
              :icon="it.icon"
              :label="Math.round(it.stockRatio * 100) + '%'"
              :size="92"
              :stroke="9"
            />
            <div class="ring-name">{{ it.name }}</div>
            <div class="ring-meta">
              <span :class="ratioClass(it.stockRatio)">{{ ratioLabel(it.stockRatio) }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">⏱️ 消耗速度预测</h2></div>
        <EmptyState v-if="speedData.length === 0" icon="⏱️" title="尚无消耗数据" />
        <BarChart v-else :data="speedData" :height="240" horizontal />
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">🛒 智能补货策略</h2></div>
        <div class="strategies">
          <div v-for="s in strategies" :key="s.title" class="strategy" :class="s.tone">
            <div class="row-between">
              <span class="strategy-title">{{ s.icon }} {{ s.title }}</span>
              <span class="badge" :class="`badge-${s.tone === 'warm' ? 'urgent' : s.tone === 'fresh' ? 'fresh' : s.tone === 'cool' ? 'info' : 'warning'}`">
                {{ s.tag }}
              </span>
            </div>
            <p class="strategy-desc">{{ s.desc }}</p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import AppBar from '@/components/layout/AppBar.vue';
import StatCard from '@/components/StatCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import ProgressRing from '@/components/ProgressRing.vue';
import BarChart from '@/components/charts/BarChart.vue';
import { useItemsStore } from '@/stores/items.js';
import { useConsumptionsStore } from '@/stores/consumptions.js';
import { predictDaysToEmpty } from '@/services/algorithmService.js';

const items = useItemsStore();
const consumptions = useConsumptionsStore();

const tracked = computed(() => items.active.filter((i) => i.minStock > 0 || i.fullStock > 0));

const ringItems = computed(() => [...tracked.value].sort((a, b) => a.stockRatio - b.stockRatio).slice(0, 8));

const totals = computed(() => {
  let critical = 0,
    warning = 0,
    ok = 0;
  for (const it of tracked.value) {
    if (it.stockRatio <= 0.2) critical++;
    else if (it.stockRatio <= 0.5) warning++;
    else ok++;
  }
  return { tracked: tracked.value.length, critical, warning, ok };
});

const speedData = computed(() => {
  const data = tracked.value
    .map((it) => {
      const cons = consumptions.list.filter((c) => c.itemId === it.id);
      const days = predictDaysToEmpty(it.quantity, cons);
      return { it, days };
    })
    .filter((x) => Number.isFinite(x.days))
    .sort((a, b) => a.days - b.days)
    .slice(0, 8)
    .map((x) => ({
      x: x.it.name.slice(0, 8),
      y: Math.round(x.days),
      color: x.days < 7 ? '#E54B4B' : x.days < 14 ? '#F5A742' : '#7FB069',
    }));
  return data;
});

const strategies = [
  {
    icon: '🔄',
    title: '周期性补货',
    tag: '每周',
    desc: '牛奶、面包、鸡蛋等高频消耗品按周固定补充',
    tone: 'warm',
  },
  {
    icon: '⚙️',
    title: '阈值触发',
    tag: '< 30%',
    desc: '库存低于 30% 自动加入购物清单',
    tone: 'cool',
  },
  {
    icon: '🍂',
    title: '季节性补货',
    tag: '换季',
    desc: '应季水果、调味品按月动态调整',
    tone: 'fresh',
  },
  {
    icon: '🎉',
    title: '节假日囤货',
    tag: '提前',
    desc: '春节、中秋等大节前一周适度增加常用物资',
    tone: 'warm',
  },
];

function ratioLabel(r) {
  if (r <= 0) return '已耗尽';
  if (r <= 0.2) return '急需补货';
  if (r <= 0.5) return '即将耗尽';
  return '充足';
}
function ratioClass(r) {
  if (r <= 0.2) return 'text-danger';
  if (r <= 0.5) return 'text-warning';
  return 'text-success';
}

onMounted(async () => {
  await Promise.all([items.loadAll(), consumptions.loadAll()]);
});
</script>

<style scoped>
.card {
  margin-bottom: 16px;
}

.ring-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (min-width: 540px) {
  .ring-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.ring-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.ring-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-strong);
  margin-top: 4px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ring-meta {
  font-size: 11px;
}

.strategies {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.strategy {
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}

.strategy.warm {
  background: var(--color-primary-soft);
}
.strategy.cool {
  background: var(--color-info-soft);
}
.strategy.fresh {
  background: var(--color-success-soft);
}

.strategy-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--color-text-strong);
}

.strategy-desc {
  font-size: 12px;
  color: var(--color-text);
  margin-top: 4px;
}
</style>
