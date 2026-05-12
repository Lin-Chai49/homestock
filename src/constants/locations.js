export const DEFAULT_LOCATIONS = Object.freeze([
  {
    id: 'fridge_cool',
    name: '冰箱·冷藏',
    icon: '🧊',
    description: '冰箱主仓 · 0-4°C',
    color: '#3D7EC9',
    enabled: true,
    sortOrder: 1,
  },
  {
    id: 'fridge_freeze',
    name: '冰箱·冷冻',
    icon: '❄️',
    description: '冰箱冷冻层 · -18°C',
    color: '#6BA0E0',
    enabled: true,
    sortOrder: 2,
  },
  {
    id: 'kitchen_cond',
    name: '厨房·调料柜',
    icon: '🗄️',
    description: '厨房灶台旁',
    color: '#FF6B35',
    enabled: true,
    sortOrder: 3,
  },
  {
    id: 'kitchen_room',
    name: '厨房·常温柜',
    icon: '🍱',
    description: '厨房主柜',
    color: '#F5A742',
    enabled: true,
    sortOrder: 4,
  },
  {
    id: 'rice_cabinet',
    name: '厨房·米柜',
    icon: '🍚',
    description: '厨房阳台',
    color: '#FFC857',
    enabled: true,
    sortOrder: 5,
  },
  {
    id: 'tea_cabinet',
    name: '厨房·茶柜',
    icon: '🍵',
    description: '厨房上柜',
    color: '#7FB069',
    enabled: true,
    sortOrder: 6,
  },
  {
    id: 'medicine_box',
    name: '药箱',
    icon: '💊',
    description: '客厅药箱',
    color: '#E54B4B',
    enabled: true,
    sortOrder: 7,
  },
  {
    id: 'bathroom_cabi',
    name: '卫生间·储物柜',
    icon: '🧴',
    description: '卫生间镜柜下方',
    color: '#A4D7A6',
    enabled: true,
    sortOrder: 8,
  },
  {
    id: 'cleaning_cabi',
    name: '卫生间·清洁柜',
    icon: '🧹',
    description: '卫生间墙柜',
    color: '#6BA0E0',
    enabled: true,
    sortOrder: 9,
  },
  {
    id: 'bedroom_cabi',
    name: '卧室·衣柜',
    icon: '🛏️',
    description: '卧室衣柜抽屉',
    color: '#C44569',
    enabled: true,
    sortOrder: 10,
  },
  {
    id: 'living_cabi',
    name: '客厅·储物柜',
    icon: '📚',
    description: '客厅电视柜',
    color: '#A89888',
    enabled: true,
    sortOrder: 11,
  },
  {
    id: 'entrance_cabi',
    name: '玄关·鞋柜',
    icon: '🚪',
    description: '门厅鞋柜',
    color: '#8A857F',
    enabled: true,
    sortOrder: 12,
  },
]);

export function locationById(id) {
  return DEFAULT_LOCATIONS.find((l) => l.id === id);
}

export function locationName(id) {
  return locationById(id)?.name || '未设置';
}

export function locationIcon(id) {
  return locationById(id)?.icon || '📦';
}
