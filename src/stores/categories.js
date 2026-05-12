import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as storage from '@/services/storageService.js';

export const useCategoriesStore = defineStore('categories', () => {
  const list = ref([]);

  async function loadAll() {
    list.value = await storage.getAllCategories();
  }

  async function save(cat) {
    await storage.saveCategory(cat);
    await loadAll();
  }

  async function remove(key) {
    await storage.deleteCategory(key);
    await loadAll();
  }

  const enabled = computed(() => list.value.filter((c) => c.enabled !== false));

  function byKey(key) {
    return list.value.find((c) => c.key === key);
  }

  return { list, enabled, loadAll, save, remove, byKey };
});
