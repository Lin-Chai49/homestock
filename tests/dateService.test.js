import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import dayjs from 'dayjs';
import {
  daysUntilExpiry,
  classifyExpiry,
  formatDate,
  formatRelativeExpiry,
  daysAgo,
  isSameDay,
} from '@/services/dateService.js';

describe('dateService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-13T12:00:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  describe('daysUntilExpiry', () => {
    it('returns 0 for today', () => {
      expect(daysUntilExpiry('2026-05-13')).toBe(0);
    });
    it('returns positive for future', () => {
      expect(daysUntilExpiry('2026-05-20')).toBe(7);
    });
    it('returns negative for past', () => {
      expect(daysUntilExpiry('2026-05-10')).toBe(-3);
    });
    it('handles null gracefully', () => {
      expect(daysUntilExpiry(null)).toBeNaN();
    });
  });

  describe('classifyExpiry', () => {
    it('expired when days < 0', () => {
      expect(classifyExpiry(-1)).toBe('expired');
      expect(classifyExpiry(-30)).toBe('expired');
    });
    it('urgent at boundary 0 to 2', () => {
      expect(classifyExpiry(0)).toBe('urgent');
      expect(classifyExpiry(1)).toBe('urgent');
      expect(classifyExpiry(2)).toBe('urgent');
    });
    it('warning at boundary 3 to 7', () => {
      expect(classifyExpiry(3)).toBe('warning');
      expect(classifyExpiry(7)).toBe('warning');
    });
    it('info at boundary 8 to 30', () => {
      expect(classifyExpiry(8)).toBe('info');
      expect(classifyExpiry(30)).toBe('info');
    });
    it('fresh when days > 30', () => {
      expect(classifyExpiry(31)).toBe('fresh');
      expect(classifyExpiry(365)).toBe('fresh');
    });
    it('NaN treated as fresh (unknown)', () => {
      expect(classifyExpiry(NaN)).toBe('fresh');
    });
  });

  describe('formatDate', () => {
    it('default YYYY-MM-DD', () => {
      expect(formatDate('2026-05-13')).toBe('2026-05-13');
    });
    it('custom format', () => {
      expect(formatDate('2026-05-13', 'YYYY/MM/DD')).toBe('2026/05/13');
    });
    it('handles dayjs instance', () => {
      expect(formatDate(dayjs('2026-05-13'))).toBe('2026-05-13');
    });
    it('returns empty string for null', () => {
      expect(formatDate(null)).toBe('');
    });
  });

  describe('formatRelativeExpiry', () => {
    it('today', () => {
      expect(formatRelativeExpiry('2026-05-13')).toBe('今天到期');
    });
    it('tomorrow', () => {
      expect(formatRelativeExpiry('2026-05-14')).toBe('1 天后过期');
    });
    it('past', () => {
      expect(formatRelativeExpiry('2026-05-10')).toBe('已过期 3 天');
    });
  });

  describe('daysAgo', () => {
    it('returns ISO date N days ago', () => {
      expect(daysAgo(7)).toBe('2026-05-06');
    });
  });

  describe('isSameDay', () => {
    it('true for same date', () => {
      expect(isSameDay('2026-05-13', '2026-05-13')).toBe(true);
    });
    it('false for different dates', () => {
      expect(isSameDay('2026-05-13', '2026-05-14')).toBe(false);
    });
  });
});
