import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductCardSkeleton } from '../components/catalog/ProductCardSkeleton';
import { Franchise, SpecialCategory } from '../types';
import { soundManager } from '../utils/sound';
import { 
  Filter, 
  Search, 
  RotateCcw, 
  SlidersHorizontal, 
  ChevronDown, 
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';

const ALL_FRANCHISES: Franchise[] = [
  'Fallout',
  'Anime / Evangelion',
  'Cyberpunk',
  'Warhammer 40k',
  'Marvel & DC',
  'Star Wars',
  'Gaming Classics'
];

const SPECIAL_KEYS: { key: SpecialCategory; label: string }[] = [
  { key: 'STRENGTH', label: '[STR] Сила (Фигурки & Статуи)' },
  { key: 'PERCEPTION', label: '[PER] Восприятие (Оптика & Постеры)' },
  { key: 'ENDURANCE', label: '[END] Выносливость (Одежда & Броня)' },
  { key: 'CHARISMA', label: '[CHA] Харизма (Значки & Крышки)' },
  { key: 'INTELLIGENCE', label: '[INT] Интеллект (Артбуки & Манга)' },
  { key: 'AGILITY', label: '[AGI] Ловкость (Гаджеты & Периферия)' },
  { key: 'LUCK', label: '[LCK] Удача (Секретные Лутбоксы)' },
];

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { products, categories, franchises, user, theme } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // Имитация асинхронного API-запроса к базе данных терминала RobCo
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState('ОПРОС СЕРВЕРОВ VAULT-TEC...');

  // Состояния фильтрации
  const categoryParam = searchParams.get('cat');
  const [selectedCategory, setSelectedCategory] = useState<string>(
    categoryParam || 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFranchises, setSelectedFranchises] = useState<string[]>([]);
  const [maxPriceRub, setMaxPriceRub] = useState<number>(30000);
  const [onlyLegendary, setOnlyLegendary] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'priceAsc' | 'priceDesc' | 'weight' | 'condition'>('priceAsc');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Имитация сетевого запроса к API при первом открытии каталога
  useEffect(() => {
    setIsLoading(true);
    setLoadingStep('ПОДКЛЮЧЕНИЕ К ХРАНИЛИЩУ РЕЛИКВИЙ...');

    const timer1 = setTimeout(() => {
      setLoadingStep('ДЕШИФРОВКА СВИНЦОВЫХ МАНИФЕСТОВ...');
    }, 350);

    const timer2 = setTimeout(() => {
      setIsLoading(false);
    }, 750);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Синхронизация при изменении URL параметра категории
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
  }, [categoryParam]);

  // Ручной перезапрос данных
  const handleReloadData = () => {
    soundManager.playClick();
    setIsLoading(true);
    setLoadingStep('ПОВТОРНОЕ СКАНИРОВАНИЕ РАДИОЗОНДОМ...');
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  };

  // Переключение франшизы
  const toggleFranchise = (f: string) => {
    soundManager.playClick();
    setSelectedFranchises((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  // Сброс фильтров
  const resetFilters = () => {
    soundManager.playClick();
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSelectedFranchises([]);
    setMaxPriceRub(30000);
    setOnlyLegendary(false);
    setSearchParams({});
  };

  // Фильтрация товаров
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Скрытие черновиков и архива для обычных покупателей
        if (user.role !== 'overseer' && (p.status === 'DRAFT' || p.status === 'ARCHIVED')) {
          return false;
        }

        // Категория
        if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
          return false;
        }
        // Поиск по названию или лору
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            p.title.toLowerCase().includes(q) ||
            p.titleRu.toLowerCase().includes(q) ||
            p.lore.toLowerCase().includes(q) ||
            p.franchise.toLowerCase().includes(q);
          if (!match) return false;
        }
        // Франшизы
        if (selectedFranchises.length > 0 && !selectedFranchises.includes(p.franchise)) {
          return false;
        }
        // Фильтр по цене в рублях
        if (p.priceRub > maxPriceRub) {
          return false;
        }
        // Редкость
        if (onlyLegendary && p.rarity !== 'LEGENDARY') {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.priceRub - b.priceRub;
        if (sortBy === 'priceDesc') return b.priceRub - a.priceRub;
        if (sortBy === 'weight') return a.weightWg - b.weightWg;
        if (sortBy === 'condition') return b.conditionCnd - a.conditionCnd;
        return 0;
      });
  }, [products, selectedCategory, searchQuery, selectedFranchises, maxPriceRub, onlyLegendary, sortBy, user.role]);

  return (
    <div className="space-y-6">
      {/* Заголовок страницы инвентаря */}
      <div className={`border-b pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono ${
        isPreWar ? 'border-[#0033A0]' : 'border-[#15FF0E]'
      }`}>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-80 mb-1 flex items-center gap-2">
            <span>[TERMLINK: INV_CATALOG_DB]</span>
            <span>|</span>
            <span>
              {isLoading 
                ? 'СКАНИРОВАНИЕ БАЗЫ ДАННЫХ...' 
                : `ДОСТУПНО: ${filteredProducts.length} ИЗ ${products.length} ПРЕДМЕТОВ`
              }
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider flex items-center gap-2">
            <span>СКЛАД ИНВЕНТАРЯ УБЕЖИЩА 67</span>
            {isLoading && (
              <Loader2 className="w-5 h-5 animate-spin inline-block text-current" />
            )}
          </h1>
        </div>

        {/* Поисковая строка терминала с мигающим курсором */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <div className={`flex items-center border-2 px-3 py-1.5 ${
              isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
            }`}>
              <Search className="w-4 h-4 mr-2 shrink-0 opacity-70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ФИЛЬТР ПО ТЕКСТУ..."
                className="bg-transparent border-none outline-none w-full text-xs font-mono uppercase placeholder:opacity-50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold px-1 hover:opacity-100"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <button
            onClick={handleReloadData}
            className={`pipboy-btn p-2 border-2 ${
              isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
            }`}
            title="Перезапросить манифест склада"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Индикатор статуса загрузки терминала */}
      {isLoading && (
        <div className={`border-2 p-3 font-mono text-xs flex items-center justify-between animate-pulse ${
          isPreWar ? 'border-[#0033A0] bg-blue-50 text-[#0033A0]' : 'border-[#15FF0E] bg-[#15FF0E]/10 text-[#15FF0E]'
        }`}>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span className="font-bold">&gt; API_STATUS: {loadingStep}</span>
          </div>
          <span className="text-[10px] hidden sm:inline">ROBCO PROTOCOL 2077 // SYNCING ASSETS</span>
        </div>
      )}

      {/* Быстрые вкладки разделов и категорий */}
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max font-mono text-xs">
          <button
            onClick={() => {
              soundManager.playTab();
              setSelectedCategory('ALL');
              setSearchParams({});
            }}
            className={`px-3 py-1.5 border font-bold uppercase transition-all ${
              selectedCategory === 'ALL'
                ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                : isPreWar ? 'border-[#0033A0]/40 text-[#0033A0]' : 'border-[#15FF0E]/40 text-[#15FF0E]'
            }`}
          >
            [ВСЕ РАЗДЕЛЫ]
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundManager.playTab();
                setSelectedCategory(item.key);
                setSearchParams({ cat: item.key });
              }}
              className={`px-3 py-1.5 border font-bold uppercase transition-all flex items-center gap-1.5 ${
                selectedCategory === item.key
                  ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                  : isPreWar ? 'border-[#0033A0]/40 text-[#0033A0]' : 'border-[#15FF0E]/40 text-[#15FF0E]'
              }`}
            >
              <span>{item.icon || '📦'}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Мобильная кнопка фильтров */}
      <div className="lg:hidden flex items-center justify-between font-mono text-xs">
        <button
          onClick={() => {
            soundManager.playClick();
            setIsMobileFilterOpen(!isMobileFilterOpen);
          }}
          className={`pipboy-btn py-2 px-4 flex items-center gap-2 ${
            isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>{isMobileFilterOpen ? 'СКРЫТЬ ФИЛЬТРЫ' : 'ФИЛЬТРЫ И СОРТИРОВКА'}</span>
        </button>

        <span className="opacity-80">
          НАЙДЕНО: {isLoading ? '...' : filteredProducts.length}
        </span>
      </div>

      {/* Основной макет: Сайдбар фильтров + Сетка товаров */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* САЙДБАР С ФИЛЬТРАМИ */}
        <aside className={`space-y-6 font-mono lg:block ${
          isMobileFilterOpen ? 'block' : 'hidden'
        }`}>
          {/* Блок 0: Разделы каталога в сайдбаре */}
          <div className={`border-2 p-4 ${
            isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
          }`}>
            <div className="font-bold text-xs uppercase tracking-wider border-b pb-2 mb-3 flex items-center justify-between border-current/30">
              <span>РАЗДЕЛЫ КАТАЛОГА</span>
              <span className="text-[10px] opacity-75">({categories.length})</span>
            </div>

            <div className="space-y-1 text-xs">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setSelectedCategory('ALL');
                  setSearchParams({});
                }}
                className={`w-full text-left px-2 py-1 flex items-center justify-between font-bold ${
                  selectedCategory === 'ALL'
                    ? isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
                    : 'hover:bg-current/10'
                }`}
              >
                <span>[ВСЕ РАЗДЕЛЫ]</span>
                <span className="text-[10px] opacity-80">{products.length}</span>
              </button>

              {categories.map((c) => {
                const count = products.filter(p => p.category === c.key).length;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedCategory(c.key);
                      setSearchParams({ cat: c.key });
                    }}
                    className={`w-full text-left px-2 py-1 flex items-center justify-between font-bold ${
                      selectedCategory === c.key
                        ? isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
                        : 'hover:bg-current/10'
                    }`}
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <span>{c.icon || '📦'}</span>
                      <span>{c.name}</span>
                    </span>
                    <span className="text-[10px] opacity-80">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Блок 1: Франшизы */}
          <div className={`border-2 p-4 ${
            isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
          }`}>
            <div className="font-bold text-xs uppercase tracking-wider border-b pb-2 mb-3 flex items-center justify-between border-current/30">
              <span>ФРАНШИЗЫ ПУСТОШИ</span>
              {selectedFranchises.length > 0 && (
                <span className="text-[10px] opacity-75">
                  ({selectedFranchises.length})
                </span>
              )}
            </div>

            <div className="space-y-2 text-xs">
              {franchises.map((franchise) => (
                <label
                  key={franchise}
                  className="flex items-center gap-2 cursor-pointer select-none hover:opacity-100 opacity-90"
                >
                  <input
                    type="checkbox"
                    checked={selectedFranchises.includes(franchise)}
                    onChange={() => toggleFranchise(franchise)}
                    className="w-4 h-4 accent-[#15FF0E] cursor-pointer"
                  />
                  <span>{franchise}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Блок 2: Ползунок цены (Рубли) */}
          <div className={`border-2 p-4 ${
            isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
          }`}>
            <div className="font-bold text-xs uppercase tracking-wider border-b pb-2 mb-3 flex items-center justify-between border-current/30">
              <span>МАКС. СТОИМОСТЬ</span>
              <span className="font-black text-sm">{maxPriceRub.toLocaleString()} ₽</span>
            </div>

            <input
              type="range"
              min="1000"
              max="30000"
              step="500"
              value={maxPriceRub}
              onChange={(e) => {
                setMaxPriceRub(Number(e.target.value));
              }}
              className="w-full cursor-pointer accent-[#15FF0E]"
            />

            <div className="flex justify-between text-[10px] opacity-70 mt-2">
              <span>1 000 ₽</span>
              <span>30 000 ₽</span>
            </div>
          </div>

          {/* Блок 3: Спецификаторы и Редкость */}
          <div className={`border-2 p-4 ${
            isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
          }`}>
            <div className="font-bold text-xs uppercase tracking-wider border-b pb-2 mb-3 border-current/30">
              МОДИФИКАТОРЫ
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                checked={onlyLegendary}
                onChange={() => {
                  soundManager.playClick();
                  setOnlyLegendary(!onlyLegendary);
                }}
                className="w-4 h-4 accent-[#15FF0E]"
              />
              <span className="font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ТОЛЬКО LEGENDARY ★★★
              </span>
            </label>
          </div>

          {/* Кнопка сброса */}
          <button
            onClick={resetFilters}
            className={`pipboy-btn w-full py-2 text-xs font-bold uppercase flex items-center justify-center gap-1.5 ${
              isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>СБРОСИТЬ ВСЕ ФИЛЬТРЫ</span>
          </button>
        </aside>

        {/* СЕТКА ТОВАРОВ / СКЕЛЕТНЫЕ ШАБЛОНЫ */}
        <div className="lg:col-span-3 space-y-4">
          {/* Панель сортировки */}
          <div className={`border-2 p-2.5 px-4 font-mono text-xs flex flex-wrap items-center justify-between gap-3 ${
            isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
          }`}>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 opacity-75" />
              <span className="font-bold uppercase">СОРТИРОВАТЬ ПО:</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  soundManager.playClick();
                  setSortBy(e.target.value as typeof sortBy);
                }}
                className={`border border-current px-2.5 py-1 text-xs font-mono outline-none cursor-pointer ${
                  isPreWar ? 'text-[#0033A0] bg-white' : 'text-[#15FF0E] bg-[#0D1117]'
                }`}
              >
                <option className={isPreWar ? 'bg-white text-[#0033A0]' : 'bg-[#0D1117] text-[#15FF0E]'} value="priceAsc">ЦЕНА: СНАЧАЛА ДЕШЕВЛЕ (₽)</option>
                <option className={isPreWar ? 'bg-white text-[#0033A0]' : 'bg-[#0D1117] text-[#15FF0E]'} value="priceDesc">ЦЕНА: СНАЧАЛА ДОРОЖЕ (₽)</option>
                <option className={isPreWar ? 'bg-white text-[#0033A0]' : 'bg-[#0D1117] text-[#15FF0E]'} value="weight">ВЕС В ИНВЕНТАРЕ (WG ЛЕГКИЙ)</option>
                <option className={isPreWar ? 'bg-white text-[#0033A0]' : 'bg-[#0D1117] text-[#15FF0E]'} value="condition">СОСТОЯНИЕ (CND 100%)</option>
              </select>
            </div>
          </div>

          {/* Отображение скелетонов во время загрузки */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={`border-2 p-12 text-center font-mono space-y-4 ${
              isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/80'
            }`}>
              <div className="text-4xl">⚠️</div>
              <h3 className="text-lg font-bold tracking-wider uppercase">
                ПРЕДМЕТЫ НЕ ОБНАРУЖЕНЫ В КАТАЛОГЕ
              </h3>
              <p className="text-xs opacity-80 max-w-md mx-auto leading-relaxed">
                По заданным критериям сканирования реликвии не найдены. Попробуйте сбросить фильтры франшизы или увеличить лимит крышек.
              </p>
              <button
                onClick={resetFilters}
                className={`pipboy-btn py-2 px-6 text-xs font-bold uppercase inline-flex items-center gap-2 ${
                  isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>СБРОСИТЬ ПАРАМЕТРЫ</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
