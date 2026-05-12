import dayjs from 'dayjs';
import { EXPIRY_LEVELS } from '@/constants/thresholds.js';

/**
 * Calculate days from today (00:00) until the given expiry date.
 * Negative means already expired.
 */
export function daysUntilExpiry(dateInput) {
  if (!dateInput) return NaN;
  const d = dayjs(dateInput).startOf('day');
  if (!d.isValid()) return NaN;
  const today = dayjs().startOf('day');
  return d.diff(today, 'day');
}

/**
 * Classify days remaining into 5-level state.
 */
export function classifyExpiry(days) {
  if (typeof days !== 'number' || Number.isNaN(days)) return 'fresh';
  if (days < 0) return 'expired';
  if (days <= EXPIRY_LEVELS.URGENT_MAX) return 'urgent';
  if (days <= EXPIRY_LEVELS.WARNING_MAX) return 'warning';
  if (days <= EXPIRY_LEVELS.INFO_MAX) return 'info';
  return 'fresh';
}

export function formatDate(dateInput, fmt = 'YYYY-MM-DD') {
  if (!dateInput) return '';
  const d = dayjs(dateInput);
  if (!d.isValid()) return '';
  return d.format(fmt);
}

/**
 * "今天到期" / "N 天后过期" / "已过期 N 天"
 */
export function formatRelativeExpiry(dateInput) {
  const days = daysUntilExpiry(dateInput);
  if (Number.isNaN(days)) return '';
  if (days === 0) return '今天到期';
  if (days > 0) return `${days} 天后过期`;
  return `已过期 ${Math.abs(days)} 天`;
}

/** Returns ISO date string N days ago from today */
export function daysAgo(n) {
  return dayjs().subtract(n, 'day').format('YYYY-MM-DD');
}

/** Returns ISO date string N days from today */
export function daysFromNow(n) {
  return dayjs().add(n, 'day').format('YYYY-MM-DD');
}

export function today() {
  return dayjs().format('YYYY-MM-DD');
}

export function isSameDay(a, b) {
  return dayjs(a).startOf('day').isSame(dayjs(b).startOf('day'));
}

/** Difference in calendar days between two dates (b - a) */
export function diffDays(a, b) {
  return dayjs(b).startOf('day').diff(dayjs(a).startOf('day'), 'day');
}

/** Returns dayjs instance — convenience for callers that need richer math */
export function toDayjs(input) {
  return dayjs(input);
}
