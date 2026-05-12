<template>
  <div class="onboarding">
    <div class="hero">
      <div class="logo-circle" aria-hidden="true">
        <span>🏡</span>
      </div>
      <h1>悦家库存</h1>
      <p class="tagline">HomeStock · 让家更井井有条</p>
    </div>

    <transition name="fade" mode="out-in">
      <div v-if="step === 1" key="welcome" class="card welcome-card">
        <h2>欢迎来到您的家庭物资管家</h2>
        <ul class="features">
          <li><span>📅</span> 食品药品有效期管理</li>
          <li><span>📦</span> 12 个常用存放位置</li>
          <li><span>🛒</span> 智能补货与购物清单</li>
          <li><span>📊</span> 6 个月支出趋势分析</li>
          <li><span>🔒</span> 数据全部本地存储 · 零隐私顾虑</li>
        </ul>
        <button class="btn btn-primary btn-block" @click="step = 2">开始设置</button>
      </div>

      <div v-else-if="step === 2" key="name" class="card">
        <h2>怎么称呼您？</h2>
        <p class="text-muted">这个昵称仅保存在您的设备上。</p>
        <div class="field" style="margin-top: 16px">
          <label class="field-label" for="nickname-input">昵称（2-20 字符）</label>
          <input
            id="nickname-input"
            v-model="nickname"
            class="input"
            :class="{ error: !!error }"
            placeholder="例如：柴琳"
            maxlength="20"
            @keyup.enter="onNext"
          />
          <span v-if="error" class="field-error">{{ error }}</span>
        </div>
        <div class="row" style="margin-top: 16px; justify-content: flex-end; gap: 8px">
          <button class="btn btn-secondary" @click="step = 1">上一步</button>
          <button class="btn btn-primary" :disabled="!validName" @click="onNext">下一步</button>
        </div>
      </div>

      <div v-else-if="step === 3" key="theme" class="card">
        <h2>选择主题</h2>
        <p class="text-muted">可随时在"设置"中更换。</p>
        <div class="theme-grid">
          <button
            v-for="t in THEMES"
            :key="t.key"
            class="theme-card"
            :class="{ selected: theme === t.key }"
            @click="theme = t.key"
          >
            <div class="theme-swatch" :style="{ background: themeGradient(t.key) }">
              <span>{{ t.icon }}</span>
            </div>
            <div class="theme-name">{{ t.name }}</div>
            <div v-if="theme === t.key" class="theme-tick">✓</div>
          </button>
        </div>
        <div class="row" style="margin-top: 16px; justify-content: flex-end; gap: 8px">
          <button class="btn btn-secondary" @click="step = 2">上一步</button>
          <button class="btn btn-primary" :disabled="submitting" @click="finish">
            {{ submitting ? '保存中…' : '进入应用' }}
          </button>
        </div>
      </div>
    </transition>

    <div class="step-dots" :aria-label="'步骤指示'">
      <span v-for="n in 3" :key="n" class="dot" :class="{ active: step === n }" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '@/stores/settings.js';
import { THEMES } from '@/constants/thresholds.js';

const router = useRouter();
const settings = useSettingsStore();

const step = ref(1);
const nickname = ref('');
const theme = ref('warm');
const error = ref('');
const submitting = ref(false);

const validName = computed(() => {
  const t = nickname.value.trim();
  return t.length >= 2 && t.length <= 20;
});

function onNext() {
  if (!validName.value) {
    error.value = '昵称需 2-20 个字符';
    return;
  }
  error.value = '';
  step.value = 3;
}

async function finish() {
  if (submitting.value) return;
  submitting.value = true;
  try {
    await settings.completeOnboarding({ nickname: nickname.value, theme: theme.value });
    settings.applyTheme();
    router.replace('/');
  } finally {
    submitting.value = false;
  }
}

function themeGradient(key) {
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
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  min-height: 100dvh;
  padding: 24px 16px calc(48px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
  background: linear-gradient(180deg, #fff4e6 0%, #fff8ee 60%, #f0f7ed 100%);
}

.hero {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
}

.logo-circle {
  width: 76px;
  height: 76px;
  border-radius: 24px;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: var(--shadow-primary);
  margin-bottom: 8px;
}

.hero h1 {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-strong);
  letter-spacing: -0.02em;
}

.tagline {
  color: var(--color-text-muted);
  font-size: 14px;
}

.welcome-card,
.card {
  width: 100%;
  max-width: 420px;
  padding: 24px;
}

h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-strong);
  margin-bottom: 12px;
}

.features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0 24px;
}

.features li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--color-text);
}

.features li span {
  font-size: 20px;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.theme-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--color-surface-2);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.theme-card.selected {
  border-color: var(--color-primary);
}

.theme-card:active {
  transform: scale(0.97);
}

.theme-swatch {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.theme-name {
  font-size: 12px;
  font-weight: 500;
}

.theme-tick {
  position: absolute;
  top: 6px;
  right: 8px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-primary);
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border-strong);
}

.dot.active {
  background: var(--color-primary);
  width: 24px;
  border-radius: var(--radius-pill);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
