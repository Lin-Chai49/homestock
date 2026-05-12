import { getDB } from './db.js';
import { CATEGORIES } from '@/constants/categories.js';
import { DEFAULT_LOCATIONS } from '@/constants/locations.js';
import { DEFAULTS, ITEM_STATUS } from '@/constants/thresholds.js';

const SETTINGS_KEY = 'app';

export function defaultSettings() {
  return {
    key: SETTINGS_KEY,
    nickname: '',
    role: '家庭主管',
    familySize: 3,
    address: '',
    theme: 'warm',
    listStyle: 'grid',
    fontSize: 'md',
    dateFormat: 'YYYY-MM-DD',
    defaultSort: 'expiry_asc',
    expiryThresholdDays: DEFAULTS.EXPIRY_THRESHOLD_DAYS,
    defaultMinStockRatio: DEFAULTS.MIN_STOCK_RATIO,
    notifications: {
      expiring: true,
      expired: true,
      lowStock: true,
      shoppingUpdate: true,
      weeklyReport: false,
      monthlySummary: true,
      dndEnabled: true,
    },
    quietHours: { start: '22:00', end: '07:00' },
    onboardedAt: 0,
  };
}

/** Idempotent seeding of categories, locations, default settings */
export async function seedDefaults() {
  const db = await getDB();

  const txCats = db.transaction('categories', 'readwrite');
  for (const c of CATEGORIES) {
    const exists = await txCats.store.get(c.key);
    if (!exists) await txCats.store.put({ ...c });
  }
  await txCats.done;

  const txLocs = db.transaction('locations', 'readwrite');
  for (const l of DEFAULT_LOCATIONS) {
    const exists = await txLocs.store.get(l.id);
    if (!exists) await txLocs.store.put({ ...l, itemCount: 0 });
  }
  await txLocs.done;

  const settings = await db.get('settings', SETTINGS_KEY);
  if (!settings) {
    await db.put('settings', defaultSettings());
  }
}

// ---------------- Items ----------------

export async function addItem(data) {
  const db = await getDB();
  const now = Date.now();
  const record = {
    name: '',
    category: 'other',
    icon: '',
    brand: '',
    spec: '',
    quantity: 1,
    unit: '件',
    locationId: 'kitchen_room',
    purchaseDate: '',
    expiryDate: '',
    price: 0,
    barcode: '',
    imageUrl: '',
    note: '',
    status: ITEM_STATUS.ACTIVE,
    minStock: 1,
    fullStock: 1,
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  if (!record.fullStock || record.fullStock < record.quantity) {
    record.fullStock = record.quantity;
  }
  return db.add('items', record);
}

export async function getItem(id) {
  const db = await getDB();
  return db.get('items', Number(id));
}

export async function updateItem(id, patch) {
  const db = await getDB();
  const existing = await db.get('items', Number(id));
  if (!existing) return null;
  const updated = { ...existing, ...patch, id: existing.id, updatedAt: Date.now() };
  await db.put('items', updated);
  return updated;
}

export async function deleteItem(id) {
  const db = await getDB();
  await db.delete('items', Number(id));
}

export async function getAllItems() {
  const db = await getDB();
  return db.getAll('items');
}

export async function getItemsByCategory(category) {
  const db = await getDB();
  return db.getAllFromIndex('items', 'byCategory', category);
}

export async function getItemsByLocation(locationId) {
  const db = await getDB();
  return db.getAllFromIndex('items', 'byLocation', locationId);
}

export async function getActiveItems() {
  const db = await getDB();
  return db.getAllFromIndex('items', 'byStatus', ITEM_STATUS.ACTIVE);
}

export async function getExpiredItems() {
  const db = await getDB();
  return db.getAllFromIndex('items', 'byStatus', ITEM_STATUS.EXPIRED);
}

/** Reduce item quantity, optionally creating a consumption record */
export async function consumeItem({ id, amount = 1, scene = 'daily', note = '' }) {
  const item = await getItem(id);
  if (!item) return null;
  const remaining = Math.max(0, item.quantity - amount);
  const patch = { quantity: remaining };
  if (remaining === 0) patch.status = ITEM_STATUS.CONSUMED;
  await updateItem(id, patch);
  await addConsumption({
    itemId: item.id,
    itemName: item.name,
    amount: -Math.abs(amount),
    scene,
    note,
    timestamp: Date.now(),
  });
  return { remaining, item };
}

// ---------------- Categories ----------------

export async function getAllCategories() {
  const db = await getDB();
  const list = await db.getAll('categories');
  return list.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

export async function saveCategory(cat) {
  const db = await getDB();
  await db.put('categories', cat);
  return cat;
}

export async function deleteCategory(key) {
  const db = await getDB();
  await db.delete('categories', key);
}

// ---------------- Locations ----------------

export async function getAllLocations() {
  const db = await getDB();
  const list = await db.getAll('locations');
  return list.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
}

export async function saveLocation(loc) {
  const db = await getDB();
  await db.put('locations', loc);
  return loc;
}

export async function deleteLocation(id) {
  const db = await getDB();
  await db.delete('locations', id);
}

// ---------------- Consumptions ----------------

export async function addConsumption(data) {
  const db = await getDB();
  return db.add('consumptions', {
    itemId: 0,
    itemName: '',
    amount: 0,
    scene: 'daily',
    note: '',
    timestamp: Date.now(),
    ...data,
  });
}

export async function getAllConsumptions() {
  const db = await getDB();
  return db.getAll('consumptions');
}

export async function getConsumptionsByItem(itemId) {
  const db = await getDB();
  return db.getAllFromIndex('consumptions', 'byItemId', Number(itemId));
}

export async function getConsumptionsInRange(startTs, endTs) {
  const db = await getDB();
  const range = IDBKeyRange.bound(startTs, endTs);
  return db.getAllFromIndex('consumptions', 'byTimestamp', range);
}

export async function deleteConsumption(id) {
  const db = await getDB();
  await db.delete('consumptions', Number(id));
}

// ---------------- ShoppingList ----------------

export async function addShoppingItem(data) {
  const db = await getDB();
  return db.add('shoppingList', {
    itemName: '',
    category: 'other',
    quantity: 1,
    estimatedPrice: 0,
    recommendStore: '',
    source: 'manual',
    done: false,
    createdAt: Date.now(),
    ...data,
  });
}

export async function updateShoppingItem(id, patch) {
  const db = await getDB();
  const existing = await db.get('shoppingList', Number(id));
  if (!existing) return null;
  const updated = { ...existing, ...patch, id: existing.id };
  await db.put('shoppingList', updated);
  return updated;
}

export async function deleteShoppingItem(id) {
  const db = await getDB();
  await db.delete('shoppingList', Number(id));
}

export async function getAllShopping() {
  const db = await getDB();
  return db.getAll('shoppingList');
}

export async function markShoppingDone(id, done = true) {
  return updateShoppingItem(id, { done });
}

// ---------------- Settings ----------------

export async function getSettings() {
  const db = await getDB();
  const existing = await db.get('settings', SETTINGS_KEY);
  return existing || defaultSettings();
}

export async function saveSettings(patch) {
  const db = await getDB();
  const existing = (await db.get('settings', SETTINGS_KEY)) || defaultSettings();
  const merged = {
    ...existing,
    ...patch,
    key: SETTINGS_KEY,
    notifications: { ...existing.notifications, ...(patch.notifications || {}) },
    quietHours: { ...existing.quietHours, ...(patch.quietHours || {}) },
  };
  await db.put('settings', merged);
  return merged;
}

// ---------------- Bulk / Backup ----------------

export async function exportAll() {
  const db = await getDB();
  const [items, categories, locations, consumptions, shoppingList, settings] = await Promise.all([
    db.getAll('items'),
    db.getAll('categories'),
    db.getAll('locations'),
    db.getAll('consumptions'),
    db.getAll('shoppingList'),
    db.getAll('settings'),
  ]);
  return {
    schema: 'HomeStockDB',
    version: 1,
    exportedAt: new Date().toISOString(),
    items,
    categories,
    locations,
    consumptions,
    shoppingList,
    settings,
  };
}

export async function importAll(json) {
  if (!json || json.schema !== 'HomeStockDB') {
    throw new Error('备份文件格式不正确');
  }
  const db = await getDB();
  const tx = db.transaction(
    ['items', 'categories', 'locations', 'consumptions', 'shoppingList', 'settings'],
    'readwrite',
  );
  await Promise.all([
    tx.objectStore('items').clear(),
    tx.objectStore('categories').clear(),
    tx.objectStore('locations').clear(),
    tx.objectStore('consumptions').clear(),
    tx.objectStore('shoppingList').clear(),
    tx.objectStore('settings').clear(),
  ]);
  for (const i of json.items || []) await tx.objectStore('items').put(i);
  for (const c of json.categories || []) await tx.objectStore('categories').put(c);
  for (const l of json.locations || []) await tx.objectStore('locations').put(l);
  for (const co of json.consumptions || []) await tx.objectStore('consumptions').put(co);
  for (const s of json.shoppingList || []) await tx.objectStore('shoppingList').put(s);
  for (const st of json.settings || []) await tx.objectStore('settings').put(st);
  await tx.done;
}

/** Clear all user data; keeps default categories + locations + settings */
export async function clearUserData() {
  const db = await getDB();
  const tx = db.transaction(['items', 'consumptions', 'shoppingList'], 'readwrite');
  await Promise.all([
    tx.objectStore('items').clear(),
    tx.objectStore('consumptions').clear(),
    tx.objectStore('shoppingList').clear(),
  ]);
  await tx.done;
}

export async function bulkAddItems(items) {
  const db = await getDB();
  const tx = db.transaction('items', 'readwrite');
  for (const it of items) {
    const now = it.createdAt || Date.now();
    await tx.store.add({
      status: ITEM_STATUS.ACTIVE,
      unit: '件',
      minStock: 1,
      fullStock: it.quantity || 1,
      createdAt: now,
      updatedAt: now,
      ...it,
    });
  }
  await tx.done;
}

export async function bulkAddConsumptions(records) {
  const db = await getDB();
  const tx = db.transaction('consumptions', 'readwrite');
  for (const r of records) {
    await tx.store.add({ timestamp: Date.now(), scene: 'daily', ...r });
  }
  await tx.done;
}
