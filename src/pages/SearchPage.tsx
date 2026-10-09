import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductCardSkeleton } from '../components/catalog/ProductCardSkeleton';
import { soundManager } from '../utils/sound';
import { 
  Search, 
  ArrowLeft, 
  SlidersHorizontal, 
  Sparkles, 
  Terminal,
  ShoppingBag
} from 'lucide-react';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products, theme } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  const query = searchParams.get('query') || searchParams.get('q') || '';
  const [localQuery, setLocalQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'priceAsc' | 'priceDesc'>('relevance');

  // Синхронизация при смене query в URL
  useEffect(() => {
    setLocalQuery(query);
    if (query) {
      setIsSearching(true);
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [query]);

  // Фильтрация товаров по поисковому запросу
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    return products
      .filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.titleRu.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.lore.toLowerCase().includes(q) ||
          p.franchise.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'priceAsc') return a.priceRub - b.priceRub;
        if (sortBy === 'priceDesc') return b.priceRub - a.priceRub;
        return 0;
      });
  }, [products, query, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      soundManager.playClick();
      setSearchParams({ query: localQuery.trim() });
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Верхняя навигация и статус */}
      <div className="flex items-center justify-between text-xs">
        <Link
          to="/catalog"
          onClick={() => soundManager.playClick()}
          className="flex items-center gap-1.5 hover:underline font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>[ESC] ВЕСЬ ИНВЕНТАРЬ</span>
        </Link>

        <span className="opacity-75 uppercase">
          ROBCO SEARCH PROTOCOL // DATABASE SCAN
        </span>
      </div>

      {/* Панель поиска */}
      <div className={`border-2 p-5 ${
        isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
      }`}>
        <div className="flex items-center gap-2 border-b pb-2 mb-4 border-current/30 text-xs font-bold uppercase">
          <Terminal className="w-4 h-4" />
          <span>РЕЗУЛЬТАТЫ СКАНИРОВАНИЯ БАЗЫ ДАННЫХ</span>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className={`flex items-center border-2 px-3 py-2 grow ${
            isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
          }`}>
            <Search className="w-4 h-4 mr-2 shrink-0 opacity-70" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="ВВЕДИТЕ КЛЮЧЕВОЕ СЛОВО (FALLOUT, EVANGELION, ХУДИ, ФИГУРКА)..."
              className="bg-transparent border-none outline-none w-full text-xs font-mono uppercase placeholder:opacity-50"
            />
            {localQuery && (
              <button
                type="button"
                onClick={() => setLocalQuery('')}
                className="text-xs font-bold px-1 hover:opacity-100"
              >
                ✕
              </button>
            )}
          </div>

          <button
            type="submit"
            className={`pipboy-btn py-2 px-6 text-xs font-bold uppercase flex items-center justify-center gap-2 ${
              isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>ИСКАТЬ [ENTER]</span>
          </button>
        </form>

        {/* Быстрые теги запросов */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] opacity-80">
          <span>ЧАСТЫЕ ЗАПРОСЫ:</span>
          {['Pip-Boy', 'Nuka-Cola', 'Евангелион', 'Cyberpunk', 'Шлем', 'Худи', 'Крышки'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                soundManager.playTab();
                setLocalQuery(tag);
                setSearchParams({ query: tag });
              }}
              className="hover:underline font-bold border border-current/40 px-1.5 py-0.5"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Панель результатов и сортировки */}
      <div className={`border-2 p-2.5 px-4 text-xs flex flex-wrap items-center justify-between gap-3 ${
        isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
      }`}>
        <div className="font-bold uppercase">
          {query ? (
            <span>
              ПО ЗАПРОСУ «<span className="text-amber-400">{query}</span>» НАЙДЕНО: {searchResults.length} ПРЕДМЕТОВ
            </span>
          ) : (
            <span>ВВЕДИТЕ ЗАПРОС ДЛЯ ПОИСКА ПО СКЛАДУ</span>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-3.5 h-3.5 opacity-75" />
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
              <option className={isPreWar ? 'bg-white text-[#0033A0]' : 'bg-[#0D1117] text-[#15FF0E]'} value="relevance">ПО РЕЛЕВАНТНОСТИ</option>
              <option className={isPreWar ? 'bg-white text-[#0033A0]' : 'bg-[#0D1117] text-[#15FF0E]'} value="priceAsc">ЦЕНА: СНАЧАЛА ДЕШЕВЛЕ</option>
              <option className={isPreWar ? 'bg-white text-[#0033A0]' : 'bg-[#0D1117] text-[#15FF0E]'} value="priceDesc">ЦЕНА: СНАЧАЛА ДОРОЖЕ</option>
            </select>
          </div>
        )}
      </div>

      {/* Сетка результатов или заглушки */}
      {isSearching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, idx) => (
            <ProductCardSkeleton key={idx} />
          ))}
        </div>
      ) : searchResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : query ? (
        <div className={`border-2 p-12 text-center space-y-4 ${
          isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/80'
        }`}>
          <div className="text-4xl">🔎</div>
          <h2 className="text-xl font-bold uppercase tracking-wider">
            НИЧЕГО НЕ НАЙДЕНО ПО ЗАПРОСУ «{query}»
          </h2>
          <p className="text-xs opacity-80 max-w-md mx-auto leading-relaxed">
            Похоже, данный артефакт еще не доставили караваны Пустоши. Попробуйте поискать по имени франшизы (Fallout, Cyberpunk, Evangelion) или перейдите в общий инвентарь.
          </p>
          <Link
            to="/catalog"
            onClick={() => soundManager.playTab()}
            className={`pipboy-btn inline-flex items-center gap-2 py-2 px-6 text-xs font-bold uppercase ${
              isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ВЕРНУТЬСЯ В КАТАЛОГ</span>
          </Link>
        </div>
      ) : (
        <div className={`border-2 p-12 text-center space-y-4 ${
          isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/80'
        }`}>
          <div className="text-4xl">📡</div>
          <h2 className="text-xl font-bold uppercase tracking-wider">
            ГОТОВНОСТЬ СИСТЕМЫ ПОИСКА ROBCO
          </h2>
          <p className="text-xs opacity-80 max-w-md mx-auto leading-relaxed">
            Введите ключевые слова в строку выше для мгновенного сканирования полок Убежища 67.
          </p>
        </div>
      )}
    </div>
  );
};
