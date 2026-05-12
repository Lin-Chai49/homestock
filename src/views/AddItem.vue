<template>
  <div>
    <AppBar title="入库登记" subtitle="登记新购物资，自动计算效期" icon="➕" back />

    <div class="app-container">
      <section class="card">
        <div class="card-header"><h2 class="card-title">📦 选择类别</h2></div>
        <div class="cat-grid">
          <button
            v-for="cat in categories.enabled"
            :key="cat.key"
            class="cat-btn"
            :class="{ active: form.category === cat.key }"
            @click="form.category = cat.key; form.icon = cat.icon"
          >
            <span class="cat-icon-big" :style="{ background: cat.color }">{{ cat.icon }}</span>
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">📝 物品信息</h2></div>

        <div class="field">
          <label class="field-label">物品名称 <span class="text-danger">*</span></label>
          <input
            v-model="form.name"
            class="input"
            :class="{ error: errors.name }"
            placeholder="如：伊利纯牛奶 250ml"
            maxlength="60"
          />
          <span v-if="errors.name" class="field-error">{{ errors.name }}</span>
        </div>

        <div class="grid two">
          <div class="field">
            <label class="field-label">品牌</label>
            <input v-model="form.brand" class="input" placeholder="伊利" maxlength="30" />
          </div>
          <div class="field">
            <label class="field-label">规格</label>
            <input v-model="form.spec" class="input" placeholder="250ml × 12 盒" maxlength="40" />
          </div>
        </div>

        <div class="grid three">
          <div class="field">
            <label class="field-label">数量 <span class="text-danger">*</span></label>
            <div class="stepper">
              <button class="step-btn" @click="form.quantity = Math.max(0, form.quantity - 1)">−</button>
              <input v-model.number="form.quantity" type="number" min="0" class="input step-input" />
              <button class="step-btn" @click="form.quantity = form.quantity + 1">+</button>
            </div>
          </div>
          <div class="field">
            <label class="field-label">单位</label>
            <select v-model="form.unit" class="select">
              <option v-for="u in UNITS" :key="u" :value="u">{{ u }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">最低库存</label>
            <input v-model.number="form.minStock" type="number" min="0" class="input" />
          </div>
        </div>

        <div class="grid two">
          <div class="field">
            <label class="field-label">购买日期</label>
            <input v-model="form.purchaseDate" type="date" class="input" />
          </div>
          <div class="field">
            <label class="field-label">到期日期 <span class="text-danger">*</span></label>
            <input
              v-model="form.expiryDate"
              type="date"
              class="input"
              :class="{ error: errors.expiryDate || warnExpiry }"
            />
          </div>
        </div>

        <div v-if="warnExpiry" class="warn-banner">
          ⚠️ 注意：到期日期距离今天仅 {{ daysUntil }} 天，建议尽快使用或加入购物清单替换。
        </div>

        <div class="field">
          <label class="field-label">购买金额 (¥)</label>
          <input v-model.number="form.price" type="number" step="0.01" min="0" class="input" placeholder="48.00" />
        </div>

        <div class="field">
          <label class="field-label">备注</label>
          <textarea
            v-model="form.note"
            class="textarea"
            rows="2"
            placeholder="如：特价 8.5 折 / 经孩子早餐用"
            maxlength="200"
          />
        </div>
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">📍 存放位置</h2></div>
        <div class="loc-grid">
          <button
            v-for="loc in locations.enabled"
            :key="loc.id"
            class="loc-btn"
            :class="{ active: form.locationId === loc.id }"
            @click="form.locationId = loc.id"
          >
            <span class="loc-icon-small" :style="{ background: loc.color }">{{ loc.icon }}</span>
            <span class="loc-btn-name">{{ loc.name }}</span>
          </button>
        </div>
      </section>

      <section class="card">
        <div class="card-header"><h2 class="card-title">⚡ 快捷模板</h2></div>
        <div class="grid two-cols">
          <button v-for="t in TEMPLATES" :key="t.key" class="tpl-card" @click="applyTemplate(t)">
            <span class="tpl-icon">{{ t.icon }}</span>
            <div>
              <div class="strong">{{ t.name }}</div>
              <div class="text-muted small">{{ t.hint }}</div>
            </div>
          </button>
        </div>
      </section>

      <section v-if="smartHints.length > 0" class="card">
        <div class="card-header"><h2 class="card-title">💡 智能建议</h2></div>
        <ul class="hints">
          <li v-for="(h, i) in smartHints" :key="i"><span aria-hidden="true">✓</span> {{ h }}</li>
        </ul>
      </section>

      <div class="submit-row">
        <button class="btn btn-secondary" @click="$router.back()">取消</button>
        <button class="btn btn-primary flex-1" :disabled="!canSubmit || submitting" @click="submit">
          {{ submitting ? '保存中…' : '✓ 确认入库' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import AppBar from '@/components/layout/AppBar.vue';
import { useCategoriesStore } from '@/stores/categories.js';
import { useLocationsStore } from '@/stores/locations.js';
import { useItemsStore } from '@/stores/items.js';
import { useSettingsStore } from '@/stores/settings.js';
import { daysUntilExpiry, daysFromNow, today } from '@/services/dateService.js';
import { toast } from '@/utils/toast.js';

const router = useRouter();
const categories = useCategoriesStore();
const locations = useLocationsStore();
const items = useItemsStore();
const settings = useSettingsStore();

const UNITS = ['盒', '瓶', '袋', '枚', '件', '颗', '罐', '杯', '支', '提', '克', '毫升', '包'];

const TEMPLATES = [
  { key: 'dairy', name: '乳制品', icon: '🥛', hint: '冷藏 7-14 天', category: 'food', locationId: 'fridge_cool', expiryDays: 14, unit: '盒' },
  { key: 'fruit', name: '蔬果', icon: '🍎', hint: '冷藏 5-10 天', category: 'food', locationId: 'fridge_cool', expiryDays: 7, unit: '个' },
  { key: 'bakery', name: '烘焙', icon: '🍞', hint: '常温 3-5 天', category: 'food', locationId: 'kitchen_room', expiryDays: 4, unit: '袋' },
  { key: 'medicine', name: '药品', icon: '💊', hint: '阴凉处保存', category: 'drug', locationId: 'medicine_box', expiryDays: 365, unit: '盒' },
];

const form = reactive({
  name: '',
  category: 'food',
  icon: '🍎',
  brand: '',
  spec: '',
  quantity: 1,
  unit: '盒',
  locationId: 'fridge_cool',
  purchaseDate: today(),
  expiryDate: daysFromNow(14),
  price: 0,
  minStock: 1,
  note: '',
});

const errors = reactive({ name: '', expiryDate: '' });
const submitting = ref(false);

const daysUntil = computed(() => daysUntilExpiry(form.expiryDate));
const warnExpiry = computed(
  () => Number.isFinite(daysUntil.value) && daysUntil.value <= 7 && daysUntil.value >= 0,
);

const smartHints = computed(() => {
  if (!form.locationId) return [];
  const sample = items.list.filter((i) => i.category === form.category).slice(-5);
  const hints = [];
  const loc = locations.byId(form.locationId);
  if (loc) hints.push(`系统记忆：${form.name || '此类物品'}建议存放在 ${loc.name}`);
  if (sample.length > 0) {
    const avg = Math.round(
      sample.reduce((acc, s) => acc + Math.max(daysUntilExpiry(s.expiryDate) || 0, 0), 0) /
        sample.length,
    );
    hints.push(`有效期：${form.brand ? form.brand + ' ' : ''}该类别通常约 ${avg} 天，请核对包装`);
  }
  hints.push(`临期提醒：将于过期前 ${settings.data.expiryThresholdDays} 天自动通知`);
  if (form.quantity >= 5) hints.push(`本次购买 ${form.quantity} ${form.unit}，注意均匀消耗避免浪费`);
  return hints;
});

const canSubmit = computed(() => form.name.trim().length > 0 && form.expiryDate);

function applyTemplate(t) {
  form.category = t.category;
  form.locationId = t.locationId;
  form.unit = t.unit;
  form.expiryDate = daysFromNow(t.expiryDays);
  const cat = categories.byKey(t.category);
  if (cat) form.icon = cat.icon;
  toast(`已应用：${t.name}`);
}

async function submit() {
  errors.name = '';
  errors.expiryDate = '';
  if (form.name.trim().length === 0) {
    errors.name = '请输入物品名称';
    return;
  }
  if (!form.expiryDate) {
    errors.expiryDate = '请填写到期日期';
    return;
  }
  if (submitting.value) return;
  submitting.value = true;
  try {
    await items.add({
      ...form,
      name: form.name.trim(),
      brand: form.brand.trim(),
      spec: form.spec.trim(),
      note: form.note.trim(),
      fullStock: form.quantity,
    });
    toast('入库成功 ✓');
    router.replace('/items');
  } catch (e) {
    toast('保存失败：' + (e?.message || ''));
  } finally {
    submitting.value = false;
  }
}

onMounted(async () => {
  await Promise.all([categories.loadAll(), locations.loadAll(), items.loadAll()]);
});
</script>

<style scoped>
.card {
  margin-bottom: 16px;
}

.cat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.cat-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 6px;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  border: 2px solid transparent;
  transition: border-color 0.15s ease, transform 0.15s ease;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text);
}

.cat-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.cat-icon-big {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #fff;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 12px;
}

.field-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.grid.two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.grid.three {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.stepper {
  display: grid;
  grid-template-columns: 36px 1fr 36px;
  gap: 4px;
}

.step-btn {
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 18px;
  font-weight: 700;
}

.step-input {
  text-align: center;
}

.warn-banner {
  background: var(--color-warning-soft);
  color: var(--color-warning);
  padding: 10px 12px;
  border-radius: var(--radius-md);
  font-size: 12px;
  margin: 8px 0 12px;
  font-weight: 600;
}

.loc-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

@media (min-width: 540px) {
  .loc-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.loc-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  font-size: 12px;
  color: var(--color-text);
}

.loc-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.loc-icon-small {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
}

.loc-btn-name {
  font-weight: 500;
}

.grid.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.tpl-card {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: var(--color-surface-2);
  border-radius: var(--radius-md);
  text-align: left;
  border: 1px solid transparent;
  transition: border-color 0.15s ease;
}

.tpl-card:active {
  border-color: var(--color-primary);
}

.tpl-icon {
  font-size: 22px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
}

.hints {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
  color: var(--color-text);
}

.hints li {
  display: flex;
  gap: 6px;
}

.hints li span {
  color: var(--color-success);
  font-weight: 700;
}

.submit-row {
  display: flex;
  gap: 8px;
  position: sticky;
  bottom: calc(64px + env(safe-area-inset-bottom));
  padding-top: 8px;
}

.small {
  font-size: 11px;
}

.strong {
  font-weight: 600;
  color: var(--color-text-strong);
}
</style>
