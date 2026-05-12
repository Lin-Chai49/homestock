<template>
  <div>
    <AppBar title="数据分析" subtitle="6 个月家庭物资管理洞察" icon="📊" back />
    <div class="app-container">
      <section class="grid grid-stats">
        <StatCard variant="primary" icon="💰" label="6 月总支出" :value="formatMoney(totalSpend)" />
        <StatCard variant="danger" icon="💸" label="浪费金额" :value="formatMoney(waste.amount)" :hint="`占比 ${wastePctText}`" />
        <StatCard variant="success" icon="🔁" label="物资周转率" :value="turnoverText" />
        <StatCard variant="info" icon="🏆" label="效率评分" :value="grade" />
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">📈 近 6 个月支出趋势</h2></div>
        <EmptyState v-if="monthly.length === 0 || allZero" icon="📭" title="尚无支出记录" />
        <LineChart v-else :data="monthlySeries" :y-label="'¥'" :height="240" />
        <div v-if="!allZero" class="hi-lo">
          <span>最高：{{ hiMonth.x }}（{{ formatMoney(hiMonth.y) }}）</span>
          <span class="text-muted">最低：{{ loMonth.x }}（{{ formatMoney(loMonth.y) }}）</span>
        </div>
      </section>

      <section class="grid grid-mid">
        <div class="card">
          <div class="card-header"><h2 class="card-title">🥧 支出分类占比</h2></div>
          <EmptyState v-if="byCategorySeries.length === 0" icon="📭" title="本月无数据" />
          <DoughnutChart
            v-else
            :data="byCategorySeries"
            :height="260"
            center-label="本月支出"
            :center-value="formatMoney(currentMonthSpend)"
          />
        </div>
        <div class="card">
          <div class="card-header"><h2 class="card-title">🏆 购买频率 Top 10</h2></div>
          <EmptyState v-if="freqTop.length === 0" icon="📭" title="尚无购买记录" />
          <ol v-else class="freq-list">
            <li v-for="(row, i) in freqTop" :key="row.name">
              <span class="freq-rank">{{ i + 1 }}</span>
              <span class="freq-name">{{ row.name }}</span>
              <span class="text-muted small">{{ row.count }} 次</span>
              <span class="strong">{{ formatMoney(row.total) }}</span>
            </li>
          </ol>
        </div>
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">📊 浪费分析（近 6 个月）</h2></div>
        <div class="grid three-cols">
          <div v-for="(r, k) in wasteByCategory" :key="k" class="waste-card">
            <div class="waste-pct">{{ formatMoney(r.amount) }}</div>
            <div class="waste-label">{{ r.label }} · {{ Math.round(r.percent * 100) }}%</div>
            <ul class="waste-hints">
              <li v-for="(h, i) in r.hints" :key="i">{{ h }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section class="achievement">
        <div class="achv-text">
          <div class="achv-title">🎉 您是高效家庭！</div>
          <div class="achv-sub">
            本月浪费率 {{ wastePctText }}，远低于全国平均 18%。继续保持！
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
import LineChart from '@/components/charts/LineChart.vue';
import DoughnutChart from '@/components/charts/DoughnutChart.vue';
import { useItemsStore } from '@/stores/items.js';
import { useConsumptionsStore } from '@/stores/consumptions.js';
import {
  calculateWaste,
  wasteRate,
  efficiencyGrade,
  spendByCategoryByMonth,
} from '@/services/algorithmService.js';
import { formatMoney, formatPercent } from '@/utils/format.js';
import { categoryName } from '@/constants/categories.js';
import dayjs from 'dayjs';

const items = useItemsStore();
const consumptions = useConsumptionsStore();

const breakdown = computed(() => spendByCategoryByMonth(items.list, 6));

const totalSpend = computed(() => breakdown.value.monthly.reduce((acc, m) => acc + m.total, 0));

const waste = computed(() => calculateWaste(items.list, { sinceDays: 180 }));

const wastePct = computed(() => wasteRate(items.list, { sinceDays: 180 }));
const wastePctText = computed(() => formatPercent(wastePct.value, 1));

const turnoverText = computed(() => {
  const active = items.active.length || 1;
  const consumed = items.list.filter((i) => i.status === 'consumed').length;
  return formatPercent(consumed / (consumed + active), 0);
});

const grade = computed(() => efficiencyGrade(wastePct.value));

const monthly = computed(() => breakdown.value.monthly);

const allZero = computed(() => monthly.value.every((m) => m.total === 0));

const monthlySeries = computed(() =>
  monthly.value.map((m) => ({ x: dayjs(m.month + '-01').format('M月'), y: Math.round(m.total) })),
);

const hiMonth = computed(() => {
  let hi = monthlySeries.value[0];
  for (const p of monthlySeries.value) if (p.y > (hi?.y || 0)) hi = p;
  return hi || { x: '—', y: 0 };
});
const loMonth = computed(() => {
  let lo = monthlySeries.value[0];
  for (const p of monthlySeries.value) if (p.y < (lo?.y || Infinity)) lo = p;
  return lo || { x: '—', y: 0 };
});

const currentMonthSpend = computed(() => {
  const current = monthly.value[monthly.value.length - 1];
  return current ? current.total : 0;
});

const byCategorySeries = computed(() => {
  const palette = ['#FF6B35', '#FFC857', '#7FB069', '#3D7EC9', '#C44569', '#A4D7A6', '#E54B4B', '#A89888'];
  return breakdown.value.byCategory
    .filter((b) => b.total > 0)
    .sort((a, b) => b.total - a.total)
    .map((b, i) => ({
      name: categoryName(b.category),
      value: Math.round(b.total),
      color: palette[i % palette.length],
    }));
});

const freqTop = computed(() => {
  const map = new Map();
  for (const it of items.list) {
    const key = it.name;
    const cur = map.get(key) || { name: key, count: 0, total: 0 };
    cur.count += 1;
    cur.total += Number(it.price || 0);
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 10);
});

const wasteByCategory = computed(() => {
  const expired = items.list.filter((i) => i.status === 'expired');
  const totalWaste = expired.reduce((acc, i) => acc + Number(i.price || 0), 0) || 1;
  const groups = new Map();
  for (const it of expired) {
    const grp = ['food', 'cond', 'can'].includes(it.category)
      ? 'food'
      : ['drug'].includes(it.category)
        ? 'drug'
        : 'other';
    const cur = groups.get(grp) || { label: '', amount: 0, hints: [] };
    cur.amount += Number(it.price || 0);
    groups.set(grp, cur);
  }
  const labels = { food: '食品浪费', drug: '药品浪费', other: '清洁/化妆品' };
  const hintMap = {
    food: ['蔬菜买太多没用完', '乳制品过期未发现', '水果保存不当'],
    drug: ['感冒药未及时使用', '维生素片忘记服用', '处方药剂量过多'],
    other: ['化妆品开封过期', '清洁剂使用周期长', '试用装未及时用'],
  };
  return Object.entries(labels).reduce((acc, [k, label]) => {
    const g = groups.get(k) || { amount: 0 };
    acc[k] = {
      label,
      amount: g.amount,
      percent: g.amount / totalWaste,
      hints: hintMap[k],
    };
    return acc;
  }, {});
});

onMounted(async () => {
  await Promise.all([items.loadAll(), consumptions.loadAll()]);
});
</script>

<style scoped>
.card {
  margin-bottom: 16px;
}
.hi-lo {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-top: 8px;
  color: var(--color-text);
}
.grid-mid {
  grid-template-columns: 1fr;
}
@media (min-width: 540px) {
  .grid-mid {
    grid-template-columns: 1fr 1fr;
  }
}
.freq-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.freq-list li {
  display: grid;
  grid-template-columns: 22px 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid var(--color-divider);
  font-size: 13px;
}
.freq-rank {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.three-cols {
  grid-template-columns: 1fr;
  gap: 8px;
}
@media (min-width: 540px) {
  .three-cols {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
.waste-card {
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}
.waste-pct {
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-strong);
}
.waste-label {
  font-size: 12px;
  color: var(--color-text);
  margin-top: 2px;
  margin-bottom: 8px;
}
.waste-hints {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.waste-hints li {
  font-size: 11px;
  color: var(--color-text-muted);
  padding-left: 12px;
  position: relative;
}
.waste-hints li::before {
  content: '·';
  position: absolute;
  left: 4px;
  color: var(--color-primary);
}
.achievement {
  margin-top: 16px;
  padding: 18px 16px;
  background: var(--gradient-primary);
  color: var(--color-text-on-primary);
  border-radius: var(--radius-lg);
  text-align: center;
  box-shadow: var(--shadow-primary);
}
.achv-title {
  font-size: 18px;
  font-weight: 700;
}
.achv-sub {
  font-size: 13px;
  margin-top: 4px;
  opacity: 0.9;
}
.strong {
  font-weight: 600;
}
.small {
  font-size: 11px;
}
</style>
