import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router.js';
import { initDatabase } from './services/db.js';
import { seedDefaults } from './services/storageService.js';
import { useSettingsStore } from './stores/settings.js';
import './styles/global.css';

async function bootstrap() {
  console.log('🏡 悦家库存 HomeStock V1.0 启动中...');

  await initDatabase();
  await seedDefaults();

  const app = createApp(App);
  const pinia = createPinia();
  app.use(pinia);
  app.use(router);

  app.config.errorHandler = (err, _vm, info) => {
    console.error('[Vue Error]', err, info);
  };

  app.config.globalProperties.$version = 'V1.0.0';

  // Load settings + apply theme before mount
  const settings = useSettingsStore();
  await settings.load();
  settings.applyTheme();

  app.mount('#app');
  console.log('🎉 启动完成');
}

bootstrap().catch((err) => {
  console.error('应用启动失败:', err);
  const root = document.getElementById('app');
  if (root) {
    root.innerHTML = `
      <div style="padding:24px;color:#e54b4b;text-align:center;">
        <h2>启动失败</h2>
        <p>${err && err.message ? err.message : String(err)}</p>
        <p style="color:#8a857f;margin-top:12px;">请刷新页面重试。</p>
      </div>`;
  }
});
