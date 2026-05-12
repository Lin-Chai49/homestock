import dayjs from 'dayjs';

export function formatMoney(value, { symbol = true } = {}) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  const sign = safe < 0 ? '-' : '';
  const formatted = Math.abs(safe)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${sign}${symbol ? '¥' : ''}${formatted}`;
}

export function formatQty(value, unit) {
  const num = Number(value);
  const safe = Number.isFinite(num) ? num : 0;
  return unit ? `${safe} ${unit}` : `${safe}`;
}

export function formatPercent(value, precision = 0) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0%';
  return `${(num * 100).toFixed(precision)}%`;
}

export function truncate(str, max) {
  if (typeof str !== 'string') return '';
  if (str.length <= max) return str;
  return str.slice(0, max) + '…';
}

export function pluralize(count, unit) {
  return `${count} ${unit}`;
}

export function formatDateTime(input, fmt = 'YYYY-MM-DD HH:mm') {
  if (!input) return '';
  const d = dayjs(input);
  return d.isValid() ? d.format(fmt) : '';
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function uniqueId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`;
}
