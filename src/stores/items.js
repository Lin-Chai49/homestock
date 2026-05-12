import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as storage from '@/services/storageService.js';
import {
  decorateItem,
  shouldAutoBuy,
  recommendStore,
  stockRatio,
} from '@/services/algorithmService.js';
import { ITEM_STATUS } from '@/constants/thresholds.js';
import { useConsumptionsStore } from './consumptions.js';
import { useShoppingStore } from './shopping.js';

export const useItemsStore = defineStore('items', () => {
  const list = ref([]);
  const loading = ref(false);

  async function loadAll() {
    loading.value = true;
    try {
      const raw = await storage.getAllItems();
      list.value = raw.map(decorateItem);
    } finally {
      loading.value = false;
    }
  }

  async function add(data) {
    const id = await storage.addItem(data);
    await loadAll();
    return id;
  }

  async function update(id, patch) {
    await storage.updateItem(id, patch);
    await loadAll();
  }

  async function remove(id) {
    await storage.deleteItem(id);
    list.value = list.value.filter((i) => i.id !== id);
  }

  async function consume({ id, amount = 1, scene = 'daily' }) {
    await storage.consumeItem({ id, amount, scene });
    await loadAll();
  }

  async function markExpiredItems() {
    const expired = list.value.filter(
      (i) => i.status === ITEM_STATUS.ACTIVE && i.expiryStatus === 'expired',
    );
    for (const it of expired) {
      await storage.updateItem(it.id, { status: ITEM_STATUS.EXPIRED });
    }
    if (expired.length > 0) await loadAll();
  }

  /**
   * Run auto-buy detection over current items and insert missing entries
   * into the shopping list (idempotent on itemName + done=false).
   */
  async function syncAutoShopping() {
    const consumptions = useConsumptionsStore();
    const shopping = useShoppingStore();
    await consumptions.loadAll();
    await shopping.loadAll();

    const existingNames = new Set(
      shopping.list.filter((s) => !s.done).map((s) => s.itemName.toLowerCase()),
    );

    for (const it of list.value) {
      if (it.status !== ITEM_STATUS.ACTIVE) continue;
      const itemCons = consumptions.list.filter((c) => c.itemId === it.id);
      if (shouldAutoBuy(it, itemCons)) {
        const key = it.name.toLowerCase();
        if (existingNames.has(key)) continue;
        await storage.addShoppingItem({
          itemName: it.name,
          category: it.category,
          quantity: Math.max(1, (it.fullStock || it.quantity || 1) - (it.quantity || 0)),
          estimatedPrice: it.price || 0,
          recommendStore: recommendStore(it.category),
          source: 'auto',
        });
        existingNames.add(key);
      }
    }
    await shopping.loadAll();
  }

  const byCategory = computed(() => {
    const map = new Map();
    for (const i of list.value) {
      const cur = map.get(i.category) || [];
      cur.push(i);
      map.set(i.category, cur);
    }
    return map;
  });

  const active = computed(() => list.value.filter((i) => i.status === ITEM_STATUS.ACTIVE));
  const expired = computed(() =>
    list.value.filter(
      (i) => i.status === ITEM_STATUS.EXPIRED || i.expiryStatus === 'expired',
    ),
  );
  const expiringSoon = computed(() =>
    active.value
      .filter((i) => ['urgent', 'warning'].includes(i.expiryStatus))
      .sort((a, b) => (a.daysUntilExpiry ?? 99) - (b.daysUntilExpiry ?? 99)),
  );
  const lowStock = computed(() =>
    active.value.filter((i) => (i.quantity ?? 0) <= (i.minStock ?? 1)),
  );

  function totals() {
    return {
      total: active.value.length,
      expiring: expiringSoon.value.length,
      expired: expired.value.length,
      lowStock: lowStock.value.length,
    };
  }

  function locationCounts() {
    const map = new Map();
    for (const i of active.value) {
      map.set(i.locationId, (map.get(i.locationId) || 0) + 1);
    }
    return map;
  }

  return {
    list,
    loading,
    loadAll,
    add,
    update,
    remove,
    consume,
    markExpiredItems,
    syncAutoShopping,
    byCategory,
    active,
    expired,
    expiringSoon,
    lowStock,
    totals,
    locationCounts,
    stockRatio,
  };
});
