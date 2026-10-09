export type ThemeMode = 'post-war' | 'pre-war';
export type PipBoyColor = 'green' | 'amber' | 'cyan';

export type SpecialCategory = 
  | 'STRENGTH'     // Статуи, коллекционные фигурки, тяжелый мерч
  | 'PERCEPTION'   // Оптика, постеры, артбуки, принты
  | 'ENDURANCE'    // Худи, куртки, выживальный мерч, броня
  | 'CHARISMA'     // Значки, нашивки, косплей, украшения
  | 'INTELLIGENCE' // Манга, комиксы, настольные игры, книги
  | 'AGILITY'      // Гаджеты, девайсы, коврики, периферия
  | 'LUCK';        // Mystery Box, лутбоксы, случайный лут

export type Franchise = 
  | 'Fallout'
  | 'Anime / Evangelion'
  | 'Cyberpunk'
  | 'Warhammer 40k'
  | 'Marvel & DC'
  | 'Star Wars'
  | 'Gaming Classics'
  | 'Classic Geek'
  | string;

export type ProductStatus = 'PUBLISHED' | 'PREORDER' | 'OUT_OF_STOCK' | 'DRAFT' | 'ARCHIVED';

export interface CategoryItem {
  id: string;
  name: string;
  key: string;
  icon?: string;
  description: string;
  productCount?: number;
}

export interface Product {
  id: string;
  title: string;
  titleRu: string;
  category: string; // SpecialCategory или кастомный созданный раздел
  franchise: string; // Франшиза (включая кастомные)
  priceCaps: number;
  priceRub: number;
  oldPriceRub?: number; // Прежняя цена для скидок
  weightWg: number; // WG (Weight in Pip-Boy)
  conditionCnd: number; // CND % (Condition, 0-100)
  stock: number;
  status?: ProductStatus; // Статус публикации: Опубликован, Предзаказ, Нет в наличии, Черновик, В архиве
  image: string;
  images?: string[]; // До 10 фотографий товара
  description: string;
  lore: string;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'LEGENDARY';
  stats: {
    label: string;
    value: string | number;
  }[];
  featured?: boolean;
  badge?: string; // Напр. 'ХИТ', 'НОВИНКА', 'АКЦИЯ'
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 
  | 'ORDER_PLACED'
  | 'PREPARATION' 
  | 'CARAVAN_DISPATCHED' 
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED_TO_VAULT' 
  | 'CANCELLED';

export interface Order {
  id: string;
  date: string;
  recipientName: string;
  wastelandLocation: string;
  paymentMethod: 'CAPS_CARD' | 'PREWAR_SBP' | 'BARTER_CASH';
  items: CartItem[];
  totalCaps: number;
  totalRub?: number;
  status: OrderStatus;
  trackingNumber: string;
}

export interface UserProfile {
  id: string;
  callsign: string;
  vaultId: string;
  role: 'dweller' | 'overseer'; // 'overseer' has admin rights
  capsBalance: number;
  radLevel: number; // 0 - 1000 rads
  equippedItems: string[];
  avatar?: string;
  realName?: string;
  email?: string;
  phone?: string;
  wastelandAddress?: string;
  bio?: string;
  level?: number;
  karma?: string;
}

export interface DwellerRecord {
  id: string;
  callsign: string;
  vaultId: string;
  role: 'dweller' | 'overseer';
  capsBalance: number;
  ordersCount: number;
  totalSpentRub: number;
  registeredAt: string;
  status: 'ACTIVE' | 'ISOLATION';
}

export interface StoreSettings {
  announcement: string;
  announcementActive: boolean;
  capsToRubRate: number;
  minOrderRub: number;
  caravanFeeRub: number;
}
