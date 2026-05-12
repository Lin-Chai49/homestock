import { createRouter, createWebHashHistory } from 'vue-router';
import { useSettingsStore } from '@/stores/settings.js';

const routes = [
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/views/Onboarding.vue'),
    meta: { title: '欢迎', hideShell: true },
  },
  { path: '/', name: 'Dashboard', component: () => import('@/views/Dashboard.vue'), meta: { title: '库存总览' } },
  { path: '/items', name: 'Items', component: () => import('@/views/Items.vue'), meta: { title: '物资清单' } },
  { path: '/add', name: 'AddItem', component: () => import('@/views/AddItem.vue'), meta: { title: '入库登记' } },
  { path: '/expiry', name: 'Expiry', component: () => import('@/views/Expiry.vue'), meta: { title: '临期预警' } },
  { path: '/more', name: 'More', component: () => import('@/views/More.vue'), meta: { title: '我的' } },
  { path: '/expired', name: 'Expired', component: () => import('@/views/Expired.vue'), meta: { title: '已过期', secondary: true } },
  { path: '/stock', name: 'Stock', component: () => import('@/views/Stock.vue'), meta: { title: '库存追踪', secondary: true } },
  { path: '/locations', name: 'Locations', component: () => import('@/views/Locations.vue'), meta: { title: '存放位置', secondary: true } },
  { path: '/shopping', name: 'Shopping', component: () => import('@/views/Shopping.vue'), meta: { title: '购物清单', secondary: true } },
  { path: '/consume', name: 'Consume', component: () => import('@/views/Consume.vue'), meta: { title: '消耗记录', secondary: true } },
  { path: '/analytics', name: 'Analytics', component: () => import('@/views/Analytics.vue'), meta: { title: '数据分析', secondary: true } },
  { path: '/settings', name: 'Settings', component: () => import('@/views/Settings.vue'), meta: { title: '设置', secondary: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const settings = useSettingsStore();
  if (!settings.loaded) await settings.load();
  if (!settings.data.nickname && to.name !== 'Onboarding') {
    return { name: 'Onboarding' };
  }
  if (settings.data.nickname && to.name === 'Onboarding') {
    return { name: 'Dashboard' };
  }
  return true;
});

router.afterEach((to) => {
  if (typeof document !== 'undefined') {
    document.title = `${to.meta?.title ?? ''} · 悦家库存`;
  }
});

export default router;
