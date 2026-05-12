import { describe, it, expect, beforeEach } from 'vitest';
import { deleteDatabase, initDatabase } from '@/services/db.js';
import {
  seedDefaults,
  addItem,
  getItem,
  updateItem,
  deleteItem,
  getAllItems,
  getItemsByCategory,
  getActiveItems,
  getAllCategories,
  getAllLocations,
  addConsumption,
  getConsumptionsByItem,
  addShoppingItem,
  getAllShopping,
  markShoppingDone,
  getSettings,
  saveSettings,
  exportAll,
  importAll,
  consumeItem,
  clearUserData,
} from '@/services/storageService.js';

describe('storageService', () => {
  beforeEach(async () => {
    await deleteDatabase();
    await initDatabase();
    await seedDefaults();
  });

  it('seeds 8 categories and 12 locations on first run', async () => {
    const cats = await getAllCategories();
    const locs = await getAllLocations();
    expect(cats).toHaveLength(8);
    expect(locs).toHaveLength(12);
  });

  it('seed is idempotent', async () => {
    await seedDefaults();
    await seedDefaults();
    const cats = await getAllCategories();
    expect(cats).toHaveLength(8);
  });

  it('addItem assigns auto id and updatedAt', async () => {
    const id = await addItem({ name: 'Milk', category: 'food', quantity: 12 });
    expect(id).toBeTruthy();
    const item = await getItem(id);
    expect(item.name).toBe('Milk');
    expect(item.quantity).toBe(12);
    expect(item.updatedAt).toBeGreaterThan(0);
  });

  it('updateItem refreshes updatedAt', async () => {
    const id = await addItem({ name: 'Milk', category: 'food', quantity: 12 });
    const before = await getItem(id);
    await new Promise((r) => setTimeout(r, 5));
    const updated = await updateItem(id, { quantity: 10 });
    expect(updated.quantity).toBe(10);
    expect(updated.updatedAt).toBeGreaterThanOrEqual(before.updatedAt);
  });

  it('deleteItem removes', async () => {
    const id = await addItem({ name: 'Milk', category: 'food' });
    await deleteItem(id);
    const removed = await getItem(id);
    expect(removed).toBeUndefined();
  });

  it('getItemsByCategory returns only matching', async () => {
    await addItem({ name: 'Milk', category: 'food' });
    await addItem({ name: 'Vitamin', category: 'drug' });
    const food = await getItemsByCategory('food');
    expect(food).toHaveLength(1);
    expect(food[0].name).toBe('Milk');
  });

  it('getActiveItems excludes expired', async () => {
    await addItem({ name: 'Milk', category: 'food', status: 'active' });
    await addItem({ name: 'Old', category: 'food', status: 'expired' });
    const active = await getActiveItems();
    expect(active).toHaveLength(1);
  });

  it('consumeItem decreases quantity and writes consumption', async () => {
    const id = await addItem({ name: 'Milk', category: 'food', quantity: 5 });
    const result = await consumeItem({ id, amount: 2, scene: 'breakfast' });
    expect(result.remaining).toBe(3);
    const cons = await getConsumptionsByItem(id);
    expect(cons).toHaveLength(1);
    expect(cons[0].amount).toBe(-2);
  });

  it('consumeItem to zero marks consumed', async () => {
    const id = await addItem({ name: 'Milk', category: 'food', quantity: 1 });
    await consumeItem({ id, amount: 1 });
    const item = await getItem(id);
    expect(item.status).toBe('consumed');
  });

  it('addConsumption + getConsumptionsByItem', async () => {
    await addConsumption({ itemId: 99, itemName: 'X', amount: -1 });
    const list = await getConsumptionsByItem(99);
    expect(list).toHaveLength(1);
  });

  it('shopping list CRUD', async () => {
    const id = await addShoppingItem({ itemName: 'Eggs', estimatedPrice: 12 });
    const all = await getAllShopping();
    expect(all).toHaveLength(1);
    expect(all[0].done).toBe(false);
    await markShoppingDone(id, true);
    const after = await getAllShopping();
    expect(after[0].done).toBe(true);
  });

  it('settings has defaults', async () => {
    const s = await getSettings();
    expect(s.nickname).toBe('');
    expect(s.theme).toBe('warm');
    expect(s.notifications.expiring).toBe(true);
  });

  it('saveSettings deep-merges notifications', async () => {
    await saveSettings({ nickname: '柴琳', notifications: { weeklyReport: true } });
    const s = await getSettings();
    expect(s.nickname).toBe('柴琳');
    expect(s.notifications.weeklyReport).toBe(true);
    expect(s.notifications.expiring).toBe(true);
  });

  it('export then import round-trips items', async () => {
    await addItem({ name: 'Milk', category: 'food', quantity: 5 });
    const dump = await exportAll();
    expect(dump.items).toHaveLength(1);

    await deleteDatabase();
    await initDatabase();
    await seedDefaults();
    expect((await getAllItems()).length).toBe(0);

    await importAll(dump);
    const items = await getAllItems();
    expect(items).toHaveLength(1);
    expect(items[0].name).toBe('Milk');
  });

  it('importAll rejects malformed payload', async () => {
    await expect(importAll({ foo: 'bar' })).rejects.toThrow();
  });

  it('clearUserData preserves categories + locations', async () => {
    await addItem({ name: 'A', category: 'food' });
    await clearUserData();
    expect(await getAllItems()).toHaveLength(0);
    expect(await getAllCategories()).toHaveLength(8);
    expect(await getAllLocations()).toHaveLength(12);
  });
});
