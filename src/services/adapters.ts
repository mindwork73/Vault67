import { Order, Product, StoreSettings, UserProfile } from '../types';

const API_BASE: string = import.meta.env.VITE_API_BASE || 'https://vault67.ru/api';

export const UPLOADS_BASE: string =
  import.meta.env.VITE_UPLOADS_BASE || `${API_BASE.replace(/\/api\/?$/, '')}/uploads`;

export function mediaUrl(path?: string | null): string {
  if (!path) return '';
  if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${UPLOADS_BASE}/${String(path).replace(/^\/+/, '')}`;
}

const SPECIAL_BY_CATEGORY: Record<string, string> = {
  'одежда': 'ENDURANCE',
  'обувь': 'AGILITY',
  'фигурки и коллекционное': 'STRENGTH',
  'аксессуары': 'CHARISMA',
  'гаджеты и техника': 'AGILITY',
  'постеры и декор': 'PERCEPTION',
  'манга и книги': 'INTELLIGENCE',
};

function normalizeKey(value?: string | null): string {
  return (value || '').trim().toLowerCase();
}

export function specialForCategory(
  category?: { name?: string | null; slug?: string | null } | null
): string {
  if (!category) return 'AGILITY';
  const byName = SPECIAL_BY_CATEGORY[(category.name || '').trim().toLowerCase()];
  if (byName) return byName;
  return category.slug || 'AGILITY';
}

const RARITIES = ['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY'] as const;

export function mapProduct(p: any): Product {
  const rawImages: any[] = Array.isArray(p?.images) ? p.images : [];
  const imageUrls = rawImages
    .map((im) => mediaUrl(typeof im === 'string' ? im : im?.path))
    .filter(Boolean);
  const cover = rawImages.find((im) => im && im.is_cover) || rawImages[0];
  const rarity = String(p?.rarity || 'COMMON').toUpperCase();
  const priceRub = Math.round(Number(p?.price_rub ?? 0));

  return {
    id: String(p?.id ?? ''),
    title: p?.title_original || p?.title_ru || '',
    titleRu: p?.title_ru || p?.title_original || '',
    category: specialForCategory(p?.category),
    franchise: p?.franchise?.name || '',
    priceCaps: Math.round(priceRub / 10),
    priceRub,
    oldPriceRub: p?.old_price_rub != null ? Math.round(Number(p.old_price_rub)) : undefined,
    weightWg: Math.round(Number(p?.weight_g ?? 0) / 453.592),
    conditionCnd: Number(p?.condition_cnd ?? 100),
    stock: Number(p?.stock ?? 0),
    status: (p?.status as Product['status']) || 'PUBLISHED',
    image: mediaUrl(typeof cover === 'string' ? cover : cover?.path),
    images: imageUrls,
    description: p?.description_ru || '',
    lore: p?.lore || '',
    rarity: (RARITIES as readonly string[]).includes(rarity)
      ? (rarity as Product['rarity'])
      : 'COMMON',
    stats: Array.isArray(p?.stats)
      ? p.stats.map((s: any) => ({ label: String(s?.label ?? ''), value: s?.value ?? '' }))
      : [],
    featured: Boolean(p?.featured),
    badge: p?.badge || undefined,
  };
}

export function mapFranchiseName(f: any): string {
  return typeof f === 'string' ? f : String(f?.name ?? '');
}

// Обратный маппинг S.P.E.C.I.A.L. -> товарная категория бэкенда (для админ-формы).
const SPECIAL_TO_CATEGORY_NAME: Record<string, string> = {
  ENDURANCE: 'Одежда',
  AGILITY: 'Обувь',
  STRENGTH: 'Фигурки и коллекционное',
  CHARISMA: 'Аксессуары',
  PERCEPTION: 'Постеры и декор',
  INTELLIGENCE: 'Манга и книги',
};

// frontend Product (админ-форма) -> backend ProductIn
export function mapProductInput(
  p: Product,
  refs?: { categories?: any[]; franchises?: any[] }
): any {
  const cats = refs?.categories || [];
  const frs = refs?.franchises || [];
  const targetCatName = SPECIAL_TO_CATEGORY_NAME[p.category];
  const category = targetCatName
    ? cats.find((c) => String(c?.name || '').toLowerCase() === targetCatName.toLowerCase())
    : undefined;
  const franchise = frs.find(
    (f) => String(f?.name || '').toLowerCase() === String(p.franchise || '').toLowerCase()
  );

  return {
    title_ru: p.titleRu || p.title || 'Без названия',
    title_original: p.title || null,
    description_ru: p.description || null,
    lore: p.lore || null,
    category_id: category?.id ?? null,
    franchise_id: franchise?.id ?? null,
    price_cny: 0,
    weight_g: Math.round((Number(p.weightWg) || 0) * 453.592),
    stock: Number(p.stock) || 0,
    condition_cnd: Number(p.conditionCnd) || 100,
    rarity: p.rarity || 'COMMON',
    badge: p.badge || null,
    status: p.status || 'DRAFT',
    featured: Boolean(p.featured),
    price_rub_override: p.priceRub != null ? Number(p.priceRub) : null,
    images: Array.isArray(p.images) ? p.images : [],
    variants: [],
    stats: (p.stats || []).map((s) => ({ label: s.label, value: s.value })),
  };
}

export function mapOrder(o: any): Order {
  const items = (Array.isArray(o?.items) ? o.items : []).map((it: any) => {
    const priceRub = Math.round(Number(it?.price_rub ?? 0));
    const product: Product = {
      id: String(it?.product_id ?? ''),
      title: it?.title || '',
      titleRu: it?.title || '',
      category: 'AGILITY',
      franchise: '',
      priceCaps: Math.round(priceRub / 10),
      priceRub,
      weightWg: 0,
      conditionCnd: 100,
      stock: 0,
      status: 'PUBLISHED',
      image: '',
      description: '',
      lore: '',
      rarity: 'COMMON',
      stats: [],
    };
    return { product, quantity: Number(it?.quantity ?? 1) };
  });

  const addressParts = [o?.region, o?.city, o?.street, o?.building, o?.apartment]
    .map((v) => (v ? String(v) : ''))
    .filter(Boolean);
  const location = addressParts.join(', ') + (o?.postal_code ? ` [Индекс: ${o.postal_code}]` : '');
  const totalRub = Math.round(Number(o?.total_rub ?? 0));

  return {
    id: String(o?.public_no ?? o?.id ?? ''),
    apiId: typeof o?.id === 'number' ? o.id : undefined,
    date: o?.created_at || new Date().toISOString(),
    recipientName: o?.recipient_name || '',
    wastelandLocation: location,
    paymentMethod: (o?.payment_method || 'BARTER_CASH') as Order['paymentMethod'],
    items,
    totalCaps: Math.round(totalRub / 10),
    totalRub,
    status: (o?.status || 'ORDER_PLACED') as Order['status'],
    trackingNumber: o?.tracking_number || '',
    telegram: o?.telegram || undefined,
    phone: o?.phone || undefined,
  };
}

export function mapUser(u: any): UserProfile {
  const raw = u || {};
  const addressDetails = {
    region: raw.region || '',
    city: raw.city || '',
    street: raw.street || '',
    building: raw.building || '',
    apartment: raw.apartment || '',
    postalCode: raw.postal_code || '',
    landmark: raw.landmark || '',
  };
  const hasAddress = Object.values(addressDetails).some(Boolean);

  return {
    id: String(raw.id ?? ''),
    callsign:
      raw.callsign ||
      raw.username ||
      (raw.email ? String(raw.email).split('@')[0] : '') ||
      'Wanderer',
    vaultId: raw.vault_id || 'Vault 67',
    role: raw.role === 'overseer' ? 'overseer' : 'dweller',
    capsBalance: Number(raw.caps_balance ?? 0),
    radLevel: Number(raw.rad_level ?? 0),
    equippedItems: Array.isArray(raw.equipped_items) ? raw.equipped_items : [],
    avatar: raw.avatar || undefined,
    realName: raw.real_name || undefined,
    email: raw.email || undefined,
    phone: raw.phone || undefined,
    telegram: raw.telegram || undefined,
    wastelandAddress: raw.wasteland_address || undefined,
    addressDetails: hasAddress ? addressDetails : undefined,
    bio: raw.bio || undefined,
    level: raw.level ?? undefined,
    karma: raw.karma ?? undefined,
  };
}

// backend { store: {...} } -> frontend StoreSettings (частично; capsToRubRate нет в API)
export function mapSettings(store: any): Partial<StoreSettings> {
  if (!store || typeof store !== 'object') return {};
  const out: Partial<StoreSettings> = {};
  if (typeof store.announcement === 'string') out.announcement = store.announcement;
  if (typeof store.announcementActive === 'boolean') out.announcementActive = store.announcementActive;
  if (typeof store.minOrderRub === 'number') out.minOrderRub = store.minOrderRub;
  if (typeof store.caravanFeeRub === 'number') out.caravanFeeRub = store.caravanFeeRub;
  return out;
}
