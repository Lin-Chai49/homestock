import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import dayjs from 'dayjs';
import {
  averageDailyConsumption,
  predictDaysToEmpty,
  stockRatio,
  shouldAutoBuy,
  recommendStore,
  consumptionByTimeOfDay,
  topConsumed,
  calculateWaste,
  wasteRate,
  efficiencyGrade,
  decorateItem,
} from '@/services/algorithmService.js';

const NOW = new Date('2026-05-13T12:00:00');

describe('algorithmService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('averageDailyConsumption', () => {
    it('returns 0 for empty list', () => {
      expect(averageDailyConsumption([])).toBe(0);
    });
    it('ignores consumptions before window', () => {
      const old = dayjs(NOW).subtract(60, 'day').valueOf();
      expect(averageDailyConsumption([{ amount: -100, timestamp: old }], 30)).toBe(0);
    });
    it('averages over window', () => {
      const ts = dayjs(NOW).subtract(5, 'day').valueOf();
      const list = [
        { amount: -2, timestamp: ts },
        { amount: -3, timestamp: ts },
      ];
      // 5 used over 30 days = 0.1667
      expect(averageDailyConsumption(list, 30)).toBeCloseTo(5 / 30);
    });
  });

  describe('predictDaysToEmpty', () => {
    it('Infinity when no consumption', () => {
      expect(predictDaysToEmpty(10, [])).toBe(Infinity);
    });
    it('quantity / dailyAvg', () => {
      const ts = dayjs(NOW).subtract(1, 'day').valueOf();
      const cons = [{ amount: -30, timestamp: ts }];
      // avg = 30/30 = 1, qty=10 → 10 days
      expect(predictDaysToEmpty(10, cons)).toBeCloseTo(10);
    });
  });

  describe('stockRatio', () => {
    it('half', () => {
      expect(stockRatio({ quantity: 5, fullStock: 10 })).toBe(0.5);
    });
    it('clamps to 1', () => {
      expect(stockRatio({ quantity: 20, fullStock: 10 })).toBe(1);
    });
    it('clamps to 0', () => {
      expect(stockRatio({ quantity: -5, fullStock: 10 })).toBe(0);
    });
    it('null safe', () => {
      expect(stockRatio(null)).toBe(0);
    });
  });

  describe('shouldAutoBuy', () => {
    const baseItem = { status: 'active', quantity: 10, minStock: 2, fullStock: 10 };
    it('triggers when below minStock', () => {
      expect(shouldAutoBuy({ ...baseItem, quantity: 2 }, [])).toBe(true);
    });
    it('triggers when daysToEmpty < 7', () => {
      const ts = dayjs(NOW).subtract(1, 'day').valueOf();
      const cons = [{ amount: -150, timestamp: ts }]; // avg 5/day
      // qty 10 → 2 days
      expect(shouldAutoBuy(baseItem, cons)).toBe(true);
    });
    it('does not trigger when stocked + no consumption', () => {
      expect(shouldAutoBuy(baseItem, [])).toBe(false);
    });
    it('does not trigger for inactive', () => {
      expect(shouldAutoBuy({ ...baseItem, status: 'expired', quantity: 0 }, [])).toBe(false);
    });
  });

  describe('recommendStore', () => {
    it('food → 盒马生鲜', () => {
      expect(recommendStore('food')).toBe('盒马生鲜');
    });
    it('drug → 京东大药房', () => {
      expect(recommendStore('drug')).toBe('京东大药房');
    });
    it('daily → 京东超市', () => {
      expect(recommendStore('daily')).toBe('京东超市');
    });
    it('unknown → fallback', () => {
      expect(recommendStore('xyz')).toBeTruthy();
    });
  });

  describe('consumptionByTimeOfDay', () => {
    it('bins per scene', () => {
      const bins = consumptionByTimeOfDay([
        { scene: 'breakfast', amount: -1 },
        { scene: 'breakfast', amount: -1 },
        { scene: 'dinner', amount: -1 },
      ]);
      expect(bins.breakfast).toBe(2);
      expect(bins.dinner).toBe(1);
      expect(bins.lunch).toBe(0);
    });
  });

  describe('topConsumed', () => {
    it('sorts by count desc and truncates', () => {
      const ts = dayjs(NOW).subtract(1, 'day').valueOf();
      const cons = [
        { itemId: 1, itemName: 'Milk', amount: -1, timestamp: ts },
        { itemId: 1, itemName: 'Milk', amount: -1, timestamp: ts },
        { itemId: 2, itemName: 'Eggs', amount: -3, timestamp: ts },
      ];
      const top = topConsumed(cons, [], 5);
      expect(top[0].itemName).toBe('Milk');
      expect(top[0].count).toBe(2);
    });
  });

  describe('calculateWaste', () => {
    it('sums price for expired', () => {
      const items = [
        { status: 'expired', price: 10 },
        { status: 'expired', price: 20 },
        { status: 'active', price: 100 },
      ];
      expect(calculateWaste(items)).toEqual({ amount: 30, count: 2 });
    });
  });

  describe('wasteRate', () => {
    it('0 when nothing held', () => {
      expect(wasteRate([])).toBe(0);
    });
    it('ratio of waste to total', () => {
      const items = [
        { status: 'expired', price: 10 },
        { status: 'active', price: 90 },
      ];
      expect(wasteRate(items)).toBe(0.1);
    });
  });

  describe('efficiencyGrade', () => {
    it('A < 3%', () => {
      expect(efficiencyGrade(0.01)).toBe('A');
    });
    it('B 3-8%', () => {
      expect(efficiencyGrade(0.05)).toBe('B');
    });
    it('C 8-15%', () => {
      expect(efficiencyGrade(0.1)).toBe('C');
    });
    it('D >= 15%', () => {
      expect(efficiencyGrade(0.2)).toBe('D');
    });
  });

  describe('decorateItem', () => {
    it('attaches days + status', () => {
      const decorated = decorateItem({
        name: 'Milk',
        expiryDate: '2026-05-20',
        quantity: 5,
        fullStock: 10,
      });
      expect(decorated.daysUntilExpiry).toBe(7);
      expect(decorated.expiryStatus).toBe('warning');
      expect(decorated.stockRatio).toBe(0.5);
    });
  });
});
