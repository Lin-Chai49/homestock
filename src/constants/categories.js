export const CATEGORIES = Object.freeze([
  { key: 'food', name: '食品', icon: '🍎', color: '#FF6B35', sortOrder: 1, enabled: true },
  { key: 'drug', name: '药品', icon: '💊', color: '#E54B4B', sortOrder: 2, enabled: true },
  { key: 'daily', name: '日用品', icon: '🧻', color: '#3D7EC9', sortOrder: 3, enabled: true },
  { key: 'clean', name: '清洁用品', icon: '🧴', color: '#F5A742', sortOrder: 4, enabled: true },
  { key: 'cond', name: '调味品', icon: '🍳', color: '#7FB069', sortOrder: 5, enabled: true },
  { key: 'can', name: '罐头', icon: '🥫', color: '#C44569', sortOrder: 6, enabled: true },
  { key: 'drink', name: '茶饮', icon: '🍵', color: '#FFC857', sortOrder: 7, enabled: true },
  { key: 'other', name: '其他', icon: '📦', color: '#A89888', sortOrder: 8, enabled: true },
]);

export function categoryByKey(key) {
  return CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1];
}

export function categoryName(key) {
  return categoryByKey(key).name;
}

export function categoryIcon(key) {
  return categoryByKey(key).icon;
}

export function categoryColor(key) {
  return categoryByKey(key).color;
}
