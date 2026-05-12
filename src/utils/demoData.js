import dayjs from 'dayjs';
import {
  bulkAddItems,
  bulkAddConsumptions,
  addShoppingItem,
  clearUserData,
} from '@/services/storageService.js';

function offsetDate(daysFromToday) {
  return dayjs().add(daysFromToday, 'day').format('YYYY-MM-DD');
}

function offsetTs(daysAgo, hour = 8) {
  return dayjs().subtract(daysAgo, 'day').hour(hour).minute(0).second(0).valueOf();
}

const DEMO_ITEMS = [
  // food
  {
    name: '伊利纯牛奶 250ml',
    category: 'food',
    icon: '🥛',
    brand: '伊利',
    spec: '250ml × 12 盒',
    quantity: 12,
    fullStock: 12,
    unit: '盒',
    locationId: 'fridge_cool',
    purchaseDate: offsetDate(-2),
    expiryDate: offsetDate(1),
    price: 48,
    minStock: 4,
    note: '早餐常备',
  },
  {
    name: '全麦切片面包',
    category: 'food',
    icon: '🍞',
    brand: '曼可顿',
    spec: '400g',
    quantity: 1,
    fullStock: 2,
    unit: '袋',
    locationId: 'kitchen_room',
    purchaseDate: offsetDate(-3),
    expiryDate: offsetDate(2),
    price: 12.5,
    minStock: 1,
  },
  {
    name: '土鸡蛋 30 枚',
    category: 'food',
    icon: '🥚',
    brand: '德青源',
    spec: '30 枚装',
    quantity: 24,
    fullStock: 30,
    unit: '枚',
    locationId: 'fridge_cool',
    purchaseDate: offsetDate(-5),
    expiryDate: offsetDate(23),
    price: 48,
    minStock: 6,
  },
  {
    name: '红富士苹果',
    category: 'food',
    icon: '🍎',
    brand: '陕西洛川',
    spec: '约 200g/个',
    quantity: 8,
    fullStock: 12,
    unit: '个',
    locationId: 'fridge_cool',
    purchaseDate: offsetDate(-4),
    expiryDate: offsetDate(10),
    price: 36,
    minStock: 3,
  },
  {
    name: '西兰花',
    category: 'food',
    icon: '🥦',
    brand: '本地',
    spec: '约 500g',
    quantity: 2,
    fullStock: 3,
    unit: '颗',
    locationId: 'fridge_cool',
    purchaseDate: offsetDate(-3),
    expiryDate: offsetDate(4),
    price: 8.5,
    minStock: 1,
  },
  {
    name: '五常大米 5kg',
    category: 'food',
    icon: '🍚',
    brand: '北大荒',
    spec: '5kg',
    quantity: 3,
    fullStock: 5,
    unit: '袋',
    locationId: 'rice_cabinet',
    purchaseDate: offsetDate(-30),
    expiryDate: offsetDate(120),
    price: 88,
    minStock: 1,
  },
  {
    name: '康师傅红烧牛肉面',
    category: 'food',
    icon: '🍜',
    brand: '康师傅',
    spec: '107g × 12',
    quantity: 15,
    fullStock: 24,
    unit: '袋',
    locationId: 'kitchen_room',
    purchaseDate: offsetDate(-10),
    expiryDate: offsetDate(180),
    price: 56,
    minStock: 6,
  },
  // drug
  {
    name: '布洛芬胶囊 300mg',
    category: 'drug',
    icon: '💊',
    brand: '芬必得',
    spec: '300mg × 20',
    quantity: 2,
    fullStock: 3,
    unit: '盒',
    locationId: 'medicine_box',
    purchaseDate: offsetDate(-90),
    expiryDate: offsetDate(5),
    price: 18.6,
    minStock: 1,
    note: '常备',
  },
  {
    name: '维生素 C 片',
    category: 'drug',
    icon: '🟠',
    brand: '养生堂',
    spec: '60 片',
    quantity: 1,
    fullStock: 2,
    unit: '瓶',
    locationId: 'medicine_box',
    purchaseDate: offsetDate(-60),
    expiryDate: offsetDate(380),
    price: 36,
    minStock: 1,
  },
  // daily
  {
    name: '维达原木卷纸',
    category: 'daily',
    icon: '🧻',
    brand: '维达',
    spec: '180g × 10 卷',
    quantity: 2,
    fullStock: 10,
    unit: '提',
    locationId: 'bathroom_cabi',
    purchaseDate: offsetDate(-15),
    expiryDate: offsetDate(700),
    price: 49.9,
    minStock: 2,
  },
  {
    name: '蓝月亮洗衣液 1kg',
    category: 'clean',
    icon: '🧴',
    brand: '蓝月亮',
    spec: '1kg',
    quantity: 1,
    fullStock: 2,
    unit: '瓶',
    locationId: 'cleaning_cabi',
    purchaseDate: offsetDate(-25),
    expiryDate: offsetDate(720),
    price: 32,
    minStock: 1,
  },
  {
    name: '海飞丝洗发水',
    category: 'clean',
    icon: '🧴',
    brand: '海飞丝',
    spec: '500ml',
    quantity: 1,
    fullStock: 2,
    unit: '瓶',
    locationId: 'bathroom_cabi',
    purchaseDate: offsetDate(-20),
    expiryDate: offsetDate(900),
    price: 45.5,
    minStock: 1,
  },
  {
    name: '高露洁牙膏',
    category: 'daily',
    icon: '🪥',
    brand: '高露洁',
    spec: '180g',
    quantity: 3,
    fullStock: 4,
    unit: '支',
    locationId: 'bathroom_cabi',
    purchaseDate: offsetDate(-12),
    expiryDate: offsetDate(540),
    price: 32,
    minStock: 1,
  },
  // cond
  {
    name: '加碘盐 400g',
    category: 'cond',
    icon: '🧂',
    brand: '中盐',
    spec: '400g',
    quantity: 0,
    fullStock: 1,
    unit: '袋',
    locationId: 'kitchen_cond',
    purchaseDate: offsetDate(-60),
    expiryDate: offsetDate(900),
    price: 3.5,
    minStock: 1,
  },
  {
    name: '海天生抽',
    category: 'cond',
    icon: '🍶',
    brand: '海天',
    spec: '500ml',
    quantity: 1,
    fullStock: 2,
    unit: '瓶',
    locationId: 'kitchen_cond',
    purchaseDate: offsetDate(-40),
    expiryDate: offsetDate(300),
    price: 18,
    minStock: 1,
  },
  // can
  {
    name: '梅林午餐肉罐头',
    category: 'can',
    icon: '🥫',
    brand: '梅林',
    spec: '340g',
    quantity: 4,
    fullStock: 6,
    unit: '罐',
    locationId: 'kitchen_room',
    purchaseDate: offsetDate(-7),
    expiryDate: offsetDate(550),
    price: 78,
    minStock: 2,
  },
  // drink
  {
    name: '立顿红茶',
    category: 'drink',
    icon: '🍵',
    brand: '立顿',
    spec: '2g × 100',
    quantity: 1,
    fullStock: 1,
    unit: '盒',
    locationId: 'tea_cabinet',
    purchaseDate: offsetDate(-80),
    expiryDate: offsetDate(640),
    price: 29,
    minStock: 1,
  },
  // expired
  {
    name: '草莓酸奶',
    category: 'food',
    icon: '🍓',
    brand: '光明',
    spec: '150g × 4',
    quantity: 2,
    fullStock: 4,
    unit: '杯',
    locationId: 'fridge_cool',
    purchaseDate: offsetDate(-15),
    expiryDate: offsetDate(-3),
    price: 22,
    minStock: 1,
    status: 'expired',
    note: '忘记吃了',
  },
  {
    name: '黄油',
    category: 'food',
    icon: '🧈',
    brand: '安佳',
    spec: '227g',
    quantity: 1,
    fullStock: 1,
    unit: '块',
    locationId: 'fridge_cool',
    purchaseDate: offsetDate(-90),
    expiryDate: offsetDate(-7),
    price: 32,
    minStock: 1,
    status: 'expired',
  },
];

function buildConsumptions() {
  // Last 30 days, ~50 records spread across items
  const milkConsumption = Array.from({ length: 14 }, (_, i) => ({
    itemId: null,
    itemName: '伊利纯牛奶 250ml',
    amount: -1,
    scene: 'breakfast',
    timestamp: offsetTs(i + 1, 7),
  }));
  const eggsConsumption = Array.from({ length: 10 }, (_, i) => ({
    itemId: null,
    itemName: '土鸡蛋 30 枚',
    amount: -2,
    scene: 'breakfast',
    timestamp: offsetTs(i + 1, 8),
  }));
  const appleConsumption = Array.from({ length: 8 }, (_, i) => ({
    itemId: null,
    itemName: '红富士苹果',
    amount: -1,
    scene: 'afternoon',
    timestamp: offsetTs(i + 1, 15),
  }));
  const breadConsumption = Array.from({ length: 6 }, (_, i) => ({
    itemId: null,
    itemName: '全麦切片面包',
    amount: -2,
    scene: 'breakfast',
    timestamp: offsetTs(i + 1, 7),
  }));
  const noodleConsumption = Array.from({ length: 5 }, (_, i) => ({
    itemId: null,
    itemName: '康师傅红烧牛肉面',
    amount: -1,
    scene: 'lunch',
    timestamp: offsetTs(i * 2 + 1, 12),
  }));
  const paperConsumption = Array.from({ length: 4 }, (_, i) => ({
    itemId: null,
    itemName: '维达原木卷纸',
    amount: -1,
    scene: 'daily',
    timestamp: offsetTs(i * 3 + 2, 10),
  }));
  return [
    ...milkConsumption,
    ...eggsConsumption,
    ...appleConsumption,
    ...breadConsumption,
    ...noodleConsumption,
    ...paperConsumption,
  ];
}

const DEMO_SHOPPING = [
  {
    itemName: '加碘盐 400g',
    category: 'cond',
    quantity: 1,
    estimatedPrice: 3.5,
    recommendStore: '盒马生鲜',
    source: 'auto',
    done: false,
  },
  {
    itemName: '维达原木卷纸',
    category: 'daily',
    quantity: 1,
    estimatedPrice: 49.9,
    recommendStore: '京东超市',
    source: 'auto',
    done: false,
  },
  {
    itemName: '黄瓜',
    category: 'food',
    quantity: 3,
    estimatedPrice: 6,
    recommendStore: '盒马生鲜',
    source: 'manual',
    done: false,
  },
];

/**
 * Load demo data into IndexedDB. Items + consumptions + a few shopping items.
 * Existing user data is NOT cleared automatically — caller should confirm.
 */
export async function loadDemoData() {
  await bulkAddItems(DEMO_ITEMS);
  // After items are inserted, look up their assigned IDs by name to link consumptions.
  const { getAllItems } = await import('@/services/storageService.js');
  const allItems = await getAllItems();
  const idByName = new Map(allItems.map((i) => [i.name, i.id]));

  const consumptions = buildConsumptions()
    .map((c) => ({ ...c, itemId: idByName.get(c.itemName) || 0 }))
    .filter((c) => c.itemId > 0);
  await bulkAddConsumptions(consumptions);

  for (const s of DEMO_SHOPPING) {
    await addShoppingItem(s);
  }
}

export async function clearAll() {
  await clearUserData();
}
