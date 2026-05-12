import { openDB } from 'idb';

const DB_NAME = 'HomeStockDB';
const DB_VERSION = 1;

let dbPromise = null;

export async function initDatabase() {
  if (dbPromise) return dbPromise;
  dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('items')) {
        const items = db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
        items.createIndex('byCategory', 'category');
        items.createIndex('byExpiry', 'expiryDate');
        items.createIndex('byLocation', 'locationId');
        items.createIndex('byStatus', 'status');
        items.createIndex('byUpdatedAt', 'updatedAt');
      }
      if (!db.objectStoreNames.contains('categories')) {
        const cats = db.createObjectStore('categories', { keyPath: 'key' });
        cats.createIndex('bySortOrder', 'sortOrder');
      }
      if (!db.objectStoreNames.contains('locations')) {
        const locs = db.createObjectStore('locations', { keyPath: 'id' });
        locs.createIndex('bySortOrder', 'sortOrder');
      }
      if (!db.objectStoreNames.contains('consumptions')) {
        const cons = db.createObjectStore('consumptions', {
          keyPath: 'id',
          autoIncrement: true,
        });
        cons.createIndex('byItemId', 'itemId');
        cons.createIndex('byTimestamp', 'timestamp');
      }
      if (!db.objectStoreNames.contains('shoppingList')) {
        const shop = db.createObjectStore('shoppingList', {
          keyPath: 'id',
          autoIncrement: true,
        });
        shop.createIndex('byDone', 'done');
        shop.createIndex('byCreatedAt', 'createdAt');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    },
  });
  return dbPromise;
}

export async function getDB() {
  if (!dbPromise) await initDatabase();
  return dbPromise;
}

// Test helper — reset DB instance (also exposed for code-level "clear all data")
export function _resetDbInstance() {
  dbPromise = null;
}

export async function deleteDatabase() {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
  }
  dbPromise = null;
  await new Promise((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}
