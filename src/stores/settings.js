import { defineStore } from 'pinia';
import { ref } from 'vue';
import * as storage from '@/services/storageService.js';

export const useSettingsStore = defineStore('settings', () => {
  const data = ref(storage.defaultSettings());
  const loaded = ref(false);

  async function load() {
    data.value = await storage.getSettings();
    loaded.value = true;
  }

  async function save(patch) {
    data.value = await storage.saveSettings(patch);
    applyTheme();
  }

  function applyTheme() {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', data.value.theme || 'warm');
    }
  }

  async function completeOnboarding({ nickname, theme }) {
    await save({ nickname: nickname.trim(), theme, onboardedAt: Date.now() });
  }

  return { data, loaded, load, save, applyTheme, completeOnboarding };
});
