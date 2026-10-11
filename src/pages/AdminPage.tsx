import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { 
  Product, 
  ProductStatus, 
  OrderStatus, 
  CategoryItem, 
  DwellerRecord 
} from '../types';
import { soundManager } from '../utils/sound';
import { mediaUrl } from '../services/adapters';
import { 
  Terminal, 
  Package, 
  Truck, 
  Coins, 
  Users, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  ShieldCheck, 
  Lock,
  ArrowRight,
  Layers,
  FolderPlus,
  Eye,
  EyeOff,
  Archive,
  Search,
  Filter,
  SlidersHorizontal,
  Bookmark,
  Sparkles,
  AlertTriangle,
  Download,
  Upload,
  Radio,
  FileText,
  Printer,
  TrendingUp,
  Tag,
  CheckSquare,
  Square,
  Clock,
  Settings
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { 
    user, 
    loginAs, 
    products, 
    orders, 
    categories,
    franchises,
    dwellers,
    storeSettings,
    addProduct, 
    updateProduct, 
    deleteProduct, 
    clearAllProducts,
    restoreDefaultProducts,
    updateProductStatus,
    bulkUpdateProductStatus,
    bulkDeleteProducts,
    toggleProductFeatured,
    updateProductStock,
    addCategory,
    updateCategory,
    deleteCategory,
    addFranchise,
    deleteFranchise,
    updateOrderStatus,
    deleteOrder,
    loadAllOrders,
    updateDwellerCaps,
    toggleDwellerStatus,
    updateStoreSettings,
    importStoreData,
    theme 
  } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // Активная вкладка админки
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'dwellers' | 'settings'>('products');

  // Админка: подтягиваем все заказы из API при переходе на вкладку заказов
  useEffect(() => {
    if (activeTab === 'orders' && user?.role === 'overseer') {
      void loadAllOrders();
    }
  }, [activeTab, user?.role, loadAllOrders]);

  // Фильтры и поиск в реестре товаров
  const [productSearch, setProductSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ProductStatus>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [franchiseFilter, setFranchiseFilter] = useState<string>('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK'>('ALL');

  // Множественный выбор товаров для массовых действий
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Модальные окна
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [isAddCatModalOpen, setIsAddCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isAddFranchiseModalOpen, setIsAddFranchiseModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<typeof orders[0] | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState('');

  // Форма добавления/редактирования товара
  const [formTitleRu, setFormTitleRu] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<string>(categories[0]?.key || 'STRENGTH');
  const [formFranchise, setFormFranchise] = useState<string>(franchises[0] || 'Fallout');
  const [formPriceCaps, setFormPriceCaps] = useState(500);
  const [formPriceRub, setFormPriceRub] = useState(5500);
  const [formOldPriceRub, setFormOldPriceRub] = useState<number | undefined>(undefined);
  const [formWeight, setFormWeight] = useState(1.5);
  const [formCondition, setFormCondition] = useState(100);
  const [formStock, setFormStock] = useState(10);
  const [formStatus, setFormStatus] = useState<ProductStatus>('PUBLISHED');
  const [formBadge, setFormBadge] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formImages, setFormImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'
  ]);
  const [inputImageUrl, setInputImageUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formLore, setFormLore] = useState('');
  const [formStats, setFormStats] = useState<{ label: string; value: string }[]>([
    { label: 'СОСТОЯНИЕ', value: '100% ИДЕАЛЬНОЕ' },
    { label: 'МАТЕРИАЛ', value: 'ОРИГИНАЛ РОБКО' }
  ]);

  // Форма создания/редактирования категории
  const [catFormName, setCatFormName] = useState('');
  const [catFormKey, setCatFormKey] = useState('');
  const [catFormIcon, setCatFormIcon] = useState('📦');
  const [catFormDesc, setCatFormDesc] = useState('');

  // Форма добавления франшизы
  const [newFranchiseName, setNewFranchiseName] = useState('');

  // Настройки оповещения
  const [bannerText, setBannerText] = useState(storeSettings?.announcement || '');
  const [bannerActive, setBannerActive] = useState(storeSettings?.announcementActive ?? true);

  // Если не Смотритель, показываем блокировку доступа
  if (user.role !== 'overseer') {
    return (
      <div className={`border-4 p-8 max-w-lg mx-auto my-12 text-center font-mono space-y-5 ${
        isPreWar
          ? 'border-[#0033A0] bg-white text-[#1C2331] shadow-2xl'
          : 'border-[#15FF0E] bg-black/90 text-[#15FF0E] shadow-[0_0_35px_rgba(21,255,14,0.3)]'
      }`}>
        <div className="flex justify-center">
          <Lock className="w-16 h-16 text-amber-400 animate-pulse" />
        </div>
        <div className="text-xs uppercase tracking-widest opacity-80">
          СИСТЕМА БЕЗОПАСНОСТИ ROBCO // ОТКАЗ В ДОСТУПЕ
        </div>
        <h1 className="text-2xl font-black uppercase tracking-wider">
          ДОСТУП ТОЛЬКО ДЛЯ СМОТРИТЕЛЯ
        </h1>
        <p className="text-xs opacity-85 leading-relaxed">
          Текущий уровень допуска вашего Pip-Boy ({user.callsign}) недостаточен для управления складом и караванами Убежища 67.
        </p>
        <button
          onClick={() => {
            soundManager.playFanfare();
            loginAs('overseer', 'Смотритель Убежища 67');
          }}
          className={`pipboy-btn w-full py-3 px-4 font-black text-xs uppercase tracking-wider ${
            isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
          }`}
        >
          [ИНИЦИАЛИЗИРОВАТЬ ПРАВА СМОТРИТЕЛЯ / OVERRIDE]
        </button>
      </div>
    );
  }

  // Расчет аналитики
  const totalLootSold = orders.reduce(
    (sum, o) => sum + o.items.reduce((acc, i) => acc + i.quantity, 0),
    0
  );
  const totalCapsTurnover = orders.reduce((sum, o) => sum + o.totalCaps, 0);
  const totalRubTurnover = orders.reduce(
    (sum, o) => sum + o.items.reduce((acc, i) => acc + i.product.priceRub * i.quantity, 0),
    0
  );
  const activeCaravansCount = orders.filter((o) => o.status === 'CARAVAN_DISPATCHED').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'PREPARATION').length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= 3).length;
  const outOfStockCount = products.filter((p) => p.stock === 0 || p.status === 'OUT_OF_STOCK').length;

  // Фильтрация товаров в таблице
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = 
        p.titleRu.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.franchise.toLowerCase().includes(productSearch.toLowerCase());
      if (!matchSearch) return false;

      const currentStatus = p.status || 'PUBLISHED';
      if (statusFilter !== 'ALL' && currentStatus !== statusFilter) return false;

      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;

      if (franchiseFilter !== 'ALL' && p.franchise !== franchiseFilter) return false;

      if (stockFilter === 'IN_STOCK' && p.stock <= 0) return false;
      if (stockFilter === 'LOW_STOCK' && (p.stock <= 0 || p.stock > 3)) return false;
      if (stockFilter === 'OUT_OF_STOCK' && p.stock > 0) return false;

      return true;
    });
  }, [products, productSearch, statusFilter, categoryFilter, franchiseFilter, stockFilter]);

  // Открытие модалки создания нового товара
  const handleOpenAddModal = () => {
    soundManager.playTab();
    setEditingProduct(null);
    setFormTitleRu('');
    setFormTitle('');
    setFormCategory(categories[0]?.key || 'STRENGTH');
    setFormFranchise(franchises[0] || 'Fallout');
    setFormPriceCaps(500);
    setFormPriceRub(5500);
    setFormOldPriceRub(undefined);
    setFormWeight(1.5);
    setFormCondition(100);
    setFormStock(10);
    setFormStatus('PUBLISHED');
    setFormBadge('');
    setFormFeatured(false);
    setFormImages(['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80']);
    setFormDesc('');
    setFormLore('');
    setFormStats([
      { label: 'СОСТОЯНИЕ', value: '100% ИДЕАЛЬНОЕ' },
      { label: 'МАТЕРИАЛ', value: 'ОРИГИНАЛ РОБКО' }
    ]);
    setIsAddEditModalOpen(true);
  };

  // Открытие модалки редактирования существующего товара
  const handleOpenEditModal = (p: Product) => {
    soundManager.playTab();
    setEditingProduct(p);
    setFormTitleRu(p.titleRu);
    setFormTitle(p.title);
    setFormCategory(p.category);
    setFormFranchise(p.franchise);
    setFormPriceCaps(p.priceCaps);
    setFormPriceRub(p.priceRub);
    setFormOldPriceRub(p.oldPriceRub);
    setFormWeight(p.weightWg);
    setFormCondition(p.conditionCnd);
    setFormStock(p.stock);
    setFormStatus(p.status || 'PUBLISHED');
    setFormBadge(p.badge || '');
    setFormFeatured(!!p.featured);
    setFormImages(p.images && p.images.length > 0 ? p.images : [p.image]);
    setFormDesc(p.description);
    setFormLore(p.lore);
    setFormStats(p.stats && p.stats.length > 0 ? p.stats.map(s => ({ label: s.label, value: String(s.value) })) : [
      { label: 'СОСТОЯНИЕ', value: `${p.conditionCnd}%` }
    ]);
    setIsAddEditModalOpen(true);
  };

  // Сохранение товара (Создание или Редактирование)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playFanfare();

    const savedProd: Product = {
      id: editingProduct ? editingProduct.id : `vault-item-${Date.now().toString().slice(-4)}`,
      title: formTitle || 'Custom Item',
      titleRu: formTitleRu || 'Новый товар',
      category: formCategory,
      franchise: formFranchise,
      priceCaps: formPriceCaps,
      priceRub: formPriceRub,
      oldPriceRub: formOldPriceRub && formOldPriceRub > formPriceRub ? formOldPriceRub : undefined,
      weightWg: formWeight,
      conditionCnd: formCondition,
      stock: formStock,
      status: formStatus,
      badge: formBadge.trim() ? formBadge.trim().toUpperCase() : undefined,
      featured: formFeatured,
      image: formImages[0] || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      images: formImages.length > 0 ? formImages : ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80'],
      description: formDesc || 'Описание предмета склада Убежища 67.',
      lore: formLore || 'Занесено в инвентарный реестр Убежища 67.',
      rarity: editingProduct ? editingProduct.rarity : (formFeatured ? 'LEGENDARY' : 'RARE'),
      stats: formStats.filter(s => s.label.trim())
    };

    if (editingProduct) {
      updateProduct(savedProd);
    } else {
      addProduct(savedProd);
    }

    setIsAddEditModalOpen(false);
  };

  // Фотографии: Добавление по URL
  const handleAddImageUrl = () => {
    if (!inputImageUrl.trim()) return;
    if (formImages.length >= 10) return;
    soundManager.playClick();
    setFormImages((prev) => [...prev, inputImageUrl.trim()]);
    setInputImageUrl('');
  };

  // Фотографии: Загрузка из файлов с компьютера
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    soundManager.playClick();
    const remainingSlots = 10 - formImages.length;
    const filesToLoad = Array.from(files).slice(0, remainingSlots);

    filesToLoad.forEach(async (file) => {
      try {
        const { api } = await import('../services/api');
        const res: any = await api.upload(file);
        const path = res?.path || res?.url;
        if (!path) throw new Error('upload failed');
        setFormImages((prev) => (prev.length >= 10 ? prev : [...prev, path]));
      } catch {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormImages((prev) => {
              if (prev.length >= 10) return prev;
              return [...prev, event.target!.result as string];
            });
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Фотографии: Сделать обложкой (переместить на 1-е место)
  const handleSetCoverImage = (index: number) => {
    if (index === 0) return;
    soundManager.playClick();
    setFormImages((prev) => {
      const item = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [item, ...rest];
    });
  };

  // Фотографии: Удаление
  const handleRemoveImage = (index: number) => {
    soundManager.playError();
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Добавление строки характеристики
  const handleAddStatRow = () => {
    setFormStats(prev => [...prev, { label: '', value: '' }]);
  };

  // Удаление строки характеристики
  const handleRemoveStatRow = (idx: number) => {
    setFormStats(prev => prev.filter((_, i) => i !== idx));
  };

  // Выбор всех товаров для массовых действий
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map(p => p.id));
    }
  };

  const handleToggleProductSelection = (id: string) => {
    setSelectedProductIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Массовое изменение статуса
  const handleBulkStatusChange = (status: ProductStatus) => {
    if (selectedProductIds.length === 0) return;
    soundManager.playClick();
    bulkUpdateProductStatus(selectedProductIds, status);
  };

  // Массовое удаление
  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (!window.confirm(`Вы уверены, что хотите удалить ${selectedProductIds.length} товаров?`)) return;
    soundManager.playError();
    bulkDeleteProducts(selectedProductIds);
    setSelectedProductIds([]);
  };

  // Категории: Открытие окна создания
  const handleOpenAddCategory = () => {
    soundManager.playTab();
    setEditingCategory(null);
    setCatFormName('');
    setCatFormKey('');
    setCatFormIcon('📦');
    setCatFormDesc('');
    setIsAddCatModalOpen(true);
  };

  // Категории: Открытие окна редактирования
  const handleOpenEditCategory = (cat: CategoryItem) => {
    soundManager.playTab();
    setEditingCategory(cat);
    setCatFormName(cat.name);
    setCatFormKey(cat.key);
    setCatFormIcon(cat.icon || '📦');
    setCatFormDesc(cat.description);
    setIsAddCatModalOpen(true);
  };

  // Категории: Сохранение (Создание / Обновление)
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormName.trim()) return;

    const key = (catFormKey.trim() || catFormName.trim().toUpperCase().replace(/\s+/g, '_')).replace(/[^A-Z0-9_]/gi, '');

    if (editingCategory) {
      updateCategory({
        ...editingCategory,
        name: catFormName.trim(),
        key: key.toUpperCase(),
        icon: catFormIcon || '📦',
        description: catFormDesc || 'Раздел магазина'
      });
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: catFormName.trim(),
        key: key.toUpperCase(),
        icon: catFormIcon || '📦',
        description: catFormDesc || 'Пользовательский раздел магазина'
      };
      addCategory(newCat);
    }

    setIsAddCatModalOpen(false);
  };

  // Франшизы: Добавление
  const handleCreateFranchise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFranchiseName.trim()) return;
    addFranchise(newFranchiseName.trim());
    setIsAddFranchiseModalOpen(false);
    setNewFranchiseName('');
  };

  // Сохранение настроек радиооповещения
  const handleSaveBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playFanfare();
    updateStoreSettings({
      announcement: bannerText,
      announcementActive: bannerActive
    });
  };

  // Экспорт данных магазина в JSON
  const handleExportData = () => {
    soundManager.playFanfare();
    const exportObject = {
      version: 'vault-67-v2.0',
      exportedAt: new Date().toISOString(),
      products,
      categories,
      franchises,
      orders
    };
    const jsonStr = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vault67-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Импорт данных из JSON
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.products || !Array.isArray(parsed.products)) {
        throw new Error('Некорректный формат файла: отсутствует массив products');
      }
      importStoreData(parsed);
      setIsImportModalOpen(false);
      setImportJsonText('');
      setImportError('');
    } catch (err: any) {
      setImportError(err.message || 'Ошибка парсинга JSON');
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* ШАПКА ТЕРМИНАЛА СМОТРИТЕЛЯ */}
      <div className={`border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isPreWar ? 'border-[#0033A0]' : 'border-[#15FF0E]'
      }`}>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-80 mb-1 flex items-center gap-2">
            <span>[TERMLINK: OVERSEER_CORE_CONSOLE]</span>
            <span>|</span>
            <span className="text-amber-400 font-bold">СВЕРХДОСТУП СМОТРИТЕЛЯ</span>
            <span>|</span>
            <span className="opacity-60">{new Date().toLocaleTimeString()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-7 h-7 text-current" />
            <span>ПАНЕЛЬ УПРАВЛЕНИЯ УБЕЖИЩА 67</span>
          </h1>
        </div>

        {/* Главные кнопки действий в шапке */}
        <div className="flex flex-wrap items-center gap-2">
          {products.length > 0 ? (
            <button
              onClick={() => {
                soundManager.playClick();
                setConfirmClearOpen(true);
              }}
              className="pipboy-btn py-2 px-3 text-xs font-bold uppercase flex items-center gap-1.5 border-red-500 text-red-400 hover:bg-red-500 hover:text-black transition-colors"
              title="Списать весь инвентарь со склада"
            >
              <Trash2 className="w-4 h-4" />
              <span>УБРАТЬ ВСЕ ТОВАРЫ</span>
            </button>
          ) : (
            <button
              onClick={() => restoreDefaultProducts()}
              className={`pipboy-btn py-2 px-3 text-xs font-bold uppercase flex items-center gap-1.5 ${
                isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>[ВОССТАНОВИТЬ СКЛАД]</span>
            </button>
          )}

          <button
            onClick={handleExportData}
            className="pipboy-btn py-2 px-3 text-xs font-bold uppercase flex items-center gap-1.5 border-current hover:bg-current/20 transition-colors"
            title="Экспорт базы в JSON"
          >
            <Download className="w-4 h-4" />
            <span>БЭКАП JSON</span>
          </button>

          <button
            onClick={() => {
              soundManager.playTab();
              setIsImportModalOpen(true);
            }}
            className="pipboy-btn py-2 px-3 text-xs font-bold uppercase flex items-center gap-1.5 border-current hover:bg-current/20 transition-colors"
            title="Импорт базы из JSON"
          >
            <Upload className="w-4 h-4" />
            <span>ИМПОРТ</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className={`pipboy-btn py-2 px-4 text-xs font-bold uppercase flex items-center gap-1.5 shadow-lg ${
              isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>+ ДОБАВИТЬ ТОВАР</span>
          </button>
        </div>
      </div>

      {/* НАВИГАЦИОННЫЕ ВКЛАДКИ АДМИНКИ */}
      <div className="flex flex-wrap gap-2 border-b border-current/30 pb-2">
        <button
          onClick={() => {
            soundManager.playTab();
            setActiveTab('dashboard');
          }}
          className={`px-3 py-2 border font-bold text-xs uppercase transition-all flex items-center gap-1.5 ${
            activeTab === 'dashboard'
              ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
              : 'border-current/40 opacity-70 hover:opacity-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>ОБЗОР & KPI</span>
        </button>

        <button
          onClick={() => {
            soundManager.playTab();
            setActiveTab('products');
          }}
          className={`px-3 py-2 border font-bold text-xs uppercase transition-all flex items-center gap-1.5 ${
            activeTab === 'products'
              ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
              : 'border-current/40 opacity-70 hover:opacity-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>РЕЕСТР ТОВАРОВ ({products.length})</span>
        </button>

        <button
          onClick={() => {
            soundManager.playTab();
            setActiveTab('categories');
          }}
          className={`px-3 py-2 border font-bold text-xs uppercase transition-all flex items-center gap-1.5 ${
            activeTab === 'categories'
              ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
              : 'border-current/40 opacity-70 hover:opacity-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>РАЗДЕЛЫ & БРЕНДЫ ({categories.length})</span>
        </button>

        <button
          onClick={() => {
            soundManager.playTab();
            setActiveTab('orders');
          }}
          className={`px-3 py-2 border font-bold text-xs uppercase transition-all flex items-center gap-1.5 ${
            activeTab === 'orders'
              ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
              : 'border-current/40 opacity-70 hover:opacity-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>ЗАКАЗЫ ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="bg-amber-400 text-black px-1.5 text-[9px] font-black rounded-sm">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            soundManager.playTab();
            setActiveTab('dwellers');
          }}
          className={`px-3 py-2 border font-bold text-xs uppercase transition-all flex items-center gap-1.5 ${
            activeTab === 'dwellers'
              ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
              : 'border-current/40 opacity-70 hover:opacity-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ЖИТЕЛИ ({dwellers.length})</span>
        </button>

        <button
          onClick={() => {
            soundManager.playTab();
            setActiveTab('settings');
          }}
          className={`px-3 py-2 border font-bold text-xs uppercase transition-all flex items-center gap-1.5 ${
            activeTab === 'settings'
              ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
              : 'border-current/40 opacity-70 hover:opacity-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>НАСТРОЙКИ МАГАЗИНА</span>
        </button>
      </div>

      {/* ВКЛАДКА: ДАШБОРД И ОБЗОР */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Главные KPI карточки */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`border-2 p-4 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
            }`}>
              <div className="flex items-center justify-between opacity-80 text-xs mb-1">
                <span>ВЫРУЧКА В РУБЛЯХ:</span>
                <Coins className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black">{totalRubTurnover.toLocaleString()} ₽</div>
              <div className="text-[10px] opacity-75 mt-1">
                Общий объем зарегистрированных оплат
              </div>
            </div>

            <div className={`border-2 p-4 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
            }`}>
              <div className="flex items-center justify-between opacity-80 text-xs mb-1">
                <span>ВСЕГО ЗАКАЗОВ:</span>
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black">{orders.length} СДЕЛОК</div>
              <div className="text-[10px] opacity-75 mt-1">
                {pendingOrdersCount} на сборке | {activeCaravansCount} в пути
              </div>
            </div>

            <div className={`border-2 p-4 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
            }`}>
              <div className="flex items-center justify-between opacity-80 text-xs mb-1">
                <span>ПРОДАНО ЕДИНИЦ:</span>
                <Package className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black">{totalLootSold} ПРЕДМЕТОВ</div>
              <div className="text-[10px] opacity-75 mt-1">
                Товаров в каталоге: {products.length}
              </div>
            </div>

            <div className={`border-2 p-4 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
            }`}>
              <div className="flex items-center justify-between opacity-80 text-xs mb-1">
                <span>КОНТРОЛЬ СКЛАДА:</span>
                <AlertTriangle className={`w-4 h-4 ${lowStockCount + outOfStockCount > 0 ? 'text-amber-400 animate-pulse' : ''}`} />
              </div>
              <div className="text-2xl font-black">{outOfStockCount} РАСПРОДАНО</div>
              <div className="text-[10px] opacity-75 mt-1 text-amber-400">
                {lowStockCount} позиций на исходе (&le; 3 шт)
              </div>
            </div>
          </div>

          {/* Статистика по статусам товаров */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`border-2 p-4 space-y-3 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/70 text-[#15FF0E]'
            }`}>
              <h3 className="font-black text-sm uppercase flex items-center gap-2 border-b pb-2 border-current/30">
                <Tag className="w-4 h-4" />
                <span>РАСПРЕДЕЛЕНИЕ ТОВАРОВ ПО СТАТУСАМ</span>
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  { status: 'PUBLISHED', label: 'ОПУБЛИКОВАНО (В ПРОДАЖЕ)', color: 'text-emerald-400', count: products.filter(p => (p.status || 'PUBLISHED') === 'PUBLISHED').length },
                  { status: 'PREORDER', label: 'ПРЕДЗАКАЗ', color: 'text-cyan-400', count: products.filter(p => p.status === 'PREORDER').length },
                  { status: 'OUT_OF_STOCK', label: 'НЕТ В НАЛИЧИИ', color: 'text-amber-400', count: products.filter(p => p.status === 'OUT_OF_STOCK' || p.stock === 0).length },
                  { status: 'DRAFT', label: 'ЧЕРНОВИКИ (СКРЫТЫ)', color: 'text-yellow-200', count: products.filter(p => p.status === 'DRAFT').length },
                  { status: 'ARCHIVED', label: 'В АРХИВЕ', color: 'text-gray-400', count: products.filter(p => p.status === 'ARCHIVED').length }
                ].map((s) => (
                  <div key={s.status} className="flex items-center justify-between p-1.5 border border-current/20">
                    <span className={`font-bold ${s.color}`}>● {s.label}</span>
                    <span className="font-bold px-2 py-0.5 border border-current/30">{s.count} шт</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Быстрый редактор радиооповещения */}
            <div className={`border-2 p-4 space-y-3 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/70 text-[#15FF0E]'
            }`}>
              <h3 className="font-black text-sm uppercase flex items-center gap-2 border-b pb-2 border-current/30">
                <Radio className="w-4 h-4 text-amber-400" />
                <span>ЭКСТРЕННОЕ РАДИООПОВЕЩЕНИЕ ROBCO</span>
              </h3>
              <p className="text-xs opacity-75">
                Текст отображается в верхней части всего интернет-магазина для покупателей
              </p>

              <form onSubmit={handleSaveBroadcast} className="space-y-3">
                <textarea
                  rows={2}
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                  className="w-full p-2 border-2 border-current bg-transparent outline-none text-xs"
                  placeholder="Текст объявления для Пустоши..."
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bannerActive}
                      onChange={(e) => setBannerActive(e.target.checked)}
                      className="accent-[#15FF0E] w-4 h-4"
                    />
                    <span>ТРАНСЛИРОВАТЬ НА САЙТЕ</span>
                  </label>

                  <button
                    type="submit"
                    className={`pipboy-btn py-1 px-4 text-xs font-bold uppercase ${
                      isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
                    }`}
                  >
                    СОХРАНИТЬ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ВКЛАДКА: РЕЕСТР ТОВАРОВ */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Панель фильтров и поиска */}
          <div className={`border-2 p-3 space-y-3 ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/70 text-[#15FF0E]'
          }`}>
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              {/* Поле поиска */}
              <div className="flex items-center gap-2 w-full md:w-80 grow">
                <Search className="w-4 h-4 opacity-70 shrink-0" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="ПОИСК ПО НАЗВАНИЮ, ID, БРЕНДУ..."
                  className="bg-transparent border-b border-current/50 outline-none w-full text-xs font-mono uppercase"
                />
              </div>

              {/* Фильтры */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
                {/* Фильтр по статусу */}
                <div className="flex items-center gap-1">
                  <span className="opacity-75">СТАТУС:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className={`border border-current px-2 py-1 outline-none text-[11px] ${
                      isPreWar ? 'bg-white text-[#0033A0]' : 'bg-[#0D1117] text-[#15FF0E]'
                    }`}
                  >
                    <option value="ALL">ВСЕ СТАТУСЫ</option>
                    <option value="PUBLISHED">● ОПУБЛИКОВАН</option>
                    <option value="PREORDER">★ ПРЕДЗАКАЗ</option>
                    <option value="OUT_OF_STOCK">▲ НЕТ В НАЛИЧИИ</option>
                    <option value="DRAFT">◌ ЧЕРНОВИК</option>
                    <option value="ARCHIVED">✖ В АРХИВЕ</option>
                  </select>
                </div>

                {/* Фильтр по разделу */}
                <div className="flex items-center gap-1">
                  <span className="opacity-75">РАЗДЕЛ:</span>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className={`border border-current px-2 py-1 outline-none text-[11px] ${
                      isPreWar ? 'bg-white text-[#0033A0]' : 'bg-[#0D1117] text-[#15FF0E]'
                    }`}
                  >
                    <option value="ALL">ВСЕ РАЗДЕЛЫ</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Фильтр по наличию */}
                <div className="flex items-center gap-1">
                  <span className="opacity-75">ОСТАТОК:</span>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className={`border border-current px-2 py-1 outline-none text-[11px] ${
                      isPreWar ? 'bg-white text-[#0033A0]' : 'bg-[#0D1117] text-[#15FF0E]'
                    }`}
                  >
                    <option value="ALL">ВСЕ</option>
                    <option value="IN_STOCK">В НАЛИЧИИ (&gt;0)</option>
                    <option value="LOW_STOCK">МАЛО (&le;3)</option>
                    <option value="OUT_OF_STOCK">РАСПРОДАНО (0)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Панель массовых действий (Bulk actions) */}
            {selectedProductIds.length > 0 && (
              <div className="pt-2 border-t border-current/30 flex flex-wrap items-center justify-between gap-2 text-xs bg-current/10 p-2">
                <div className="flex items-center gap-2 font-bold">
                  <span>ВЫБРАНО: {selectedProductIds.length} ТОВАРОВ</span>
                  <button
                    onClick={() => setSelectedProductIds([])}
                    className="text-[10px] underline hover:opacity-80"
                  >
                    [СБРОСИТЬ]
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="opacity-75 text-[11px]">МАССОВО ИЗМЕНИТЬ СТАТУС:</span>
                  <button
                    onClick={() => handleBulkStatusChange('PUBLISHED')}
                    className="pipboy-btn py-1 px-2 text-[10px] uppercase font-bold text-emerald-400 border-emerald-500 hover:bg-emerald-500 hover:text-black"
                  >
                    ОПУБЛИКОВАТЬ
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('PREORDER')}
                    className="pipboy-btn py-1 px-2 text-[10px] uppercase font-bold text-cyan-400 border-cyan-500 hover:bg-cyan-500 hover:text-black"
                  >
                    В ПРЕДЗАКАЗ
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('DRAFT')}
                    className="pipboy-btn py-1 px-2 text-[10px] uppercase font-bold text-yellow-300 border-yellow-400 hover:bg-yellow-400 hover:text-black"
                  >
                    В ЧЕРНОВИК
                  </button>
                  <button
                    onClick={() => handleBulkStatusChange('ARCHIVED')}
                    className="pipboy-btn py-1 px-2 text-[10px] uppercase font-bold text-gray-400 border-gray-500 hover:bg-gray-500 hover:text-black"
                  >
                    В АРХИВ
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="pipboy-btn py-1 px-2 text-[10px] uppercase font-bold text-red-400 border-red-500 hover:bg-red-500 hover:text-black"
                  >
                    УДАЛИТЬ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Таблица реестра товаров */}
          <div className={`border-2 overflow-x-auto ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
          }`}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b text-[11px] uppercase ${
                  isPreWar ? 'border-[#0033A0] bg-blue-50' : 'border-[#15FF0E] bg-[#15FF0E]/10'
                }`}>
                  <th className="p-3 w-8">
                    <button
                      onClick={handleSelectAll}
                      className="cursor-pointer"
                      title="Выбрать все"
                    >
                      {selectedProductIds.length > 0 && selectedProductIds.length === filteredProducts.length ? (
                        <CheckSquare className="w-4 h-4" />
                      ) : (
                        <Square className="w-4 h-4 opacity-70" />
                      )}
                    </button>
                  </th>
                  <th className="p-3">ФОТО & ID</th>
                  <th className="p-3">НАЗВАНИЕ ТОВАРА</th>
                  <th className="p-3">РАЗДЕЛ & БРЕНД</th>
                  <th className="p-3">ЦЕНА (₽)</th>
                  <th className="p-3">СКЛАД</th>
                  <th className="p-3">СТАТУС ТОВАРА</th>
                  <th className="p-3 text-center">ХИТ</th>
                  <th className="p-3 text-right">УПРАВЛЕНИЕ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-current/20">
                {filteredProducts.map((p) => {
                  const currentStatus = p.status || 'PUBLISHED';
                  const isSelected = selectedProductIds.includes(p.id);

                  return (
                    <tr 
                      key={p.id} 
                      className={`hover:bg-current/5 transition-colors ${
                        isSelected ? 'bg-current/10' : ''
                      }`}
                    >
                      {/* Чекбокс */}
                      <td className="p-3">
                        <button
                          onClick={() => handleToggleProductSelection(p.id)}
                          className="cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-current" />
                          ) : (
                            <Square className="w-4 h-4 opacity-50" />
                          )}
                        </button>
                      </td>

                      {/* Фото и артикул */}
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="relative group w-10 h-10 border border-current shrink-0 overflow-hidden">
                            <img
                              src={p.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                            {p.images && p.images.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] text-white px-0.5">
                                +{p.images.length - 1}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] opacity-75 font-mono">{p.id}</span>
                        </div>
                      </td>

                      {/* Название */}
                      <td className="p-3 max-w-xs">
                        <div className="font-bold flex items-center gap-1.5">
                          <span className="truncate">{p.titleRu}</span>
                          {p.badge && (
                            <span className="text-[9px] px-1 py-0.2 bg-amber-400 text-black font-black">
                              {p.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] opacity-70 truncate">{p.title}</div>
                      </td>

                      {/* Раздел & Франшиза */}
                      <td className="p-3">
                        <div className="font-bold text-amber-400">[{p.category}]</div>
                        <div className="text-[10px] opacity-75">{p.franchise}</div>
                      </td>

                      {/* Цена */}
                      <td className="p-3 font-bold">
                        <div className="text-sm font-mono">
                          {p.priceRub.toLocaleString()} ₽
                          {p.oldPriceRub && p.oldPriceRub > p.priceRub && (
                            <span className="text-[10px] line-through opacity-60 ml-1">
                              {p.oldPriceRub.toLocaleString()} ₽
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Остаток на складе с кнопками +/- */}
                      <td className="p-3">
                        <div className="flex items-center gap-1 border border-current px-1 py-0.5 w-fit">
                          <button
                            onClick={() => updateProductStock(p.id, p.stock - 1)}
                            className="px-1 hover:bg-current/20 font-bold"
                            title="Уменьшить остаток"
                          >
                            -
                          </button>
                          <span className={`px-1.5 font-bold ${
                            p.stock > 3 
                              ? 'text-emerald-400' 
                              : p.stock > 0 
                                ? 'text-amber-400' 
                                : 'text-red-400'
                          }`}>
                            {p.stock}
                          </span>
                          <button
                            onClick={() => updateProductStock(p.id, p.stock + 1)}
                            className="px-1 hover:bg-current/20 font-bold"
                            title="Увеличить остаток"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* СТАТУС ТОВАРА: ИНТЕРАКТИВНЫЙ DROPDOWN В СТРОКЕ */}
                      <td className="p-3">
                        <select
                          value={currentStatus}
                          onChange={(e) => updateProductStatus(p.id, e.target.value as ProductStatus)}
                          className={`border px-2 py-1 text-[11px] font-bold outline-none cursor-pointer ${
                            currentStatus === 'PUBLISHED'
                              ? 'text-emerald-400 border-emerald-500'
                              : currentStatus === 'PREORDER'
                                ? 'text-cyan-400 border-cyan-500'
                                : currentStatus === 'OUT_OF_STOCK'
                                  ? 'text-amber-400 border-amber-500'
                                  : currentStatus === 'DRAFT'
                                    ? 'text-yellow-200 border-yellow-300'
                                    : 'text-gray-400 border-gray-500'
                          } ${isPreWar ? 'bg-white' : 'bg-[#0D1117]'}`}
                        >
                          <option value="PUBLISHED">● ОПУБЛИКОВАН</option>
                          <option value="PREORDER">★ ПРЕДЗАКАЗ</option>
                          <option value="OUT_OF_STOCK">▲ НЕТ В НАЛИЧИИ</option>
                          <option value="DRAFT">◌ ЧЕРНОВИК</option>
                          <option value="ARCHIVED">✖ В АРХИВЕ</option>
                        </select>
                      </td>

                      {/* Хит продаж */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleProductFeatured(p.id)}
                          className={`p-1 hover:scale-125 transition-transform ${
                            p.featured ? 'text-amber-400' : 'opacity-30 hover:opacity-100'
                          }`}
                          title="Переключить статус хита продаж"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </td>

                      {/* Действия: Просмотр / Редактировать / Удалить */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/product/${p.id}`}
                            className="p-1.5 border border-current hover:bg-current/20 transition-colors"
                            title="Посмотреть на витрине"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1.5 border border-current hover:bg-current/20 transition-colors"
                            title="Редактировать товар"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (window.confirm(`Удалить товар "${p.titleRu}"?`)) {
                                deleteProduct(p.id);
                              }
                            }}
                            className="p-1.5 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black transition-colors"
                            title="Удалить товар"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="p-8 text-center text-xs opacity-70">
                Товары по заданным параметрам поиска не найдены.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ВКЛАДКА: УПРАВЛЕНИЕ РАЗДЕЛАМИ И БРЕНДАМИ */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Разделы каталога */}
          <div className={`border-2 p-5 space-y-4 ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-current/30">
              <div>
                <h2 className="text-lg font-black uppercase flex items-center gap-2">
                  <Layers className="w-5 h-5 text-current" />
                  <span>РАЗДЕЛЫ МАГАЗИНА ({categories.length})</span>
                </h2>
                <p className="text-xs opacity-75">
                  Создавайте и настраивайте категории (одежда, фигурки, реплики, манга)
                </p>
              </div>

              <button
                onClick={handleOpenAddCategory}
                className={`pipboy-btn py-1.5 px-3 text-xs uppercase font-bold flex items-center gap-1 ${
                  isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                }`}
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ СОЗДАТЬ РАЗДЕЛ</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const count = products.filter(p => p.category === cat.key).length;

                return (
                  <div
                    key={cat.id}
                    className="border-2 border-current/40 p-4 flex flex-col justify-between space-y-3 hover:border-current transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{cat.icon || '📦'}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 border border-current/40">
                          {count} ТОВАРОВ
                        </span>
                      </div>
                      <div className="font-bold text-base mt-2">{cat.name}</div>
                      <div className="text-[10px] text-amber-400 font-bold">KEY: [{cat.key}]</div>
                      <div className="text-xs opacity-75 mt-1 leading-relaxed">{cat.description}</div>
                    </div>

                    <div className="pt-2 border-t border-current/20 flex items-center justify-between text-xs">
                      <Link
                        to={`/catalog?cat=${cat.key}`}
                        className="hover:underline flex items-center gap-1 font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>КАТАЛОГ</span>
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEditCategory(cat)}
                          className="hover:underline text-amber-400 font-bold"
                        >
                          [ИЗМЕНИТЬ]
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Удалить раздел "${cat.name}"?`)) {
                              deleteCategory(cat.id);
                            }
                          }}
                          disabled={categories.length <= 1}
                          className="text-red-400 hover:underline disabled:opacity-40"
                        >
                          [УДАЛИТЬ]
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Франшизы и бренды */}
          <div className={`border-2 p-5 space-y-4 ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-current/30">
              <div>
                <h2 className="text-lg font-black uppercase flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-current" />
                  <span>ФРАНШИЗЫ И БРЕНДЫ ({franchises.length})</span>
                </h2>
                <p className="text-xs opacity-75">
                  Управляйте списками вселенных для фильтров каталога
                </p>
              </div>

              <button
                onClick={() => {
                  soundManager.playTab();
                  setIsAddFranchiseModalOpen(true);
                }}
                className={`pipboy-btn py-1.5 px-3 text-xs uppercase font-bold flex items-center gap-1 ${
                  isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>+ ДОБАВИТЬ ВСЕЛЕННУЮ</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {franchises.map((f) => {
                const count = products.filter(p => p.franchise === f).length;
                return (
                  <div
                    key={f}
                    className="border-2 border-current/40 px-3 py-1.5 flex items-center gap-2 text-xs hover:border-current transition-colors"
                  >
                    <span className="font-bold">{f}</span>
                    <span className="text-[10px] opacity-70">({count} шт)</span>
                    <button
                      onClick={() => {
                        if (window.confirm(`Удалить франшизу "${f}"?`)) {
                          deleteFranchise(f);
                        }
                      }}
                      className="text-red-400 hover:font-black ml-1"
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ВКЛАДКА: ЗАКАЗЫ И КАРАВАНЫ */}
      {activeTab === 'orders' && (
        <div className={`border-2 overflow-x-auto ${
          isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
        }`}>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b text-[11px] uppercase ${
                isPreWar ? 'border-[#0033A0] bg-blue-50' : 'border-[#15FF0E] bg-[#15FF0E]/10'
              }`}>
                <th className="p-3">НОМЕР / ДАТА</th>
                <th className="p-3">ЗАКАЗЧИК & КООРДИНАТЫ</th>
                <th className="p-3">СОСТАВ СДЕЛКИ</th>
                <th className="p-3">ИТОГО</th>
                <th className="p-3">СТАТУС КАРАВАНА</th>
                <th className="p-3 text-right">УПРАВЛЕНИЕ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-current/20">
              {orders.map((o) => {
                const totalRub = o.items.reduce((s, it) => s + it.product.priceRub * it.quantity, 0);

                return (
                  <tr key={o.id} className="hover:bg-current/5 transition-colors">
                    <td className="p-3">
                      <div className="font-bold">{o.id}</div>
                      <div className="text-[10px] opacity-75">{o.date}</div>
                      <div className="text-[10px] text-amber-400 font-bold">{o.trackingNumber}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold">{o.recipientName}</div>
                      {o.telegram && (
                        <div className="text-[10px] text-sky-400 font-bold">
                          TG: {o.telegram}
                        </div>
                      )}
                      <div className="text-[10px] opacity-75 max-w-xs truncate">{o.wastelandLocation}</div>
                    </td>

                    <td className="p-3 text-[11px]">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="truncate max-w-xs">
                          • {item.product.titleRu} (x{item.quantity})
                        </div>
                      ))}
                    </td>

                    <td className="p-3 font-bold text-sm">
                      <div className="font-mono">{totalRub.toLocaleString()} ₽</div>
                    </td>

                    <td className="p-3">
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                        className={`border px-2 py-1 text-[11px] font-bold outline-none cursor-pointer ${
                          o.status === 'PREPARATION'
                            ? 'border-yellow-500 text-yellow-400'
                            : o.status === 'CARAVAN_DISPATCHED' || o.status === 'IN_TRANSIT'
                              ? 'border-blue-500 text-blue-400'
                              : o.status === 'OUT_FOR_DELIVERY'
                                ? 'border-cyan-500 text-cyan-400'
                                : o.status === 'DELIVERED_TO_VAULT'
                                  ? 'border-emerald-500 text-emerald-400'
                                  : 'border-red-500 text-red-400'
                        } ${isPreWar ? 'bg-white' : 'bg-[#0D1117]'}`}
                      >
                        <option value="PREPARATION">СБОРКА НА СКЛАДЕ</option>
                        <option value="CARAVAN_DISPATCHED">В ПУТИ (IN TRANSIT)</option>
                        <option value="OUT_FOR_DELIVERY">КУРЬЕР НА ПОДХОДЕ (OUT FOR DELIVERY)</option>
                        <option value="DELIVERED_TO_VAULT">ДОСТАВЛЕН В УБЕЖИЩЕ</option>
                        <option value="CANCELLED">ОТМЕНЕН</option>
                      </select>
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            soundManager.playTab();
                            setViewingOrder(o);
                          }}
                          className="pipboy-btn py-1 px-2 text-[10px] uppercase font-bold flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>НАКЛАДНАЯ</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Удалить запись заказа ${o.id}?`)) {
                              deleteOrder(o.id);
                            }
                          }}
                          className="p-1 border border-red-500 text-red-400 hover:bg-red-500 hover:text-black transition-colors"
                          title="Удалить заказ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="p-8 text-center text-xs opacity-70">
              Пока нет оформленных заказов.
            </div>
          )}
        </div>
      )}

      {/* ВКЛАДКА: ЖИТЕЛИ УБЕЖИЩА И КЛИЕНТЫ */}
      {activeTab === 'dwellers' && (
        <div className={`border-2 p-5 space-y-4 ${
          isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
        }`}>
          <div className="border-b pb-3 border-current/30 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black uppercase flex items-center gap-2">
                <Users className="w-5 h-5 text-current" />
                <span>РЕГИСТР ЖИТЕЛЕЙ УБЕЖИЩА 67</span>
              </h2>
              <p className="text-xs opacity-75">
                Учет постоянных клиентов, балансы крышек и программа лояльности
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dwellers.map((dweller) => (
              <div 
                key={dweller.id}
                className="border-2 border-current/40 p-4 space-y-3 hover:border-current transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">{dweller.callsign}</span>
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold border ${
                    dweller.role === 'overseer'
                      ? 'border-amber-400 text-amber-400'
                      : 'border-emerald-400 text-emerald-400'
                  }`}>
                    {dweller.role === 'overseer' ? '★ OVERSEER' : 'DWELLER'}
                  </span>
                </div>

                <div className="text-xs space-y-1 opacity-90">
                  <div>ID: <span className="font-mono">{dweller.id}</span></div>
                  <div>Убежище: {dweller.vaultId}</div>
                  <div>Сделок: {dweller.ordersCount} | Сумма покупок: {dweller.totalSpentRub.toLocaleString()} ₽</div>
                </div>

                <div className="p-2 border border-amber-400/50 bg-amber-950/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-400">
                    БАЛАНС: {dweller.capsBalance.toLocaleString()} CAPS
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateDwellerCaps(dweller.id, -100)}
                      className="px-1.5 py-0.5 border border-current text-[10px] hover:bg-current/20 font-bold"
                      title="Списать 100 крышек"
                    >
                      -100
                    </button>
                    <button
                      onClick={() => updateDwellerCaps(dweller.id, 100)}
                      className="px-1.5 py-0.5 border border-current text-[10px] hover:bg-current/20 font-bold"
                      title="Начислить 100 крышек"
                    >
                      +100
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-current/20 flex justify-between text-[10px] opacity-75">
                  <span>Регистрация: {dweller.registeredAt}</span>
                  <button
                    onClick={() => toggleDwellerStatus(dweller.id)}
                    className="hover:underline font-bold"
                  >
                    СТАТУС: {dweller.status === 'ACTIVE' ? 'АКТИВЕН' : 'ИЗОЛЯЦИЯ'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ВКЛАДКА: НАСТРОЙКИ МАГАЗИНА */}
      {activeTab === 'settings' && (
        <div className={`border-2 p-5 space-y-6 max-w-3xl ${
          isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
        }`}>
          <div className="border-b pb-3 border-current/30">
            <h2 className="text-lg font-black uppercase flex items-center gap-2">
              <Settings className="w-5 h-5 text-current" />
              <span>СИСТЕМНЫЕ ПАРАМЕТРЫ ТОРГОВОГО УЗЛА</span>
            </h2>
            <p className="text-xs opacity-75">
              Управление курсом крышек, доставкой и резервным копированием
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold mb-1 uppercase">КУРС КОНВЕРТАЦИИ (1 CAPS = X РУБ):</label>
                <input
                  type="number"
                  value={storeSettings.capsToRubRate}
                  onChange={(e) => updateStoreSettings({ capsToRubRate: Number(e.target.value) })}
                  className="w-full p-2 border-2 border-current bg-transparent outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 uppercase">СТОИМОСТЬ ДОСТАВКИ КАРАВАНОМ (₽):</label>
                <input
                  type="number"
                  value={storeSettings.caravanFeeRub}
                  onChange={(e) => updateStoreSettings({ caravanFeeRub: Number(e.target.value) })}
                  className="w-full p-2 border-2 border-current bg-transparent outline-none font-bold"
                />
              </div>
            </div>

            {/* Экстренное объявление */}
            <div>
              <label className="block font-bold mb-1 uppercase">ОБЪЯВЛЕНИЕ СМОТРИТЕЛЯ НА САЙТЕ:</label>
              <textarea
                rows={2}
                value={bannerText}
                onChange={(e) => setBannerText(e.target.value)}
                className="w-full p-2 border-2 border-current bg-transparent outline-none"
              />
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bannerActive}
                    onChange={(e) => setBannerActive(e.target.checked)}
                    className="accent-[#15FF0E] w-4 h-4"
                  />
                  <span>ВКЛЮЧИТЬ БАННЕР В ШАПКЕ МАГАЗИНА</span>
                </label>
                <button
                  type="button"
                  onClick={handleSaveBroadcast}
                  className={`pipboy-btn py-1 px-4 font-bold uppercase ${
                    isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
                  }`}
                >
                  ПРИМЕНИТЬ
                </button>
              </div>
            </div>

            {/* Резервное копирование */}
            <div className="pt-4 border-t border-current/30 space-y-3">
              <h3 className="font-bold uppercase text-sm">РЕЗЕРВНОЕ КОПИРОВАНИЕ ДАННЫХ:</h3>
              <p className="text-xs opacity-75">
                Вы можете сохранить весь каталог товаров и разделов в файл JSON или загрузить сохраненную базу.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleExportData}
                  className="pipboy-btn py-2 px-4 uppercase font-bold flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>СКАЧАТЬ БЭКАП (.JSON)</span>
                </button>
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="pipboy-btn py-2 px-4 uppercase font-bold flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>ЗАГРУЗИТЬ БАЗУ (.JSON)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ДОБАВЛЕНИЯ / РЕДАКТИРОВАНИЯ ТОВАРА */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`border-4 p-6 max-w-4xl w-full my-8 relative max-h-[90vh] overflow-y-auto ${
            isPreWar
              ? 'border-[#0033A0] bg-white text-[#1C2331]'
              : 'border-[#15FF0E] bg-[#0D1117] text-[#15FF0E]'
          }`}>
            <button
              onClick={() => setIsAddEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-current/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3 mb-4 border-current/30">
              <h2 className="text-xl font-bold uppercase tracking-wider">
                {editingProduct ? `РЕДАКТИРОВАНИЕ ТОВАРА: ${editingProduct.titleRu}` : 'ДОБАВЛЕНИЕ НОВОГО ПРЕДМЕТА НА СКЛАД'}
              </h2>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1 uppercase">НАЗВАНИЕ (РУС):</label>
                  <input
                    type="text"
                    required
                    value={formTitleRu}
                    onChange={(e) => setFormTitleRu(e.target.value)}
                    className="w-full p-2 border-2 border-current bg-transparent outline-none font-bold"
                    placeholder="Напр. Набор крышек Пустоши (50 шт)"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 uppercase">ОРИГИНАЛЬНОЕ НАЗВАНИЕ (ENG):</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full p-2 border-2 border-current bg-transparent outline-none"
                    placeholder="Wasteland Caps Set"
                  />
                </div>

                {/* Выбор раздела */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold uppercase">РАЗДЕЛ МАГАЗИНА:</label>
                    <button
                      type="button"
                      onClick={handleOpenAddCategory}
                      className="text-[10px] underline hover:opacity-80"
                    >
                      + новый раздел
                    </button>
                  </div>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full p-2 border-2 border-current outline-none font-bold ${
                      isPreWar ? 'text-[#0033A0] bg-white' : 'text-[#15FF0E] bg-[#0D1117]'
                    }`}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.key}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Выбор франшизы */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold uppercase">ФРАНШИЗА / ВСЕЛЕННАЯ:</label>
                    <button
                      type="button"
                      onClick={() => setIsAddFranchiseModalOpen(true)}
                      className="text-[10px] underline hover:opacity-80"
                    >
                      + бренд
                    </button>
                  </div>
                  <select
                    value={formFranchise}
                    onChange={(e) => setFormFranchise(e.target.value)}
                    className={`w-full p-2 border-2 border-current outline-none font-bold ${
                      isPreWar ? 'text-[#0033A0] bg-white' : 'text-[#15FF0E] bg-[#0D1117]'
                    }`}
                  >
                    {franchises.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>

                {/* СТАТУС ТОВАРА */}
                <div>
                  <label className="block font-bold mb-1 uppercase">СТАТУС ТОВАРА:</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProductStatus)}
                    className={`w-full p-2 border-2 border-current outline-none font-bold ${
                      isPreWar ? 'text-[#0033A0] bg-white' : 'text-[#15FF0E] bg-[#0D1117]'
                    }`}
                  >
                    <option value="PUBLISHED">● ОПУБЛИКОВАН (В продаже)</option>
                    <option value="PREORDER">★ ПРЕДЗАКАЗ (Доступен для заказа)</option>
                    <option value="OUT_OF_STOCK">▲ НЕТ В НАЛИЧИИ (Ожидается)</option>
                    <option value="DRAFT">◌ ЧЕРНОВИК (Скрыт)</option>
                    <option value="ARCHIVED">✖ В АРХИВЕ (Снят)</option>
                  </select>
                </div>

                {/* Цены */}
                <div>
                  <label className="block font-bold mb-1 uppercase">ЦЕНА В РУБЛЯХ (₽):</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPriceRub}
                    onChange={(e) => setFormPriceRub(Number(e.target.value))}
                    className="w-full p-2 border-2 border-current bg-transparent outline-none font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 uppercase">СТАРАЯ ЦЕНА ДЛЯ СКИДКИ (₽):</label>
                  <input
                    type="number"
                    min="0"
                    value={formOldPriceRub ?? ''}
                    onChange={(e) => setFormOldPriceRub(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Не обязательно"
                    className="w-full p-2 border-2 border-current bg-transparent outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold uppercase">БОНУС В КРЫШКАХ (CAPS):</label>
                    <button
                      type="button"
                      onClick={() => setFormPriceCaps(Math.round(formPriceRub * 0.1))}
                      className="text-[10px] underline hover:opacity-80"
                    >
                      авто (10% кэшбэк)
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formPriceCaps}
                    onChange={(e) => setFormPriceCaps(Number(e.target.value))}
                    className="w-full p-2 border-2 border-current bg-transparent outline-none font-bold text-amber-400"
                  />
                  <div className="text-[10px] opacity-60 mt-1">
                    Крышки начисляются покупателю как бонусная программа лояльности
                  </div>
                </div>

                {/* Склад и характеристики */}
                <div>
                  <label className="block font-bold mb-1 uppercase">ОСТАТОК НА СКЛАДЕ (ШТ):</label>
                  <input
                    type="number"
                    min="0"
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full p-2 border-2 border-current bg-transparent outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 uppercase">ВЕС В ИНВЕНТАРЕ (КГ / LBS):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formWeight}
                    onChange={(e) => setFormWeight(Number(e.target.value))}
                    className="w-full p-2 border-2 border-current bg-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 uppercase">СОСТОЯНИЕ CND (%):</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formCondition}
                    onChange={(e) => setFormCondition(Number(e.target.value))}
                    className="w-full p-2 border-2 border-current bg-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1 uppercase">МЕТКА / БЕЙДЖ (НАПР. ХИТ, SALE):</label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="ХИТ, ТОП, ЭКСКЛЮЗИВ..."
                    className="w-full p-2 border-2 border-current bg-transparent outline-none uppercase"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="accent-[#15FF0E] w-5 h-5"
                    />
                    <span>⭐ ЗАКРЕПИТЬ НА ГЛАВНОЙ (ХИТ ПРОДАЖ)</span>
                  </label>
                </div>
              </div>

              {/* УПРАВЛЕНИЕ ФОТОГРАФИЯМИ (ДО 10 ФОТО) */}
              <div className="space-y-3 border-2 border-current/30 p-3 bg-black/20">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase flex items-center gap-1.5">
                    <span>ФОТОГРАФИИ ТОВАРА:</span>
                    <span className="text-amber-400">({formImages.length} из 10)</span>
                  </label>
                  <span className="text-[10px] opacity-75">
                    Первое фото — обложка. Кликните «Сделать обложкой», чтобы поменять.
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={inputImageUrl}
                    onChange={(e) => setInputImageUrl(e.target.value)}
                    placeholder="Вставьте URL фотографии (https://...)"
                    className="grow p-2 border border-current bg-transparent outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    disabled={!inputImageUrl.trim() || formImages.length >= 10}
                    className="pipboy-btn py-1.5 px-3 uppercase font-bold text-[11px] disabled:opacity-40"
                  >
                    + ДОБАВИТЬ URL
                  </button>

                  <label className="pipboy-btn py-1.5 px-3 uppercase font-bold text-[11px] cursor-pointer text-center flex items-center justify-center">
                    <span>📁 ЗАГРУЗИТЬ С ПК</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={formImages.length >= 10}
                    />
                  </label>
                </div>

                {formImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative group border-2 border-current p-1 bg-black/40 space-y-1">
                        <div className="h-24 w-full overflow-hidden">
                          <img src={mediaUrl(img)} alt="" className="w-full h-full object-cover" />
                        </div>

                        <div className="flex items-center justify-between text-[10px]">
                          <span className={idx === 0 ? 'text-amber-400 font-bold' : 'opacity-70'}>
                            {idx === 0 ? '★ ОБЛОЖКА' : `#${idx + 1}`}
                          </span>

                          <div className="flex items-center gap-1">
                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(idx)}
                                className="underline hover:text-amber-400"
                                title="Сделать главной"
                              >
                                Вверх
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="text-red-400 font-bold px-1"
                              title="Удалить"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] opacity-60 text-center py-3">
                    Нет загруженных фотографий.
                  </div>
                )}
              </div>

              {/* Описание и Лор */}
              <div>
                <label className="block font-bold mb-1 uppercase">ОПИСАНИЕ ДЛЯ ПОКУПАТЕЛЕЙ:</label>
                <textarea
                  rows={3}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full p-2 border-2 border-current bg-transparent outline-none"
                  placeholder="Подробное описание товара..."
                />
              </div>

              <div>
                <label className="block font-bold mb-1 uppercase">АРХИВНАЯ СПРАВКА / LORE УБЕЖИЩА 67:</label>
                <textarea
                  rows={2}
                  value={formLore}
                  onChange={(e) => setFormLore(e.target.value)}
                  className="w-full p-2 border-2 border-current bg-transparent outline-none"
                  placeholder="Лорная история предмета..."
                />
              </div>

              {/* Динамические характеристики HUD */}
              <div className="space-y-2 border border-current/30 p-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold uppercase">ХАРАКТЕРИСТИКИ ПРЕДМЕТА (HUD STATS):</label>
                  <button
                    type="button"
                    onClick={handleAddStatRow}
                    className="text-[10px] underline hover:opacity-80"
                  >
                    + добавить параметр
                  </button>
                </div>

                <div className="space-y-2">
                  {formStats.map((stat, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Параметр (напр. МАТЕРИАЛ)"
                        value={stat.label}
                        onChange={(e) => {
                          const updated = [...formStats];
                          updated[idx].label = e.target.value;
                          setFormStats(updated);
                        }}
                        className="p-1 border border-current bg-transparent w-1/3 outline-none uppercase text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Значение (напр. СТАЛЬ 1050)"
                        value={stat.value}
                        onChange={(e) => {
                          const updated = [...formStats];
                          updated[idx].value = e.target.value;
                          setFormStats(updated);
                        }}
                        className="p-1 border border-current bg-transparent grow outline-none text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStatRow(idx)}
                        className="text-red-400 p-1 font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="pipboy-btn py-2 px-4 uppercase font-bold"
                >
                  ОТМЕНА
                </button>
                <button
                  type="submit"
                  className={`pipboy-btn py-2 px-6 uppercase font-bold ${
                    isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
                  }`}
                >
                  {editingProduct ? '[СОХРАНИТЬ ИЗМЕНЕНИЯ]' : '[СОЗДАТЬ ТОВАР]'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ / РЕДАКТИРОВАНИЯ РАЗДЕЛА */}
      {isAddCatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className={`border-4 p-6 max-w-md w-full relative space-y-4 ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-[#0D1117] text-[#15FF0E]'
          }`}>
            <button
              onClick={() => setIsAddCatModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-current/20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-2">
              <h3 className="text-lg font-bold uppercase">
                {editingCategory ? `ИЗМЕНЕНИЕ РАЗДЕЛА: ${editingCategory.name}` : 'СОЗДАНИЕ НОВОГО РАЗДЕЛА'}
              </h3>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 uppercase">НАЗВАНИЕ РАЗДЕЛА:</label>
                <input
                  type="text"
                  required
                  value={catFormName}
                  onChange={(e) => setCatFormName(e.target.value)}
                  placeholder="Напр. Одежда и Броня, Манга"
                  className="w-full p-2 border-2 border-current bg-transparent outline-none font-bold"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 uppercase">СИСТЕМНЫЙ КЛЮЧ (KEY / ID):</label>
                <input
                  type="text"
                  value={catFormKey}
                  onChange={(e) => setCatFormKey(e.target.value)}
                  placeholder="CLOTHING, MANGA (автоматически если пусто)"
                  className="w-full p-2 border-2 border-current bg-transparent outline-none uppercase"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 uppercase">ИКОНКА / ЭМОДЗИ:</label>
                <input
                  type="text"
                  value={catFormIcon}
                  onChange={(e) => setCatFormIcon(e.target.value)}
                  placeholder="🎒, 🛡️, 📚, ⚡"
                  className="w-full p-2 border-2 border-current bg-transparent outline-none text-base"
                />
              </div>

              <div>
                <label className="block font-bold mb-1 uppercase">ОПИСАНИЕ РАЗДЕЛА:</label>
                <textarea
                  rows={2}
                  value={catFormDesc}
                  onChange={(e) => setCatFormDesc(e.target.value)}
                  placeholder="Краткое описание товаров данного раздела..."
                  className="w-full p-2 border-2 border-current bg-transparent outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddCatModalOpen(false)}
                  className="pipboy-btn py-1.5 px-3 uppercase font-bold"
                >
                  ОТМЕНА
                </button>
                <button
                  type="submit"
                  className={`pipboy-btn py-1.5 px-5 uppercase font-bold ${
                    isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
                  }`}
                >
                  СОХРАНИТЬ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО СОЗДАНИЯ ФРАНШИЗЫ */}
      {isAddFranchiseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className={`border-4 p-6 max-w-sm w-full relative space-y-4 ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-[#0D1117] text-[#15FF0E]'
          }`}>
            <button
              onClick={() => setIsAddFranchiseModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-current/20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-2">
              <h3 className="text-lg font-bold uppercase">ДОБАВИТЬ ВСЕЛЕННУЮ</h3>
            </div>

            <form onSubmit={handleCreateFranchise} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 uppercase">НАЗВАНИЕ ФРАНШИЗЫ:</label>
                <input
                  type="text"
                  required
                  value={newFranchiseName}
                  onChange={(e) => setNewFranchiseName(e.target.value)}
                  placeholder="Напр. Genshin Impact, Ведьмак"
                  className="w-full p-2 border-2 border-current bg-transparent outline-none font-bold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddFranchiseModalOpen(false)}
                  className="pipboy-btn py-1.5 px-3 uppercase font-bold"
                >
                  ОТМЕНА
                </button>
                <button
                  type="submit"
                  className={`pipboy-btn py-1.5 px-5 uppercase font-bold ${
                    isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
                  }`}
                >
                  ДОБАВИТЬ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО НАКЛАДНОЙ ЗАКАЗА (ИНВОЙС ROBCO) */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`border-4 p-6 max-w-2xl w-full relative space-y-4 max-h-[90vh] overflow-y-auto ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-[#0D1117] text-[#15FF0E]'
          }`}>
            <button
              onClick={() => setViewingOrder(null)}
              className="absolute top-4 right-4 p-1 hover:bg-current/20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3 flex items-center justify-between">
              <div>
                <div className="text-[10px] opacity-75">ROBCO INDUSTRIES // ЭЛЕКТРОННАЯ НАКЛАДНАЯ</div>
                <h3 className="text-xl font-black">ЗАКАЗ {viewingOrder.id}</h3>
              </div>
              <div className="text-right">
                <div className="text-amber-400 font-bold">{viewingOrder.trackingNumber}</div>
                <div className="text-[10px] opacity-75">{viewingOrder.date}</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 border border-current/30 bg-black/20">
                <div>
                  <span className="opacity-70 block text-[10px]">ПОЛУЧАТЕЛЬ:</span>
                  <span className="font-bold">{viewingOrder.recipientName}</span>
                </div>
                <div>
                  <span className="opacity-70 block text-[10px]">СПОСОБ РАСЧЕТА:</span>
                  <span className="font-bold">{viewingOrder.paymentMethod}</span>
                </div>
                {viewingOrder.telegram && (
                  <div className="col-span-2 text-sky-400">
                    <span className="opacity-70 block text-[10px] text-current">TELEGRAM ДЛЯ СВЯЗИ:</span>
                    <a
                      href={`https://t.me/${viewingOrder.telegram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold underline flex items-center gap-1"
                    >
                      <span>{viewingOrder.telegram}</span>
                    </a>
                  </div>
                )}
                <div className="col-span-2">
                  <span className="opacity-70 block text-[10px]">КООРДИНАТЫ ДОСТАВКИ:</span>
                  <span className="font-bold">{viewingOrder.wastelandLocation}</span>
                </div>
              </div>

              {/* Таблица состава заказа */}
              <div className="border border-current/30 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-current/30 bg-current/10 text-[10px]">
                    <tr>
                      <th className="p-2">ПРЕДМЕТ</th>
                      <th className="p-2">КОЛ-ВО</th>
                      <th className="p-2">ЦЕНА</th>
                      <th className="p-2 text-right">СУММА</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-current/20">
                    {viewingOrder.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2 flex items-center gap-2">
                          <img src={it.product.image} alt="" className="w-8 h-8 object-cover border border-current" />
                          <div>
                            <div className="font-bold">{it.product.titleRu}</div>
                            <div className="text-[9px] opacity-70">{it.product.id}</div>
                          </div>
                        </td>
                        <td className="p-2 font-bold">{it.quantity} шт</td>
                        <td className="p-2">{it.product.priceRub.toLocaleString()} ₽</td>
                        <td className="p-2 text-right font-bold">
                          {(it.product.priceRub * it.quantity).toLocaleString()} ₽
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex justify-between items-baseline font-bold text-sm border-t border-current/30">
                <span>ИТОГ К ОПЛАТЕ:</span>
                <span className="text-xl">
                  {viewingOrder.items.reduce((s, it) => s + it.product.priceRub * it.quantity, 0).toLocaleString()} ₽
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="pipboy-btn py-1.5 px-3 uppercase text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>ПЕЧАТЬ НАКЛАДНОЙ</span>
              </button>

              <button
                onClick={() => setViewingOrder(null)}
                className={`pipboy-btn py-1.5 px-5 uppercase text-xs font-bold ${
                  isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
                }`}
              >
                ЗАКРЫТЬ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ИМПОРТА БАЗЫ */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className={`border-4 p-6 max-w-lg w-full relative space-y-4 ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-[#0D1117] text-[#15FF0E]'
          }`}>
            <button
              onClick={() => setIsImportModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-current/20"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-2">
              <h3 className="text-lg font-bold uppercase">ИМПОРТ ДАННЫХ МАГАЗИНА (JSON)</h3>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-3 text-xs">
              <p className="opacity-80">
                Вставьте JSON структуру, экспортированную ранее:
              </p>

              <textarea
                rows={8}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='{"products": [...], "categories": [...]}'
                className="w-full p-2 border-2 border-current bg-transparent outline-none font-mono text-[11px]"
              />

              {importError && (
                <div className="text-red-400 font-bold">{importError}</div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="pipboy-btn py-1.5 px-3 uppercase font-bold"
                >
                  ОТМЕНА
                </button>
                <button
                  type="submit"
                  className={`pipboy-btn py-1.5 px-5 uppercase font-bold ${
                    isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
                  }`}
                >
                  ЗАГРУЗИТЬ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ПОДТВЕРЖДЕНИЯ СБРОСА ВСЕХ ТОВАРОВ */}
      {confirmClearOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className={`border-4 p-6 max-w-md w-full relative text-center space-y-4 shadow-2xl ${
            isPreWar
              ? 'border-red-600 bg-white text-[#1C2331]'
              : 'border-red-500 bg-[#0D1117] text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.4)]'
          }`}>
            <div className="text-3xl">⚠️</div>
            <h3 className="text-lg font-black uppercase tracking-wider">
              ПОДТВЕРЖДЕНИЕ СПИСАНИЯ ВСЕХ ТОВАРОВ
            </h3>
            <p className="text-xs opacity-90 leading-relaxed font-mono">
              Внимание, Смотритель! Вы собираетесь полностью списать инвентарь склада Убежища 67 ({products.length} товаров будут удалены).
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmClearOpen(false)}
                className="pipboy-btn flex-1 py-2 text-xs font-bold uppercase border-current"
              >
                ОТМЕНА
              </button>
              <button
                onClick={() => {
                  clearAllProducts();
                  setConfirmClearOpen(false);
                }}
                className="pipboy-btn flex-1 py-2 text-xs font-bold uppercase bg-red-600 text-white border-red-600 hover:bg-red-700"
              >
                ДА, УДАЛИТЬ ВСЕ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
