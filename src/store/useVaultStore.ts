import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  CartItem, 
  Order, 
  OrderStatus, 
  PipBoyColor, 
  Product, 
  ProductStatus, 
  CategoryItem, 
  ThemeMode, 
  UserProfile,
  DwellerRecord,
  StoreSettings
} from '../types';
import { INITIAL_ORDERS, INITIAL_PRODUCTS } from '../data/mockProducts';
import { soundManager } from '../utils/sound';

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { id: 'cat-str', key: 'STRENGTH', name: 'Сила [STR]', icon: '💪', description: 'Фигурки, статуи и реплики оружия' },
  { id: 'cat-per', key: 'PERCEPTION', name: 'Восприятие [PER]', icon: '👁️', description: 'Оптика, ночники, постеры и арт-принты' },
  { id: 'cat-end', key: 'ENDURANCE', name: 'Выносливость [END]', icon: '🛡️', description: 'Броня, худи, куртки и одежда' },
  { id: 'cat-cha', key: 'CHARISMA', name: 'Харизма [CHA]', icon: '⭐', description: 'Значки, нашивки, крышки и косплей' },
  { id: 'cat-int', key: 'INTELLIGENCE', name: 'Интеллект [INT]', icon: '🧠', description: 'Манга, комиксы, артбуки и схемы' },
  { id: 'cat-agi', key: 'AGILITY', name: 'Ловкость [AGI]', icon: '⚡', description: 'Клавиатуры, мыши, гаджеты и периферия' },
  { id: 'cat-lck', key: 'LUCK', name: 'Удача [LCK]', icon: '🍀', description: 'Секретные лутбоксы и Mystery Box' },
];

export const DEFAULT_FRANCHISES = [
  'Fallout',
  'Anime / Evangelion',
  'Cyberpunk',
  'Warhammer 40k',
  'Marvel & DC',
  'Star Wars',
  'Gaming Classics',
  'Classic Geek'
];

export const DEFAULT_DWELLERS: DwellerRecord[] = [
  {
    id: 'DW-67-001',
    callsign: 'Смотритель Barstow',
    vaultId: 'Vault 67',
    role: 'overseer',
    capsBalance: 15400,
    ordersCount: 18,
    totalSpentRub: 142500,
    registeredAt: '2077-10-23',
    status: 'ACTIVE'
  },
  {
    id: 'DW-67-042',
    callsign: 'Wanderer_67',
    vaultId: 'Vault 67',
    role: 'dweller',
    capsBalance: 4250,
    ordersCount: 4,
    totalSpentRub: 32600,
    registeredAt: '2287-05-14',
    status: 'ACTIVE'
  },
  {
    id: 'DW-67-099',
    callsign: 'Курьер Шестой (Courier 6)',
    vaultId: 'Mojave Outpost',
    role: 'dweller',
    capsBalance: 8900,
    ordersCount: 9,
    totalSpentRub: 88200,
    registeredAt: '2281-10-19',
    status: 'ACTIVE'
  },
  {
    id: 'DW-67-114',
    callsign: 'Пайпер Райт (Public Occurrences)',
    vaultId: 'Diamond City',
    role: 'dweller',
    capsBalance: 2100,
    ordersCount: 3,
    totalSpentRub: 18400,
    registeredAt: '2287-11-02',
    status: 'ACTIVE'
  },
  {
    id: 'DW-67-205',
    callsign: 'Ник Валентайн (Детектив)',
    vaultId: 'Vault 114',
    role: 'dweller',
    capsBalance: 6700,
    ordersCount: 6,
    totalSpentRub: 45000,
    registeredAt: '2287-08-11',
    status: 'ACTIVE'
  }
];

export const DEFAULT_SETTINGS: StoreSettings = {
  announcement: 'ВНИМАНИЕ: Караваны «Красной Ракеты» доставляют заказы в штатном режиме. Радиационный фон в пределах нормы.',
  announcementActive: true,
  capsToRubRate: 10,
  minOrderRub: 500,
  caravanFeeRub: 350
};

interface VaultStoreState {
  // Тема и оформление
  theme: ThemeMode;
  pipBoyColor: PipBoyColor;
  scanlines: boolean;
  soundEnabled: boolean;

  // Баланс и инвентарь (Stash)
  caps: number;
  cart: CartItem[];
  maxWeightWg: number;

  // Пользователь и доступ
  user: UserProfile;

  // Товары, категории, заказы, жители, настройки
  products: Product[];
  orders: Order[];
  categories: CategoryItem[];
  franchises: string[];
  dwellers: DwellerRecord[];
  storeSettings: StoreSettings;

  // Пасхалки
  konamiModalOpen: boolean;
  preWarUnlockedAlert: boolean;

  // Действия темы и звука
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  setPipBoyColor: (color: PipBoyColor) => void;
  toggleScanlines: () => void;
  toggleSound: () => void;
  closePreWarAlert: () => void;

  // Действия корзины
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Оформление заказа
  placeOrder: (orderData: {
    recipientName: string;
    wastelandLocation: string;
    paymentMethod: 'CAPS_CARD' | 'PREWAR_SBP' | 'BARTER_CASH';
  }) => Order;

  // Админка: CRUD товаров, статусы и склад
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  clearAllProducts: () => void;
  restoreDefaultProducts: () => void;
  updateProductStatus: (productId: string, status: ProductStatus) => void;
  bulkUpdateProductStatus: (productIds: string[], status: ProductStatus) => void;
  bulkDeleteProducts: (productIds: string[]) => void;
  toggleProductFeatured: (productId: string) => void;
  updateProductStock: (productId: string, stock: number) => void;

  // Админка: Заказы
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;

  // Админка: Разделы и франшизы
  addCategory: (category: CategoryItem) => void;
  updateCategory: (category: CategoryItem) => void;
  deleteCategory: (id: string) => void;
  addFranchise: (name: string) => void;
  deleteFranchise: (name: string) => void;

  // Админка: Жители и лояльность
  updateDwellerCaps: (id: string, amount: number) => void;
  toggleDwellerStatus: (id: string) => void;

  // Админка: Настройки магазина
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  importStoreData: (data: { products?: Product[]; categories?: CategoryItem[]; franchises?: string[] }) => void;

  // Авторизация и профиль
  loginAs: (role: 'dweller' | 'overseer', callsign?: string) => void;
  updateUserProfile: (profileData: Partial<UserProfile>) => void;
  logout: () => void;

  // Пасхалка Konami
  triggerKonamiBonus: () => void;
  closeKonamiModal: () => void;
}

export const useVaultStore = create<VaultStoreState>()(
  persist(
    (set, get) => ({
      theme: 'post-war',
      pipBoyColor: 'green',
      scanlines: true,
      soundEnabled: true,

      caps: 4250,
      cart: [
        { product: INITIAL_PRODUCTS[0], quantity: 1 },
        { product: INITIAL_PRODUCTS[4], quantity: 1 }
      ],
      maxWeightWg: 120,

      user: {
        id: 'DW-67-042',
        callsign: 'Wanderer_67',
        vaultId: 'Vault 67',
        role: 'dweller',
        capsBalance: 4250,
        radLevel: 42,
        equippedItems: ['pipboy-3000'],
        avatar: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=256&q=80',
        realName: 'Алексей (Странник Пустоши)',
        email: 'wanderer67@robco.net',
        phone: 'FREQ-108.4-FM',
        wastelandAddress: 'Новый Вегас, Стрип, Лаки 38, Люкс 201',
        bio: 'Житель Убежища 67. Исследователь пустошей Мохаве, ценитель ретро-техники RobCo и редких коллекционных голозаписей.',
        level: 18,
        karma: 'МЕССИЯ ПУСТОШИ'
      },

      products: INITIAL_PRODUCTS.map(p => ({ ...p, status: p.status || 'PUBLISHED' })),
      orders: INITIAL_ORDERS,
      categories: DEFAULT_CATEGORIES,
      franchises: DEFAULT_FRANCHISES,
      dwellers: DEFAULT_DWELLERS,
      storeSettings: DEFAULT_SETTINGS,

      konamiModalOpen: false,
      preWarUnlockedAlert: false,

      toggleTheme: () => {
        const nextTheme = get().theme === 'post-war' ? 'pre-war' : 'post-war';
        soundManager.playFanfare();
        set({ theme: nextTheme, preWarUnlockedAlert: nextTheme === 'pre-war' });
      },

      setTheme: (theme: ThemeMode) => {
        soundManager.playFanfare();
        set({ theme });
      },

      setPipBoyColor: (color: PipBoyColor) => {
        soundManager.playClick();
        set({ pipBoyColor: color });
      },

      toggleScanlines: () => {
        soundManager.playClick();
        set((state) => ({ scanlines: !state.scanlines }));
      },

      toggleSound: () => {
        const newMuted = soundManager.toggleMute();
        set({ soundEnabled: !newMuted });
      },

      closePreWarAlert: () => {
        soundManager.playClick();
        set({ preWarUnlockedAlert: false });
      },

      addToCart: (product: Product, quantity = 1) => {
        soundManager.playTab();
        set((state) => {
          const existingIndex = state.cart.findIndex(
            (item) => item.product.id === product.id
          );
          if (existingIndex > -1) {
            const updated = [...state.cart];
            updated[existingIndex].quantity += quantity;
            return { cart: updated };
          }
          return { cart: [...state.cart, { product, quantity }] };
        });
      },

      removeFromCart: (productId: string) => {
        soundManager.playError();
        set((state) => ({
          cart: state.cart.filter((item) => item.product.id !== productId)
        }));
      },

      updateQuantity: (productId: string, quantity: number) => {
        soundManager.playClick();
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set((state) => ({
          cart: state.cart.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          )
        }));
      },

      clearCart: () => {
        soundManager.playClick();
        set({ cart: [] });
      },

      placeOrder: ({ recipientName, wastelandLocation, paymentMethod }) => {
        const state = get();
        const totalCaps = state.cart.reduce(
          (sum, item) => sum + item.product.priceCaps * item.quantity,
          0
        );
        const totalRub = state.cart.reduce(
          (sum, item) => sum + item.product.priceRub * item.quantity,
          0
        );

        const newOrder: Order = {
          id: `ORD-67-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          recipientName,
          wastelandLocation,
          paymentMethod,
          items: [...state.cart],
          totalCaps,
          totalRub,
          status: 'PREPARATION',
          trackingNumber: `CRVN-67-${Math.floor(10000 + Math.random() * 90000)}`
        };

        // За каждую покупку начисляем бонусные крышки на баланс Pip-Boy
        const earnedBonusCaps = totalCaps;
        const remainingCaps = state.caps + earnedBonusCaps;

        soundManager.playCaps();
        set({
          orders: [newOrder, ...state.orders],
          cart: [],
          caps: remainingCaps,
          user: {
            ...state.user,
            capsBalance: remainingCaps
          }
        });

        return newOrder;
      },

      addProduct: (product: Product) => {
        soundManager.playFanfare();
        set((state) => ({
          products: [product, ...state.products]
        }));
      },

      updateProduct: (product: Product) => {
        soundManager.playClick();
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p))
        }));
      },

      deleteProduct: (productId: string) => {
        soundManager.playError();
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
          cart: state.cart.filter((item) => item.product.id !== productId)
        }));
      },

      clearAllProducts: () => {
        soundManager.playError();
        set({
          products: [],
          cart: []
        });
      },

      restoreDefaultProducts: () => {
        soundManager.playFanfare();
        set({
          products: INITIAL_PRODUCTS.map(p => ({ ...p, status: p.status || 'PUBLISHED' }))
        });
      },

      updateOrderStatus: (orderId: string, status: OrderStatus) => {
        soundManager.playClick();
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          )
        }));
      },

      deleteOrder: (orderId: string) => {
        soundManager.playError();
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== orderId)
        }));
      },

      updateProductStatus: (productId: string, status: ProductStatus) => {
        soundManager.playClick();
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, status } : p
          )
        }));
      },

      bulkUpdateProductStatus: (productIds: string[], status: ProductStatus) => {
        soundManager.playClick();
        set((state) => ({
          products: state.products.map((p) =>
            productIds.includes(p.id) ? { ...p, status } : p
          )
        }));
      },

      bulkDeleteProducts: (productIds: string[]) => {
        soundManager.playError();
        set((state) => ({
          products: state.products.filter((p) => !productIds.includes(p.id)),
          cart: state.cart.filter((item) => !productIds.includes(item.product.id))
        }));
      },

      toggleProductFeatured: (productId: string) => {
        soundManager.playClick();
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, featured: !p.featured } : p
          )
        }));
      },

      updateProductStock: (productId: string, stock: number) => {
        soundManager.playClick();
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stock: Math.max(0, stock) } : p
          )
        }));
      },

      addCategory: (category: CategoryItem) => {
        soundManager.playFanfare();
        set((state) => ({
          categories: [...state.categories, category]
        }));
      },

      updateCategory: (category: CategoryItem) => {
        soundManager.playClick();
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === category.id ? category : c
          )
        }));
      },

      deleteCategory: (id: string) => {
        soundManager.playError();
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id)
        }));
      },

      addFranchise: (name: string) => {
        soundManager.playClick();
        set((state) => ({
          franchises: state.franchises.includes(name)
            ? state.franchises
            : [...state.franchises, name]
        }));
      },

      deleteFranchise: (name: string) => {
        soundManager.playError();
        set((state) => ({
          franchises: state.franchises.filter((f) => f !== name)
        }));
      },

      updateDwellerCaps: (id: string, amount: number) => {
        soundManager.playCaps();
        set((state) => ({
          dwellers: state.dwellers.map((d) =>
            d.id === id ? { ...d, capsBalance: Math.max(0, d.capsBalance + amount) } : d
          )
        }));
      },

      toggleDwellerStatus: (id: string) => {
        soundManager.playClick();
        set((state) => ({
          dwellers: state.dwellers.map((d) =>
            d.id === id ? { ...d, status: d.status === 'ACTIVE' ? 'ISOLATION' : 'ACTIVE' } : d
          )
        }));
      },

      updateStoreSettings: (newSettings: Partial<StoreSettings>) => {
        soundManager.playClick();
        set((state) => ({
          storeSettings: { ...state.storeSettings, ...newSettings }
        }));
      },

      importStoreData: (data) => {
        soundManager.playFanfare();
        set((state) => ({
          products: data.products || state.products,
          categories: data.categories || state.categories,
          franchises: data.franchises || state.franchises
        }));
      },

      updateUserProfile: (profileData) => {
        soundManager.playClick();
        set((state) => ({
          user: {
            ...state.user,
            ...profileData
          }
        }));
      },

      loginAs: (role: 'dweller' | 'overseer', callsign = 'VaultDweller_67') => {
        soundManager.playTab();
        set((state) => ({
          user: {
            ...state.user,
            role,
            callsign: role === 'overseer' ? 'Overseer Barstow' : callsign
          }
        }));
      },

      logout: () => {
        soundManager.playClick();
        set((state) => ({
          user: {
            ...state.user,
            role: 'dweller',
            callsign: 'Guest_Wanderer'
          }
        }));
      },

      triggerKonamiBonus: () => {
        soundManager.playFanfare();
        set((state) => ({
          konamiModalOpen: true,
          caps: state.caps + 500,
          user: {
            ...state.user,
            capsBalance: state.caps + 500
          }
        }));
      },

      closeKonamiModal: () => {
        soundManager.playClick();
        set({ konamiModalOpen: false });
      }
    }),
    {
      name: 'vault-67-storage'
    }
  )
);
