<template>
  <div>
    <AppBar title="物资清单" subtitle="按类别 / 位置筛选浏览" icon="📋">
      <template #actions>
        <button
          class="icon-btn"
          :aria-label="'切换视图'"
          @click="viewMode = viewMode === 'grid' ? 'list' : 'grid'"
        >
          {{ viewMode === 'grid' ? '☰' : '▦' }}
        </button>
      </template>
    </AppBar>

    <div class="app-container">
      <CategoryTabs v-model="activeCat" :categories="categories.enabled" :counts="counts" />

      <div class="filter-row">
        <input v-model="search" class="input" placeholder="🔍 搜索物品名称…" />
        <select v-model="sortKey" class="select">
          <option v-for="s in SORT_OPTIONS" :key="s.key" :value="s.key">{{ s.name }}</option>
        </select>
      </div>

      <EmptyState
        v-if="filtered.length === 0"
        icon="📭"
        title="没有匹配的物品"
        hint="尝试切换类别或修改搜索词。"
        action-label="入库登记"
        @action="$router.push('/add')"
      />

      <div v-else-if="viewMode === 'grid'" class="grid grid-items">
        <ItemCard v-for="it in filtered" :key="it.id" :item="it" @click="openDetail" />
      </div>

      <div v-else class="list">
        <button
          v-for="it in filtered"
          :key="it.id"
          class="list-row"
          @click="openDetail(it)"
        >
          <div class="list-icon">{{ it.icon || categoryIcon(it.category) }}</div>
          <div class="list-body">
            <div class="row-between">
              <span class="strong">{{ it.name }}</span>
              <StatusBadge v-if="it.expiryStatus" :status="it.expiryStatus" />
            </div>
            <div class="row text-muted small">
              <span>{{ categoryName(it.category) }}</span>
              <span>·</span>
              <span>{{ locationName(it.locationId) }}</span>
              <span>·</span>
              <span>{{ it.quantity }} {{ it.unit }}</span>
            </div>
            <div class="text-muted small">{{ formatRelativeExpiry(it.expiryDate) }}</div>
          </div>
        </button>
      </div>
    </div>

    <Teleport to="body">
      <transition name="sheet">
        <div v-if="detailItem" class="sheet-overlay" @click.self="closeDetail">
          <div class="sheet" role="dialog" :aria-label="`${detailItem.name} 详情`">
            <header class="sheet-header">
              <div class="sheet-icon">{{ detailItem.icon || categoryIcon(detailItem.category) }}</div>
              <div class="sheet-title-block">
                <h2>{{ detailItem.name }}</h2>
                <p class="text-muted">
                  {{ categoryName(detailItem.category) }} · {{ locationName(detailItem.locationId) }}
                </p>
              </div>
              <button class="icon-btn" :aria-label="'关闭'" @click="closeDetail">×</button>
            </header>

            <dl class="kv">
              <div><dt>剩余</dt><dd>{{ detailItem.quantity }} {{ detailItem.unit }}</dd></div>
              <div><dt>品牌</dt><dd>{{ detailItem.brand || '—' }}</dd></div>
              <div><dt>规格</dt><dd>{{ detailItem.spec || '—' }}</dd></div>
              <div><dt>购买日期</dt><dd>{{ detailItem.purchaseDate || '—' }}</dd></div>
              <div><dt>到期日期</dt><dd>{{ detailItem.expiryDate || '—' }}</dd></div>
              <div><dt>剩余时间</dt><dd>{{ formatRelativeExpiry(detailItem.expiryDate) }}</dd></div>
              <div><dt>购买金额</dt><dd>{{ formatMoney(detailItem.price) }}</dd></div>
              <div v-if="detailItem.note"><dt>备注</dt><dd>{{ detailItem.note }}</dd></div>
            </dl>

            <div class="qty-controls">
              <button class="qty-btn" @click="adjustQty(-1)" :disabled="detailItem.quantity <= 0">−</button>
              <span class="qty-display">{{ detailItem.quantity }} {{ detailItem.unit }}</span>
              <button class="qty-btn" @click="adjustQty(1)">+</button>
            </div>

            <div class="sheet-actions">
              <button class="btn btn-ghost btn-block" @click="consume">记录消耗</button>
              <button class="btn btn-secondary btn-block" @click="markExpired">标记过期</button>
              <button class="btn btn-danger btn-block" @click="onDelete">删除</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import AppBar from '@/components/layout/AppBar.vue';
import CategoryTabs from '@/components/CategoryTabs.vue';
import ItemCard from '@/components/ItemCard.vue';
import StatusBadge from '@/components/StatusBadge.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useItemsStore } from '@/stores/items.js';
import { useCategoriesStore } from '@/stores/categories.js';
import { useSettingsStore } from '@/stores/settings.js';
import { categoryIcon, categoryName } from '@/constants/categories.js';
import { locationName } from '@/constants/locations.js';
import { formatRelativeExpiry } from '@/services/dateService.js';
import { formatMoney } from '@/utils/format.js';
import { SORT_OPTIONS, ITEM_STATUS } from '@/constants/thresholds.js';
import { toast } from '@/utils/toast.js';

const route = useRoute();
const items = useItemsStore();
const categories = useCategoriesStore();
const settings = useSettingsStore();

const activeCat = ref(route.query.cat || 'all');
const search = ref('');
const sortKey = ref('expiry_asc');
const viewMode = ref(settings.data.listStyle === 'list' ? 'list' : 'grid');
const detailItem = ref(null);

watch(
  () => route.query,
  (q) => {
    if (q.cat) activeCat.value = q.cat;
    if (q.itemId) {
      const it = items.list.find((i) => i.id === Number(q.itemId));
      if (it) detailItem.value = it;
    }
  },
);

const counts = computed(() => {
  const c = { all: items.active.length };
  for (const it of items.active) {
    c[it.category] = (c[it.category] || 0) + 1;
  }
  return c;
});

const filtered = computed(() => {
  let list = items.active.filter((i) => i.status === ITEM_STATUS.ACTIVE);
  if (activeCat.value !== 'all') {
    list = list.filter((i) => i.category === activeCat.value);
  }
  const q = search.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.brand && i.brand.toLowerCase().includes(q)) ||
        (i.note && i.note.toLowerCase().includes(q)),
    );
  }
  const sorters = {
    expiry_asc: (a, b) => (a.daysUntilExpiry ?? 99999) - (b.daysUntilExpiry ?? 99999),
    expiry_desc: (a, b) => (b.daysUntilExpiry ?? -1) - (a.daysUntilExpiry ?? -1),
    name: (a, b) => a.name.localeCompare(b.name),
    qty_desc: (a, b) => (b.quantity || 0) - (a.quantity || 0),
    updated_desc: (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0),
  };
  const sorter = sorters[sortKey.value] || sorters.expiry_asc;
  return [...list].sort(sorter);
});

function openDetail(item) {
  detailItem.value = item;
}

function closeDetail() {
  detailItem.value = null;
}

async function adjustQty(delta) {
  if (!detailItem.value) return;
  const next = Math.max(0, (detailItem.value.quantity || 0) + delta);
  await items.update(detailItem.value.id, { quantity: next });
  detailItem.value = items.list.find((i) => i.id === detailItem.value.id) || null;
}

async function consume() {
  if (!detailItem.value) return;
  await items.consume({ id: detailItem.value.id, amount: 1 });
  detailItem.value = items.list.find((i) => i.id === detailItem.value.id) || null;
  toast('已记录消耗');
}

async function markExpired() {
  if (!detailItem.value) return;
  await items.update(detailItem.value.id, { status: 'expired' });
  closeDetail();
  toast('已标记为过期');
}

async function onDelete() {
  if (!detailItem.value) return;
  if (!confirm(`确认删除"${detailItem.value.name}"？`)) return;
  await items.remove(detailItem.value.id);
  closeDetail();
  toast('已删除');
}

onMounted(async () => {
  await categories.loadAll();
  await items.loadAll();
  if (route.query.itemId) {
    const it = items.list.find((i) => i.id === Number(route.query.itemId));
    if (it) detailItem.value = it;
  }
});
</script>

<style scoped>
.filter-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-row .input {
  flex: 1;
}

.filter-row .select {
  flex: 0 0 auto;
  width: 130px;
}

.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: var(--color-text);
  box-shadow: var(--shadow-sm);
}

.list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-row {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  width: 100%;
  text-align: left;
  box-shadow: var(--shadow-sm);
}

.list-icon {
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

.list-body {
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

.sheet-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  z-index: 200;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sheet {
  width: 100%;
  max-width: 720px;
  max-height: 88vh;
  overflow-y: auto;
  background: var(--color-bg);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 20px 16px calc(28px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sheet-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sheet-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.sheet-title-block {
  flex: 1;
}

.sheet-title-block h2 {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-strong);
}

.kv {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 16px;
  padding: 16px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}

.kv > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kv dt {
  font-size: 11px;
  color: var(--color-text-muted);
}

.kv dd {
  font-size: 14px;
  color: var(--color-text-strong);
  margin: 0;
  font-weight: 600;
}

.qty-controls {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
}

.qty-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 22px;
  font-weight: 700;
}

.qty-btn:disabled {
  opacity: 0.4;
}

.qty-display {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-strong);
  min-width: 80px;
  text-align: center;
}

.sheet-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.2s ease;
}
.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.2s ease;
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(100%);
}
</style>
