<template>
  <div>
    <AppBar title="设置" subtitle="个性化、提醒、数据管理" icon="⚙️" back />
    <div class="app-container">
      <!-- 个人信息 -->
      <section class="card">
        <div class="card-header"><h2 class="card-title">👤 个人信息</h2></div>
        <div class="grid two">
          <div class="field">
            <label class="field-label">昵称</label>
            <input v-model="form.nickname" class="input" maxlength="20" />
          </div>
          <div class="field">
            <label class="field-label">家庭角色</label>
            <select v-model="form.role" class="select">
              <option>家庭主管</option>
              <option>家庭主妇/主夫</option>
              <option>双职工</option>
              <option>独居</option>
              <option>多代同堂</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">家庭人数</label>
            <input v-model.number="form.familySize" type="number" min="1" max="20" class="input" />
          </div>
          <div class="field">
            <label class="field-label">家庭住址</label>
            <input v-model="form.address" class="input" placeholder="选填" maxlength="50" />
          </div>
        </div>
      </section>

      <!-- 显示偏好 -->
      <section class="card">
        <div class="card-header"><h2 class="card-title">🎨 显示偏好</h2></div>
        <div class="field">
          <label class="field-label">主题风格</label>
          <div class="theme-grid">
            <button
              v-for="t in THEMES"
              :key="t.key"
              class="theme-card"
              :class="{ selected: form.theme === t.key }"
              @click="form.theme = t.key"
            >
              <span class="theme-swatch" :style="{ background: themeBg(t.key) }">{{ t.icon }}</span>
              <span>{{ t.name }}</span>
            </button>
          </div>
        </div>

        <div class="grid two">
          <div class="field">
            <label class="field-label">列表显示样式</label>
            <select v-model="form.listStyle" class="select">
              <option v-for="ls in LIST_STYLES" :key="ls.key" :value="ls.key">{{ ls.name }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">默认排序</label>
            <select v-model="form.defaultSort" class="select">
              <option v-for="s in SORT_OPTIONS" :key="s.key" :value="s.key">{{ s.name }}</option>
            </select>
          </div>
        </div>
      </section>

      <!-- 通知与提醒 -->
      <section class="card">
        <div class="card-header"><h2 class="card-title">🔔 通知与提醒</h2></div>

        <label v-for="n in NOTIFICATION_KEYS" :key="n.key" class="toggle-row">
          <span class="row" style="gap: 8px">
            <span class="toggle-icon">{{ n.icon }}</span>
            <span>{{ n.label }}</span>
          </span>
          <span class="switch">
            <input v-model="form.notifications[n.key]" type="checkbox" />
            <span class="slider" aria-hidden="true" />
          </span>
        </label>

        <div class="grid two" style="margin-top: 12px">
          <div class="field">
            <label class="field-label">临期阈值（天）</label>
            <input v-model.number="form.expiryThresholdDays" type="number" min="1" max="30" class="input" />
          </div>
          <div class="field">
            <label class="field-label">最低库存默认比率</label>
            <input v-model.number="form.defaultMinStockRatio" type="number" min="0.05" max="0.5" step="0.05" class="input" />
          </div>
        </div>
      </section>

      <!-- 类别与位置 -->
      <section class="card">
        <div class="card-header">
          <h2 class="card-title">🗂️ 类别与存放位置</h2>
        </div>
        <div class="text-muted small" style="margin-bottom: 8px">支出类别（{{ categories.list.length }} 个）</div>
        <div class="tag-row">
          <span v-for="c in categories.list" :key="c.key" class="tag" :style="{ background: c.color + '20', color: c.color }">
            {{ c.icon }} {{ c.name }}
          </span>
        </div>
        <div class="text-muted small" style="margin-top: 12px; margin-bottom: 8px">
          存放位置（{{ locations.list.length }} 处）
        </div>
        <div class="tag-row">
          <span v-for="l in locations.list" :key="l.id" class="tag" :style="{ background: (l.color || '#FF6B35') + '20', color: l.color }">
            {{ l.icon }} {{ l.name }}
          </span>
        </div>
      </section>

      <!-- 数据管理 -->
      <section class="card">
        <div class="card-header"><h2 class="card-title">💾 数据管理</h2></div>
        <div class="action-list">
          <button class="action-btn" @click="onExport">
            <span class="action-icon">⬇️</span>
            <div>
              <div class="strong">导出数据（JSON）</div>
              <div class="text-muted small">备份全部物品、类别、位置、消耗、购物记录</div>
            </div>
          </button>
          <label class="action-btn">
            <span class="action-icon">⬆️</span>
            <div>
              <div class="strong">导入备份</div>
              <div class="text-muted small">从 JSON 备份恢复数据（会覆盖现有）</div>
            </div>
            <input type="file" accept=".json,application/json" hidden @change="onImport" />
          </label>
          <button class="action-btn" @click="onLoadDemo">
            <span class="action-icon">🎁</span>
            <div>
              <div class="strong">加载演示数据</div>
              <div class="text-muted small">注入 ~20 件示例物品 + 消耗记录</div>
            </div>
          </button>
          <button class="action-btn warn" @click="onClearAll">
            <span class="action-icon">🗑️</span>
            <div>
              <div class="strong text-danger">清空全部数据</div>
              <div class="text-muted small">删除物品、消耗、购物记录（保留类别与位置）</div>
            </div>
          </button>
        </div>
      </section>

      <!-- 保存按钮 -->
      <div class="submit-row">
        <button class="btn btn-primary btn-block" :disabled="saving" @click="save">
          {{ saving ? '保存中…' : '保存修改' }}
        </button>
      </div>

      <!-- 关于 -->
      <section class="about">
        <p class="strong">悦家库存 HomeStock V1.0.0</p>
        <p class="text-muted small">著作权人：柴琳 · MIT License · 2026</p>
        <p class="text-muted small" style="margin-top: 4px">
          所有数据本地存储，零数据采集，无网络请求。
        </p>
      </section>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import AppBar from '@/components/layout/AppBar.vue';
import { useSettingsStore } from '@/stores/settings.js';
import { useCategoriesStore } from '@/stores/categories.js';
import { useLocationsStore } from '@/stores/locations.js';
import { useItemsStore } from '@/stores/items.js';
import { useConsumptionsStore } from '@/stores/consumptions.js';
import { useShoppingStore } from '@/stores/shopping.js';
import { exportAll, importAll, clearUserData } from '@/services/storageService.js';
import { loadDemoData } from '@/utils/demoData.js';
import { THEMES, LIST_STYLES, SORT_OPTIONS } from '@/constants/thresholds.js';
import { toast } from '@/utils/toast.js';
import dayjs from 'dayjs';

const settings = useSettingsStore();
const categories = useCategoriesStore();
const locations = useLocationsStore();
const items = useItemsStore();
const consumptions = useConsumptionsStore();
const shopping = useShoppingStore();

const NOTIFICATION_KEYS = [
  { key: 'expiring', label: '临期提醒', icon: '⏰' },
  { key: 'expired', label: '已过期提醒', icon: '⚠️' },
  { key: 'lowStock', label: '库存不足提醒', icon: '📦' },
  { key: 'shoppingUpdate', label: '购物清单更新', icon: '🛒' },
  { key: 'weeklyReport', label: '每周报告（周一上午）', icon: '📅' },
  { key: 'monthlySummary', label: '月度总结（每月初）', icon: '📊' },
  { key: 'dndEnabled', label: '免打扰时段（22:00-07:00）', icon: '🌙' },
];

const saving = ref(false);
const form = reactive({
  nickname: '',
  role: '家庭主管',
  familySize: 3,
  address: '',
  theme: 'warm',
  listStyle: 'grid',
  defaultSort: 'expiry_asc',
  expiryThresholdDays: 3,
  defaultMinStockRatio: 0.2,
  notifications: {
    expiring: true,
    expired: true,
    lowStock: true,
    shoppingUpdate: true,
    weeklyReport: false,
    monthlySummary: true,
    dndEnabled: true,
  },
});

function hydrate() {
  Object.assign(form, JSON.parse(JSON.stringify(settings.data)));
}

watch(() => settings.loaded, hydrate);

function themeBg(key) {
  switch (key) {
    case 'warm':
      return 'linear-gradient(135deg, #FF6B35, #FFC857)';
    case 'dark':
      return 'linear-gradient(135deg, #25221E, #FF7E47)';
    case 'fresh':
      return 'linear-gradient(135deg, #7FB069, #A4D7A6)';
    default:
      return '';
  }
}

async function save() {
  saving.value = true;
  try {
    await settings.save(form);
    toast('设置已保存 ✓');
  } finally {
    saving.value = false;
  }
}

async function onExport() {
  const data = await exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `homestock-backup-${dayjs().format('YYYY-MM-DD-HHmm')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('已导出 JSON 备份');
}

async function onImport(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  if (!confirm('导入将覆盖所有现有数据，确定继续？')) {
    e.target.value = '';
    return;
  }
  try {
    const text = await file.text();
    const json = JSON.parse(text);
    await importAll(json);
    await reloadAll();
    toast('导入成功');
  } catch (err) {
    toast('导入失败：' + (err?.message || '文件格式错误'));
  } finally {
    e.target.value = '';
  }
}

async function onLoadDemo() {
  if (!confirm('将向当前数据库追加 ~20 件示例物品和消耗记录，继续？')) return;
  try {
    await loadDemoData();
    await reloadAll();
    toast('演示数据已加载');
  } catch (err) {
    toast('加载失败：' + (err?.message || ''));
  }
}

async function onClearAll() {
  if (!confirm('确认清空所有物品、消耗记录与购物清单？（类别与位置会保留）')) return;
  if (!confirm('该操作无法撤销，再次确认？')) return;
  await clearUserData();
  await reloadAll();
  toast('已清空');
}

async function reloadAll() {
  await Promise.all([
    items.loadAll(),
    consumptions.loadAll(),
    shopping.loadAll(),
    categories.loadAll(),
    locations.loadAll(),
  ]);
}

onMounted(async () => {
  if (!settings.loaded) await settings.load();
  hydrate();
  await Promise.all([categories.loadAll(), locations.loadAll()]);
});
</script>

<style scoped>
.card {
  margin-bottom: 16px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
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
.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.theme-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  border: 2px solid transparent;
  font-size: 12px;
}
.theme-card.selected {
  border-color: var(--color-primary);
}
.theme-swatch {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid var(--color-divider);
  font-size: 13px;
}
.toggle-row:last-child {
  border-bottom: none;
}
.toggle-icon {
  font-size: 18px;
}
.switch {
  position: relative;
  width: 44px;
  height: 24px;
}
.switch input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
}
.slider {
  position: absolute;
  inset: 0;
  background: var(--color-border-strong);
  border-radius: var(--radius-pill);
  transition: background 0.2s ease;
}
.slider::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.switch input:checked + .slider {
  background: var(--gradient-primary);
}
.switch input:checked + .slider::after {
  transform: translateX(20px);
}
.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.tag {
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 12px;
  font-weight: 500;
}
.action-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  text-align: left;
  width: 100%;
}
.action-btn.warn {
  background: var(--color-danger-soft);
}
.action-icon {
  font-size: 22px;
  width: 36px;
  text-align: center;
}
.strong {
  font-weight: 600;
  color: var(--color-text-strong);
}
.small {
  font-size: 11px;
}
.submit-row {
  position: sticky;
  bottom: calc(72px + env(safe-area-inset-bottom));
  padding-top: 8px;
}
.about {
  text-align: center;
  padding: 16px;
}
.about .strong {
  font-size: 14px;
}
</style>
