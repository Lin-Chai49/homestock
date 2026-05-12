/**
 * Expiry classification thresholds (days from today)
 * Used by classifyExpiry(daysUntil) — boundaries are inclusive on lower bound.
 *   days < 0          → 'expired'
 *   0 <= days <= 2    → 'urgent'
 *   3 <= days <= 7    → 'warning'
 *   8 <= days <= 30   → 'info'
 *   days > 30         → 'fresh'
 */
export const EXPIRY_LEVELS = Object.freeze({
  URGENT_MAX: 2,
  WARNING_MAX: 7,
  INFO_MAX: 30,
});

/** Settings defaults */
export const DEFAULTS = Object.freeze({
  EXPIRY_THRESHOLD_DAYS: 3,
  MIN_STOCK_RATIO: 0.2,
  AUTO_BUY_DAYS_TO_EMPTY: 7,
  CONSUMPTION_AVERAGE_WINDOW_DAYS: 30,
});

/** Recommended stores per category — used by auto shopping list */
export const STORE_ROUTING = Object.freeze({
  food: '盒马生鲜',
  cond: '盒马生鲜',
  can: '盒马生鲜',
  daily: '京东超市',
  clean: '京东超市',
  drug: '京东大药房',
  drink: '永辉超市',
  other: '永辉超市',
});

/** Item status values */
export const ITEM_STATUS = Object.freeze({
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CONSUMED: 'consumed',
  DISCARDED: 'discarded',
});

/** Consumption scenes */
export const CONSUMPTION_SCENES = Object.freeze([
  { key: 'breakfast', name: '早餐', icon: '🌅' },
  { key: 'morning', name: '上午', icon: '☀️' },
  { key: 'lunch', name: '午餐', icon: '🍱' },
  { key: 'afternoon', name: '下午', icon: '🌤️' },
  { key: 'dinner', name: '晚餐', icon: '🌆' },
  { key: 'night', name: '睡前', icon: '🌙' },
  { key: 'daily', name: '日常', icon: '✨' },
]);

/** Theme keys */
export const THEMES = Object.freeze([
  { key: 'warm', name: '家居暖色', icon: '🏡', primary: '#FF6B35' },
  { key: 'dark', name: '深色模式', icon: '🌙', primary: '#FF7E47' },
  { key: 'fresh', name: '清新自然', icon: '🌿', primary: '#7FB069' },
]);

/** List style options */
export const LIST_STYLES = Object.freeze([
  { key: 'grid', name: '货架式' },
  { key: 'list', name: '列表式' },
  { key: 'compact', name: '紧凑式' },
]);

/** Sort options */
export const SORT_OPTIONS = Object.freeze([
  { key: 'expiry_asc', name: '到期日（升序）' },
  { key: 'expiry_desc', name: '到期日（降序）' },
  { key: 'name', name: '名称' },
  { key: 'qty_desc', name: '数量（多→少）' },
  { key: 'updated_desc', name: '最近更新' },
]);
