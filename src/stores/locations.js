import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as storage from '@/services/storageService.js';

export const useLocationsStore = defineStore('locations', () => {
  const list = ref([]);

  async function loadAll() {
    list.value = await storage.getAllLocations();
  }

  async function save(loc) {
    await storage.saveLocation(loc);
    await loadAll();
  }

  async function remove(id) {
    await storage.deleteLocation(id);
    await loadAll();
  }

  const enabled = computed(() => list.value.filter((l) => l.enabled !== false));

  function byId(id) {
    return list.value.find((l) => l.id === id);
  }

  /** Annotate with counts; consumer provides items array to avoid circular store deps */
  function withCounts(items) {
    const counts = new Map();
    const expiring = new Map();
    for (const it of items || []) {
      counts.set(it.locationId, (counts.get(it.locationId) || 0) + 1);
      if (['urgent', 'warning'].includes(it.expiryStatus)) {
        expiring.set(it.locationId, (expiring.get(it.locationId) || 0) + 1);
      }
    }
    return list.value.map((l) => ({
      ...l,
      itemCount: counts.get(l.id) || 0,
      expiringCount: expiring.get(l.id) || 0,
    }));
  }

  return { list, enabled, loadAll, save, remove, byId, withCounts };
});
