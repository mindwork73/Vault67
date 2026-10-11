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

// Товары, созданные локально (без backend id), не синхронизируем — только числовые id.
const toNumericId = (id: string): number | null => (/^\d+$/.test(id) ? Number(id) : null);

async function apiPatchProduct(id: string, data: Record<string, unknown>) {
  const numeric = toNumericId(id);
  if (numeric === null) return;
  try {
    const { api } = await import('../services/api');
    await api.updateProduct(numeric, data);
  } catch {
    /* оставляем оптимистичное локальное состояние */
  }
}

async function apiDeleteProduct(id: string) {
  const numeric = toNumericId(id);
  if (numeric === null) return;
  try {
    const { api } = await import('../services/api');
    await api.deleteProduct(numeric);
  } catch {
    /* ignore */
  }
}

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
  apiCategories: any[];
  apiFranchises: any[];
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
    telegram?: string;
    phone?: string;
    addressDetails?: import('../types').AddressDetails;
  }) => Order;

  submitOrder: (data: {
    recipientName: string;
    telegram?: string;
    phone?: string;
    region?: string;
    city?: string;
    street?: string;
    building?: string;
    apartment?: string;
    postalCode?: string;
    landmark?: string;
    paymentMethod: string;
    comment?: string;
  }) => Promise<Order>;

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

  // Загрузка данных из API
  catalogLoading: boolean;
  catalogLoaded: boolean;
  authChecked: boolean;
  isAuthed: boolean;
  loadCatalog: () => Promise<void>;
  loadSettings: () => Promise<void>;
  loadUser: () => Promise<void>;
  loadMyOrders: () => Promise<void>;
  loadAllOrders: () => Promise<void>;
  handleUnauthorized: () => void;

  // Авторизация и профиль
  loginAs: (role: 'dweller' | 'overseer', callsign?: string) => void;
  login: (email: string, password: string) => Promise<void>;
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
      cart: [],
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
        phone: '+7 (999) 777-67-67',
        telegram: '@wanderer_vault67',
        wastelandAddress: 'Пустошь Мохаве, Новый Вегас, Стрип, Авеню Хауса, Казино Лаки 38, Башня А, Люкс 201 [Индекс: NV-89109-ROBCO]',
        addressDetails: {
          region: 'Пустошь Мохаве (Невада)',
          city: 'Новый Вегас',
          street: 'Стрип, Авеню Хауса',
          building: 'Казино Лаки 38, Башня А',
          apartment: 'Люкс 201 (Верхний пентхаус)',
          postalCode: 'NV-89109-ROBCO',
          landmark: 'Шлюз безопасности сектора Стрип, у терминала Мистера Хауса'
        },
        bio: 'Житель Убежища 67. Исследователь пустошей Мохаве, ценитель ретро-техники RobCo и редких коллекционных голозаписей.',
        level: 18,
        karma: 'МЕССИЯ ПУСТОШИ'
      },

      products: [],
      orders: INITIAL_ORDERS,
  categories: DEFAULT_CATEGORIES,
  franchises: DEFAULT_FRANCHISES,
  apiCategories: [],
  apiFranchises: [],
      dwellers: DEFAULT_DWELLERS,
      storeSettings: DEFAULT_SETTINGS,

      catalogLoading: false,
      catalogLoaded: false,
      authChecked: false,
      isAuthed: false,

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

      placeOrder: ({ recipientName, wastelandLocation, paymentMethod, telegram, phone, addressDetails }) => {
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
          telegram: telegram || state.user.telegram,
          phone: phone || state.user.phone,
          addressDetails: addressDetails || state.user.addressDetails,
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

      submitOrder: async (data) => {
        const { api } = await import('../services/api');
        const { mapOrder } = await import('../services/adapters');
        const res = await api.createOrder({
          recipient_name: data.recipientName,
          phone: data.phone ?? null,
          telegram: data.telegram ?? null,
          region: data.region ?? null,
          city: data.city ?? null,
          street: data.street ?? null,
          building: data.building ?? null,
          apartment: data.apartment ?? null,
          postal_code: data.postalCode ?? null,
          landmark: data.landmark ?? null,
          payment_method: data.paymentMethod,
          comment: data.comment ?? null,
          items: get().cart.map((item) => ({
            product_id: Number(item.product.id),
            quantity: item.quantity,
          })),
        });
        const order = mapOrder(res);
        set((state) => ({ orders: [order, ...state.orders], cart: [] }));
        soundManager.playCaps();
        return order;
      },

      addProduct: (product: Product) => {
        soundManager.playFanfare();
        set((state) => ({
          products: [product, ...state.products]
        }));
        (async () => {
          try {
            const { api } = await import('../services/api');
            const { mapProductInput, mapProduct } = await import('../services/adapters');
            const state = get();
            const payload = mapProductInput(product, {
              categories: state.apiCategories,
              franchises: state.apiFranchises,
            });
            const created: any = await api.createProduct(payload);
            const mapped = mapProduct(created);
            set((s) => ({
              products: s.products.map((p) => (p.id === product.id ? mapped : p)),
            }));
          } catch {
            /* остаётся локальная версия */
          }
        })();
      },

      updateProduct: (product: Product) => {
        soundManager.playClick();
        set((state) => ({
          products: state.products.map((p) => (p.id === product.id ? product : p))
        }));
        (async () => {
          const numeric = toNumericId(product.id);
          if (numeric === null) return;
          try {
            const { api } = await import('../services/api');
            const { mapProductInput, mapProduct } = await import('../services/adapters');
            const state = get();
            const payload = mapProductInput(product, {
              categories: state.apiCategories,
              franchises: state.apiFranchises,
            });
            const updated: any = await api.updateProduct(numeric, payload);
            const mapped = mapProduct(updated);
            set((s) => ({
              products: s.products.map((p) => (p.id === product.id ? mapped : p)),
            }));
          } catch {
            /* optimistic: остаётся локальная версия */
          }
        })();
      },

      deleteProduct: (productId: string) => {
        soundManager.playError();
        set((state) => ({
          products: state.products.filter((p) => p.id !== productId),
          cart: state.cart.filter((item) => item.product.id !== productId)
        }));
        void apiDeleteProduct(productId);
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
        const apiId = get().orders.find((o) => o.id === orderId)?.apiId;
        if (apiId) {
          (async () => {
            try {
              const { api } = await import('../services/api');
              await api.updateOrderStatus(apiId, { status });
            } catch {
              /* ignore */
            }
          })();
        }
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
        void apiPatchProduct(productId, { status });
      },

      bulkUpdateProductStatus: (productIds: string[], status: ProductStatus) => {
        soundManager.playClick();
        set((state) => ({
          products: state.products.map((p) =>
            productIds.includes(p.id) ? { ...p, status } : p
          )
        }));
        productIds.forEach((id) => void apiPatchProduct(id, { status }));
      },

      bulkDeleteProducts: (productIds: string[]) => {
        soundManager.playError();
        set((state) => ({
          products: state.products.filter((p) => !productIds.includes(p.id)),
          cart: state.cart.filter((item) => !productIds.includes(item.product.id))
        }));
        productIds.forEach((id) => void apiDeleteProduct(id));
      },

      toggleProductFeatured: (productId: string) => {
        soundManager.playClick();
        const nextFeatured = !(get().products.find((p) => p.id === productId)?.featured ?? false);
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, featured: !p.featured } : p
          )
        }));
        void apiPatchProduct(productId, { featured: nextFeatured });
      },

      updateProductStock: (productId: string, stock: number) => {
        soundManager.playClick();
        const nextStock = Math.max(0, stock);
        set((state) => ({
          products: state.products.map((p) =>
            p.id === productId ? { ...p, stock: nextStock } : p
          )
        }));
        void apiPatchProduct(productId, { stock: nextStock });
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
        const store: Record<string, unknown> = {};
        if ('announcement' in newSettings) store.announcement = newSettings.announcement;
        if ('announcementActive' in newSettings) store.announcementActive = newSettings.announcementActive;
        if ('minOrderRub' in newSettings) store.minOrderRub = newSettings.minOrderRub;
        if ('caravanFeeRub' in newSettings) store.caravanFeeRub = newSettings.caravanFeeRub;
        if (Object.keys(store).length > 0) {
          (async () => {
            try {
              const { api } = await import('../services/api');
              await api.updateSettings({ store });
            } catch {
              /* ignore */
            }
          })();
        }
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

      loadCatalog: async () => {
        const { api } = await import('../services/api');
        const { mapProduct, mapFranchiseName } = await import('../services/adapters');
        if (get().catalogLoading) return;
        set({ catalogLoading: true });
        try {
          const [rawProducts, rawFranchises, rawCategories] = await Promise.all([
            api.products({ limit: 200 }),
            api.franchises().catch(() => []),
            api.categories().catch(() => []),
          ]);
          set((state) => ({
            products: (rawProducts as any[]).map(mapProduct),
            franchises: (rawFranchises as any[]).length
              ? (rawFranchises as any[]).map(mapFranchiseName).filter(Boolean)
              : state.franchises,
            apiFranchises: (rawFranchises as any[]) || [],
            apiCategories: (rawCategories as any[]) || [],
          }));
        } finally {
          set({ catalogLoading: false, catalogLoaded: true });
        }
      },

      loadSettings: async () => {
        const { api } = await import('../services/api');
        const { mapSettings } = await import('../services/adapters');
        try {
          const res: any = await api.settings();
          const mapped = mapSettings(res?.store);
          set((state) => ({ storeSettings: { ...state.storeSettings, ...mapped } }));
        } catch {
          /* оставляем дефолтные настройки */
        }
      },

      loadUser: async () => {
        const token = localStorage.getItem('vault67.token');
        if (!token) {
          set({ authChecked: true, isAuthed: false });
          return;
        }
        const { api } = await import('../services/api');
        const { mapUser } = await import('../services/adapters');
        try {
          const me = await api.me();
          set({ user: mapUser(me), isAuthed: true });
        } catch {
          localStorage.removeItem('vault67.token');
          set({ isAuthed: false });
        } finally {
          set({ authChecked: true });
        }
      },

      loadMyOrders: async () => {
        const token = localStorage.getItem('vault67.token');
        if (!token) return;
        const { api } = await import('../services/api');
        const { mapOrder } = await import('../services/adapters');
        const res = await api.myOrders();
        set({ orders: (res as any[]).map(mapOrder) });
      },

      loadAllOrders: async () => {
        const { api } = await import('../services/api');
        const { mapOrder } = await import('../services/adapters');
        const res = await api.allOrders();
        set({ orders: (res as any[]).map(mapOrder) });
      },

      handleUnauthorized: () => {
        get().logout();
      },

      login: async (email: string, password: string) => {
        const { api } = await import('../services/api');
        const { mapUser } = await import('../services/adapters');
        const res = await api.login(email, password);
        localStorage.setItem('vault67.token', res.access_token);
        set({ user: mapUser(res.user), authChecked: true, isAuthed: true });
      },
      loginAs: (role: 'dweller' | 'overseer', callsign = 'VaultDweller_67') => {
        soundManager.playTab();
        set((state) => ({
          user: {
            ...state.user,
            role,
            callsign: role === 'overseer' ? 'Overseer Barstow' : callsign,
            email: role === 'overseer' ? 'overseer@vault67.ru' : (state.user?.email || 'dweller@vault67.ru'),
          }
        }));
      },

      logout: () => {
        soundManager.playClick();
        localStorage.removeItem('vault67.token');
        set((state) => ({
          isAuthed: false,
          user: {
            ...state.user,
            role: 'dweller',
            callsign: 'Guest_Wanderer'
          },
          cart: []
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
      name: 'vault-67-storage',
      version: 3,
      // При миграции вычищаем из сохранённой корзины мок-позиции с нечисловым
      // product.id (могут остаться от старых сессий с предзаполненными демо-товарами).
      // zustand передаёт сюда уже внутреннее состояние (не обёртку {state,version}).
      migrate: (persistedState: any) => {
        if (persistedState && Array.isArray(persistedState.cart)) {
          persistedState.cart = persistedState.cart.filter((item: any) =>
            /^\d+$/.test(String(item?.product?.id ?? ''))
          );
        }
        return persistedState;
      },
      // Каталог/заказы/пользователь теперь грузятся из API — не персистим их,
      // храним только локальные UI-настройки и корзину.
      partialize: (state) => ({
        theme: state.theme,
        pipBoyColor: state.pipBoyColor,
        scanlines: state.scanlines,
        soundEnabled: state.soundEnabled,
        caps: state.caps,
        maxWeightWg: state.maxWeightWg,
        cart: state.cart,
      }),
    }
  )
);
