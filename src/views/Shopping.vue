<template>
  <div>
    <AppBar title="购物清单" subtitle="基于库存追踪自动生成的待购清单" icon="🛒" back>
      <template #actions>
        <button class="icon-btn" :aria-label="'同步自动补货'" @click="onSync" :disabled="syncing">
          {{ syncing ? '…' : '↻' }}
        </button>
      </template>
    </AppBar>

    <div class="app-container">
      <section class="grid grid-stats">
        <StatCard variant="primary" icon="🛒" label="待购物品" :value="shopping.pending.length" unit="件" />
        <StatCard variant="info" icon="💰" label="预计支出" :value="estimatedTotal" />
        <StatCard variant="success" icon="✓" label="已购完成" :value="shopping.completed.length" unit="件" />
        <StatCard variant="warning" icon="🏬" label="推荐商超" :value="storeCount" unit="家" />
      </section>

      <section class="card">
        <div class="tabs">
          <button class="tab" :class="{ active: viewMode === 'pending' }" @click="viewMode = 'pending'">
            待购清单 ({{ shopping.pending.length }})
          </button>
          <button class="tab" :class="{ active: viewMode === 'done' }" @click="viewMode = 'done'">
            已购完成 ({{ shopping.completed.length }})
          </button>
        </div>

        <EmptyState
          v-if="currentList.length === 0"
          :icon="viewMode === 'pending' ? '🎉' : '📭'"
          :title="viewMode === 'pending' ? '购物清单已清空' : '还没有已购记录'"
          :hint="viewMode === 'pending' ? '点击右上角 ↻ 让系统自动检测需补货的物品' : ''"
        />

        <div v-else class="shop-list">
          <div
            v-for="s in currentList"
            :key="s.id"
            class="shop-row"
            :class="{ done: s.done }"
          >
            <label class="check-wrap">
              <input
                type="checkbox"
                :checked="s.done"
                @change="onToggle(s)"
              />
              <span class="check-mark" aria-hidden="true">✓</span>
            </label>
            <div class="shop-body">
              <div class="row-between">
                <span class="strong">{{ s.itemName }}</span>
                <span class="text-primary">{{ formatMoney(s.estimatedPrice * (s.quantity || 1)) }}</span>
              </div>
              <div class="text-muted small">
                {{ categoryName(s.category) }} · {{ s.recommendStore || '未指定' }}
                <span v-if="s.source === 'auto'" class="badge badge-info" style="margin-left: 4px">自动</span>
              </div>
            </div>
            <button class="icon-btn small" :aria-label="'删除'" @click="onDelete(s)">×</button>
          </div>

          <div v-if="viewMode === 'pending'" class="subtotal">
            <span>小计 {{ shopping.pending.length }} 件</span>
            <span class="strong">{{ formatMoney(estimatedNum) }}</span>
          </div>
        </div>

        <button class="btn btn-primary btn-block" @click="addManual">+ 手动添加</button>
      </section>

      <section class="card" v-if="shopping.byStore.size > 0">
        <div class="card-header"><h2 class="card-title">🏬 智能采购方案</h2></div>
        <div class="store-cards">
          <div v-for="[store, list] in shopping.byStore" :key="store" class="store-card">
            <div class="store-head">
              <span class="strong">{{ store }}</span>
              <span class="text-muted small">{{ list.length }} 件 · {{ formatMoney(storeTotal(list)) }}</span>
            </div>
            <ul>
              <li v-for="s in list" :key="s.id">{{ s.itemName }} × {{ s.quantity }}</li>
            </ul>
          </div>
        </div>
      </section>
    </div>

    <Teleport to="body">
      <transition name="sheet">
        <div v-if="addingManual" class="sheet-overlay" @click.self="addingManual = false">
          <div class="sheet">
            <h3>添加购物项</h3>
            <div class="field">
              <label class="field-label">物品名称</label>
              <input v-model="manualForm.itemName" class="input" placeholder="如：黄瓜" />
            </div>
            <div class="field">
              <label class="field-label">类别</label>
              <select v-model="manualForm.category" class="select">
                <option v-for="c in categories.enabled" :key="c.key" :value="c.key">
                  {{ c.icon }} {{ c.name }}
                </option>
              </select>
            </div>
            <div class="grid two">
              <div class="field">
                <label class="field-label">数量</label>
                <input v-model.number="manualForm.quantity" type="number" min="1" class="input" />
              </div>
              <div class="field">
                <label class="field-label">单价</label>
                <input v-model.number="manualForm.estimatedPrice" type="number" step="0.01" class="input" />
              </div>
            </div>
            <div class="row" style="gap: 8px; margin-top: 12px">
              <button class="btn btn-secondary" @click="addingManual = false">取消</button>
              <button class="btn btn-primary flex-1" @click="confirmAdd">添加</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import AppBar from '@/components/layout/AppBar.vue';
import StatCard from '@/components/StatCard.vue';
import EmptyState from '@/components/EmptyState.vue';
import { useShoppingStore } from '@/stores/shopping.js';
import { useItemsStore } from '@/stores/items.js';
import { useCategoriesStore } from '@/stores/categories.js';
import { useConsumptionsStore } from '@/stores/consumptions.js';
import { formatMoney } from '@/utils/format.js';
import { categoryName } from '@/constants/categories.js';
import { recommendStore } from '@/services/algorithmService.js';
import { toast } from '@/utils/toast.js';

const shopping = useShoppingStore();
const items = useItemsStore();
const categories = useCategoriesStore();
const consumptions = useConsumptionsStore();

const viewMode = ref('pending');
const syncing = ref(false);
const addingManual = ref(false);

const manualForm = reactive({
  itemName: '',
  category: 'food',
  quantity: 1,
  estimatedPrice: 0,
});

const currentList = computed(() =>
  viewMode.value === 'pending' ? shopping.pending : shopping.completed,
);

const estimatedNum = computed(() =>
  shopping.pending.reduce((acc, s) => acc + (s.estimatedPrice || 0) * (s.quantity || 1), 0),
);

const estimatedTotal = computed(() => formatMoney(estimatedNum.value));

const storeCount = computed(() => shopping.byStore.size);

function storeTotal(list) {
  return list.reduce((acc, s) => acc + (s.estimatedPrice || 0) * (s.quantity || 1), 0);
}

async function onToggle(s) {
  await shopping.markDone(s.id, !s.done);
}

async function onDelete(s) {
  if (!confirm(`删除"${s.itemName}"？`)) return;
  await shopping.remove(s.id);
  toast('已删除');
}

async function onSync() {
  syncing.value = true;
  try {
    await items.syncAutoShopping();
    toast('已检测并补充自动补货项');
  } finally {
    syncing.value = false;
  }
}

function addManual() {
  manualForm.itemName = '';
  manualForm.category = 'food';
  manualForm.quantity = 1;
  manualForm.estimatedPrice = 0;
  addingManual.value = true;
}

async function confirmAdd() {
  if (!manualForm.itemName.trim()) return toast('请输入物品名称');
  await shopping.add({
    ...manualForm,
    itemName: manualForm.itemName.trim(),
    recommendStore: recommendStore(manualForm.category),
    source: 'manual',
  });
  addingManual.value = false;
  toast('已添加');
}

onMounted(async () => {
  await Promise.all([
    items.loadAll(),
    consumptions.loadAll(),
    categories.loadAll(),
    shopping.loadAll(),
  ]);
});
</script>

<style scoped>
.card {
  margin-bottom: 16px;
}

.tabs {
  display: flex;
  gap: 4px;
  background: var(--color-surface-2);
  padding: 4px;
  border-radius: var(--radius-pill);
  margin-bottom: 12px;
}

.tab {
  flex: 1;
  padding: 8px 12px;
  border-radius: var(--radius-pill);
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  transition: background 0.15s ease, color 0.15s ease;
}

.tab.active {
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.shop-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
}

.shop-row.done {
  opacity: 0.6;
}

.shop-row.done .strong {
  text-decoration: line-through;
}

.check-wrap {
  position: relative;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.check-wrap input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}

.check-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--color-border-strong);
  font-size: 14px;
  color: transparent;
}

.check-wrap input:checked + .check-mark {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.shop-body {
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

.text-primary {
  color: var(--color-primary);
  font-weight: 700;
}

.subtotal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  margin-top: 4px;
  background: var(--gradient-primary);
  color: var(--color-text-on-primary);
  border-radius: var(--radius-md);
  font-size: 14px;
}

.subtotal .strong {
  color: #fff;
  font-size: 18px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 16px;
  box-shadow: var(--shadow-sm);
}

.icon-btn.small {
  width: 28px;
  height: 28px;
  font-size: 14px;
}

.store-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.store-card {
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
  padding: 12px;
}

.store-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.store-card ul {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.store-card li {
  font-size: 12px;
  color: var(--color-text);
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
  background: var(--color-bg);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
  padding: 20px 16px calc(20px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sheet h3 {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-strong);
  margin-bottom: 4px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.grid.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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
