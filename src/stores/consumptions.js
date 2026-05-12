import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as storage from '@/services/storageService.js';
import { consumptionByTimeOfDay, topConsumed } from '@/services/algorithmService.js';
import dayjs from 'dayjs';

export const useConsumptionsStore = defineStore('consumptions', () => {
  const list = ref([]);

  async function loadAll() {
    list.value = await storage.getAllConsumptions();
  }

  async function add(record) {
    await storage.addConsumption(record);
    await loadAll();
  }

  async function remove(id) {
    await storage.deleteConsumption(id);
    list.value = list.value.filter((c) => c.id !== id);
  }

  const thisMonth = computed(() => {
    const start = dayjs().startOf('month').valueOf();
    return list.value.filter((c) => c.timestamp >= start);
  });

  function timeOfDayDistribution(records = list.value) {
    return consumptionByTimeOfDay(records);
  }

  function topN(items, n = 5) {
    return topConsumed(list.value, items, n);
  }

  return { list, thisMonth, loadAll, add, remove, timeOfDayDistribution, topN };
});
