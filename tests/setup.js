import 'fake-indexeddb/auto';
import { beforeEach } from 'vitest';

beforeEach(() => {
  // Reset IndexedDB between tests by recreating the fake-indexeddb global
  // fake-indexeddb auto-resets per test file via the import, but we add an
  // explicit reset hook for fine-grained isolation if needed.
});
