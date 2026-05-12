<template>
  <div>
    <AppBar title="存放位置" subtitle="家庭 12 个常用位置全景管理" icon="📍" back />
    <div class="app-container">
      <section class="grid grid-stats">
        <StatCard variant="primary" icon="🏠" label="存放位置" :value="locations.list.length" unit="处" />
        <StatCard variant="info" icon="📦" label="物品总数" :value="items.active.length" unit="件" />
        <StatCard variant="warning" icon="⏰" label="临期分布" :value="expiringCount" unit="件" />
        <StatCard variant="success" icon="⭐" label="最常用" :value="mostUsed.name" />
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">📍 家庭存放位置概览</h2></div>
        <div class="grid grid-locations">
          <LocationCard
            v-for="loc in locationsWithCounts"
            :key="loc.id"
            :location="loc"
            @click="selectLoc"
          />
        </div>
      </section>

      <section v-if="selected" class="card">
        <div class="card-header">
          <h2 class="card-title">{{ selected.icon }} {{ selected.name }} · {{ selected.itemCount }} 件</h2>
          <button class="icon-btn" @click="selected = null">×</button>
        </div>
        <EmptyState
          v-if="selectedItems.length === 0"
          icon="📭"
          title="此位置暂无物品"
        />
        <div v-else class="loc-detail-list">
          <div v-for="it in selectedItems" :key="it.id" class="loc-row">
            <span class="loc-row-icon">{{ it.icon || '📦' }}</span>
            <div class="loc-row-body">
              <div class="row-between">
                <span class="strong">{{ it.name }}</span>
                <StatusBadge v-if="it.expiryStatus" :status="it.expiryStatus" />
              </div>
              <div class="text-muted small">{{ it.quantity }} {{ it.unit }} · {{ it.expiryDate }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">💡 位置使用建议</h2></div>
        <div class="grid two-cols">
          <div v-for="r in usage" :key="r.id" class="usage-card" :class="r.tone">
            <div class="row-between">
              <span class="strong">{{ r.icon }} {{ r.name }}</span>
              <span class="text-muted small">{{ r.count }} 件</span>
            </div>
            <div class="usage-track">
              <div class="usage-fill" :style="{ width: r.percent + '%', background: r.color }" />
            </div>
            <p class="usage-hint">{{ r.hint }}</p>
          </div>
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
import LocationCard from '@/components/LocationCard.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import { useItemsStore } from '@/stores/items.js';
import { useLocationsStore } from '@/stores/locations.js';

const items = useItemsStore();
const locations = useLocationsStore();

const selected = ref(null);

const locationsWithCounts = computed(() => locations.withCounts(items.active));

const expiringCount = computed(() => items.expiringSoon.length);

const mostUsed = computed(() => {
  const withC = locationsWithCounts.value;
  if (withC.length === 0) return { name: '—' };
  const top = [...withC].sort((a, b) => b.itemCount - a.itemCount)[0];
  return { name: `${top.icon} ${top.name.slice(-3)}` };
});

const selectedItems = computed(() =>
  selected.value ? items.active.filter((i) => i.locationId === selected.value.id) : [],
);

function selectLoc(loc) {
  selected.value = loc;
  setTimeout(() => window.scrollTo({ top: window.scrollY + 200, behavior: 'smooth' }), 50);
}

const usage = computed(() => {
  const max = Math.max(...locationsWithCounts.value.map((l) => l.itemCount), 1);
  return locationsWithCounts.value
    .filter((l) => l.itemCount > 0)
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 4)
    .map((l) => {
      const percent = Math.min(100, (l.itemCount / max) * 100);
      let tone = 'cool';
      let hint = '使用合理';
      if (percent > 85) {
        tone = 'warm';
        hint = '占用紧张，建议整理';
      } else if (percent > 60) {
        tone = 'mid';
        hint = '使用良好';
      } else {
        hint = '空间充足';
      }
      return { ...l, percent, tone, hint, color: l.color || 'var(--color-primary)' };
    });
});

onMounted(async () => {
  await Promise.all([items.loadAll(), locations.loadAll()]);
});
</script>

<style scoped>
.card {
  margin-bottom: 16px;
}
.loc-detail-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.loc-row {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 8px;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}
.loc-row-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.loc-row-body {
  flex: 1;
  min-width: 0;
}
.strong {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-strong);
}
.small {
  font-size: 11px;
}
.two-cols {
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.usage-card {
  padding: 10px;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
}
.usage-card.warm {
  background: var(--color-danger-soft);
}
.usage-card.mid {
  background: var(--color-warning-soft);
}
.usage-card.cool {
  background: var(--color-success-soft);
}
.usage-track {
  height: 6px;
  background: rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-pill);
  margin: 6px 0;
  overflow: hidden;
}
.usage-fill {
  height: 100%;
  transition: width 0.4s ease;
}
.usage-hint {
  font-size: 11px;
  color: var(--color-text-muted);
}
.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-surface-2);
  color: var(--color-text);
  font-size: 18px;
}
</style>
