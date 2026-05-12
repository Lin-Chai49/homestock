import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as storage from '@/services/storageService.js';

export const useShoppingStore = defineStore('shopping', () => {
  const list = ref([]);

  async function loadAll() {
    list.value = await storage.getAllShopping();
  }

  async function add(data) {
    await storage.addShoppingItem(data);
    await loadAll();
  }

  async function update(id, patch) {
    await storage.updateShoppingItem(id, patch);
    await loadAll();
  }

  async function markDone(id, done = true) {
    await storage.markShoppingDone(id, done);
    await loadAll();
  }

  async function remove(id) {
    await storage.deleteShoppingItem(id);
    list.value = list.value.filter((s) => s.id !== id);
  }

  const pending = computed(() => list.value.filter((s) => !s.done));
  const completed = computed(() => list.value.filter((s) => s.done));

  const byStore = computed(() => {
    const map = new Map();
    for (const s of pending.value) {
      const key = s.recommendStore || '其他';
      const cur = map.get(key) || [];
      cur.push(s);
      map.set(key, cur);
    }
    return map;
  });

  return { list, pending, completed, byStore, loadAll, add, update, markDone, remove };
});
