<template>
  <div>
    <AppBar title="我的" subtitle="个性化与功能入口" icon="👤" />
    <div class="app-container">
      <section class="user-card">
        <div class="avatar">{{ nicknameInitial }}</div>
        <div class="user-info">
          <h2>{{ settings.data.nickname || '欢迎使用' }}</h2>
          <p class="text-muted">{{ settings.data.role }} · 家庭 {{ settings.data.familySize }} 人</p>
        </div>
        <button class="btn btn-ghost" @click="$router.push('/settings')">编辑</button>
      </section>

      <section class="card menu">
        <RouterLink v-for="m in menus" :key="m.path" :to="m.path" class="menu-row">
          <span class="menu-icon" :style="{ background: m.color }">{{ m.icon }}</span>
          <div class="menu-body">
            <div class="strong">{{ m.label }}</div>
            <div class="text-muted small">{{ m.desc }}</div>
          </div>
          <span class="chev" aria-hidden="true">›</span>
        </RouterLink>
      </section>

      <section class="card about">
        <div class="about-row">
          <div>
            <div class="strong">悦家库存 HomeStock</div>
            <div class="text-muted small">V1.0.0 · 著作权人：柴琳</div>
          </div>
          <div class="about-badge">本地存储 · 零隐私顾虑</div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import AppBar from '@/components/layout/AppBar.vue';
import { useSettingsStore } from '@/stores/settings.js';

const settings = useSettingsStore();

const nicknameInitial = computed(() => {
  const n = settings.data.nickname || '?';
  return n.charAt(0).toUpperCase();
});

const menus = [
  { path: '/expired', icon: '⚠️', label: '已过期物资', desc: '查看与处理过期物品', color: '#E54B4B' },
  { path: '/stock', icon: '📈', label: '库存追踪', desc: '消耗品库存可视化', color: '#FFC857' },
  { path: '/locations', icon: '📍', label: '存放位置', desc: '12 个家庭存放空间', color: '#7FB069' },
  { path: '/shopping', icon: '🛒', label: '购物清单', desc: '智能采购方案', color: '#3D7EC9' },
  { path: '/consume', icon: '📝', label: '消耗记录', desc: '每日物品消耗事件', color: '#C44569' },
  { path: '/analytics', icon: '📊', label: '数据分析', desc: '6 个月支出洞察', color: '#FF6B35' },
  { path: '/settings', icon: '⚙️', label: '设置', desc: '主题、通知、数据备份', color: '#A89888' },
];
</script>

<style scoped>
.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  color: var(--color-text-on-primary);
  margin-bottom: 16px;
  box-shadow: var(--shadow-primary);
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.user-info {
  flex: 1;
}

.user-info h2 {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
}

.user-info p {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  margin-top: 2px;
}

.btn-ghost {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.menu {
  padding: 4px;
  display: flex;
  flex-direction: column;
}

.menu-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  color: var(--color-text);
  transition: background 0.15s ease;
}

.menu-row:active {
  background: var(--color-surface-2);
}

.menu-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.menu-body {
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

.chev {
  color: var(--color-text-muted);
  font-size: 22px;
  font-weight: 300;
}

.about {
  margin-top: 16px;
}

.about-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.about-badge {
  background: var(--color-success-soft);
  color: var(--color-success);
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 600;
}
</style>
