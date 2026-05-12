export function toast(message, duration = 2200) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('app:toast', { detail: { message, duration } }));
}
