import dayjs from 'dayjs';
import { DEFAULTS, STORE_ROUTING, ITEM_STATUS } from '@/constants/thresholds.js';
import { daysUntilExpiry, classifyExpiry } from './dateService.js';

/**
 * Average daily consumption from the last N days of consumption records.
 * `consumptions` are objects with negative `amount` meaning decrease and `timestamp` (ms).
 */
export function averageDailyConsumption(consumptions, windowDays = DEFAULTS.CONSUMPTION_AVERAGE_WINDOW_DAYS) {
  if (!Array.isArray(consumptions) || consumptions.length === 0) return 0;
  const cutoff = dayjs().subtract(windowDays, 'day').valueOf();
  let totalUsed = 0;
  for (const c of consumptions) {
    if (c.timestamp >= cutoff) {
      totalUsed += Math.abs(c.amount || 0);
    }
  }
  return totalUsed / windowDays;
}

/**
 * Predict days until inventory is empty given current quantity and consumption history.
 * Returns Infinity when no consumption recorded.
 */
export function predictDaysToEmpty(currentQty, consumptions, windowDays = DEFAULTS.CONSUMPTION_AVERAGE_WINDOW_DAYS) {
  const avg = averageDailyConsumption(consumptions, windowDays);
  if (avg <= 0) return Infinity;
  return currentQty / avg;
}

/**
 * Stock ratio: currentQty / fullStock, clamped 0..1
 */
export function stockRatio(item) {
  if (!item) return 0;
  const full = Math.max(item.fullStock || item.quantity || 0, 1);
  return Math.max(0, Math.min(1, (item.quantity || 0) / full));
}

/**
 * Decide whether an item should be auto-added to the shopping list.
 */
export function shouldAutoBuy(item, consumptions) {
  if (!item || item.status !== ITEM_STATUS.ACTIVE) return false;
  const minStock = item.minStock ?? 1;
  if ((item.quantity ?? 0) <= minStock) return true;
  const days = predictDaysToEmpty(item.quantity ?? 0, consumptions);
  return days < DEFAULTS.AUTO_BUY_DAYS_TO_EMPTY && Number.isFinite(days);
}

export function recommendStore(category) {
  return STORE_ROUTING[category] || STORE_ROUTING.other;
}

/** Group consumptions into a 6-bin daily time-of-day histogram */
export function consumptionByTimeOfDay(consumptions) {
  const bins = {
    breakfast: 0,
    morning: 0,
    lunch: 0,
    afternoon: 0,
    dinner: 0,
    night: 0,
    daily: 0,
  };
  for (const c of consumptions) {
    if (bins[c.scene] !== undefined) bins[c.scene]++;
  }
  return bins;
}

/** Top N most-consumed items by abs(amount) within window */
export function topConsumed(consumptions, items, n = 5, windowDays = 30) {
  const cutoff = dayjs().subtract(windowDays, 'day').valueOf();
  const map = new Map();
  for (const c of consumptions) {
    if (c.timestamp < cutoff) continue;
    const key = c.itemId;
    const cur = map.get(key) || { itemId: key, itemName: c.itemName, count: 0, total: 0 };
    cur.count += 1;
    cur.total += Math.abs(c.amount || 0);
    map.set(key, cur);
  }
  // Optional enrichment with current item icon
  const itemById = new Map((items || []).map((it) => [it.id, it]));
  const list = [...map.values()].map((r) => ({
    ...r,
    icon: itemById.get(r.itemId)?.icon || '📦',
    category: itemById.get(r.itemId)?.category || 'other',
  }));
  return list.sort((a, b) => b.count - a.count).slice(0, n);
}

/** Sum waste = sum of price across expired items in optional window */
export function calculateWaste(items, { sinceDays } = {}) {
  const cutoff = sinceDays ? dayjs().subtract(sinceDays, 'day').valueOf() : 0;
  let amount = 0;
  let count = 0;
  for (const it of items) {
    if (it.status !== ITEM_STATUS.EXPIRED) continue;
    if (cutoff && (it.updatedAt || 0) < cutoff) continue;
    amount += Number(it.price || 0);
    count += 1;
  }
  return { amount, count };
}

/** Waste rate = wasted price / total price held */
export function wasteRate(items, { sinceDays } = {}) {
  const { amount } = calculateWaste(items, { sinceDays });
  const cutoff = sinceDays ? dayjs().subtract(sinceDays, 'day').valueOf() : 0;
  let total = 0;
  for (const it of items) {
    if (cutoff && (it.createdAt || 0) < cutoff) continue;
    total += Number(it.price || 0);
  }
  if (total <= 0) return 0;
  return amount / total;
}

/** Computed view of an item: days, classification, ratio */
export function decorateItem(item) {
  const days = daysUntilExpiry(item.expiryDate);
  const status = classifyExpiry(days);
  return {
    ...item,
    daysUntilExpiry: days,
    expiryStatus: status,
    stockRatio: stockRatio(item),
  };
}

/** Monthly spend per category over the last N months */
export function spendByCategoryByMonth(items, monthsBack = 6) {
  const start = dayjs().subtract(monthsBack - 1, 'month').startOf('month');
  const months = [];
  for (let i = 0; i < monthsBack; i++) {
    months.push(start.add(i, 'month').format('YYYY-MM'));
  }
  const byMonth = new Map(months.map((m) => [m, 0]));
  const byCategory = new Map();
  for (const it of items) {
    if (!it.purchaseDate) continue;
    const m = dayjs(it.purchaseDate).format('YYYY-MM');
    if (byMonth.has(m)) byMonth.set(m, byMonth.get(m) + Number(it.price || 0));
    byCategory.set(it.category, (byCategory.get(it.category) || 0) + Number(it.price || 0));
  }
  return {
    months,
    monthly: months.map((m) => ({ month: m, total: byMonth.get(m) })),
    byCategory: [...byCategory.entries()].map(([category, total]) => ({ category, total })),
  };
}

/** Efficiency grade A-D based on waste rate */
export function efficiencyGrade(rate) {
  if (rate < 0.03) return 'A';
  if (rate < 0.08) return 'B';
  if (rate < 0.15) return 'C';
  return 'D';
}

/** Heuristic waste reason classifier */
export function wasteReasons(expiredItems) {
  const total = expiredItems.length || 1;
  let forgotten = 0;
  let overbought = 0;
  let tasteChange = 0;
  for (const it of expiredItems) {
    if ((it.quantity || 0) >= (it.fullStock || 1) * 0.5) overbought++;
    else if (it.category === 'food' || it.category === 'cond') forgotten++;
    else tasteChange++;
  }
  return [
    { key: 'forgotten', label: '遗忘存放', percent: forgotten / total },
    { key: 'overbought', label: '购买过多', percent: overbought / total },
    { key: 'taste', label: '口味变化', percent: tasteChange / total },
  ];
}
