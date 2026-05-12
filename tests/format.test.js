import { describe, it, expect } from 'vitest';
import {
  formatMoney,
  formatQty,
  formatPercent,
  truncate,
  pluralize,
  formatDateTime,
} from '@/utils/format.js';

describe('format', () => {
  describe('formatMoney', () => {
    it('zero', () => {
      expect(formatMoney(0)).toBe('¥0.00');
    });
    it('integer', () => {
      expect(formatMoney(48)).toBe('¥48.00');
    });
    it('thousands separator', () => {
      expect(formatMoney(1234.5)).toBe('¥1,234.50');
    });
    it('negative', () => {
      expect(formatMoney(-50)).toBe('-¥50.00');
    });
    it('null safe', () => {
      expect(formatMoney(null)).toBe('¥0.00');
    });
    it('omits symbol', () => {
      expect(formatMoney(48, { symbol: false })).toBe('48.00');
    });
  });

  describe('formatQty', () => {
    it('with unit', () => {
      expect(formatQty(12, '盒')).toBe('12 盒');
    });
    it('without unit', () => {
      expect(formatQty(12)).toBe('12');
    });
    it('null safe', () => {
      expect(formatQty(null, '盒')).toBe('0 盒');
    });
  });

  describe('formatPercent', () => {
    it('0', () => {
      expect(formatPercent(0)).toBe('0%');
    });
    it('half', () => {
      expect(formatPercent(0.5)).toBe('50%');
    });
    it('one digit precision', () => {
      expect(formatPercent(0.456)).toBe('46%');
    });
    it('null safe', () => {
      expect(formatPercent(null)).toBe('0%');
    });
    it('precision', () => {
      expect(formatPercent(0.456, 1)).toBe('45.6%');
    });
  });

  describe('truncate', () => {
    it('shorter than max', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });
    it('longer than max', () => {
      expect(truncate('hello world', 5)).toBe('hello…');
    });
  });

  describe('pluralize', () => {
    it('counts', () => {
      expect(pluralize(5, '件')).toBe('5 件');
    });
  });

  describe('formatDateTime', () => {
    it('default', () => {
      expect(formatDateTime(new Date('2026-05-13T10:30:00'))).toBe('2026-05-13 10:30');
    });
  });
});
