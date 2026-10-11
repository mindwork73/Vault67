import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { ModelViewer3D } from '../components/product/ModelViewer3D';
import { soundManager } from '../utils/sound';
import { Product } from '../types';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Sparkles, 
  Terminal,
  Check,
  Coins,
  CheckCircle2,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, addToCart, theme } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [remote, setRemote] = useState<{ status: 'loading' } | { status: 'done'; product: Product } | { status: 'error' }>({ status: 'loading' });

  const localProduct = products.find((p) => p.id === id);
  const product = localProduct ?? (remote.status === 'done' ? remote.product : undefined);

  // Карточка может открываться по прямой ссылке раньше, чем догрузится каталог.
  // Пока объект не найден локально — тянем с API напрямую, не показывая фантомную 404.
  useEffect(() => {
    let cancelled = false;
    if (!localProduct && id) {
      setRemote({ status: 'loading' });
      (async () => {
        try {
          const { api } = await import('../services/api');
          const { mapProduct } = await import('../services/adapters');
          const raw: any = await api.product(id);
          if (!cancelled) setRemote({ status: 'done', product: mapProduct(raw) });
        } catch {
          if (!cancelled) setRemote({ status: 'error' });
        }
      })();
    }
    return () => { cancelled = true; };
  }, [id, localProduct]);

  // Обработчик клавиши [E] для быстрого добавления в инвентарь
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'e' && !['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) {
        if (product && product.stock > 0) {
          handleAdd();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [product, quantity]);

  if (!product) {
    if (remote.status === 'loading' && !localProduct) {
      return (
        <div className={`border-2 p-12 text-center font-mono space-y-4 ${
          isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/80'
        }`}>
          <Loader2 className="w-8 h-8 mx-auto animate-spin" />
          <h2 className="text-xl font-bold uppercase">СВЕРКА С РЕЕСТРОМ ROBCO…</h2>
          <p className="text-xs opacity-75">Ищем объект в инвентарях Убежища и караванных списках.</p>
        </div>
      );
    }
    return (
      <div className={`border-2 p-12 text-center font-mono space-y-4 ${
        isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/80'
      }`}>
        <h2 className="text-xl font-bold uppercase">ОШИБКА 404 // ОБЪЕКТ НЕ НАЙДЕН</h2>
        <p className="text-xs opacity-75">Предмет был списан или украден рейдерами Пустоши.</p>
        <button
          onClick={() => navigate('/catalog')}
          className={`pipboy-btn py-2 px-6 text-xs font-bold ${
            isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
          }`}
        >
          ВЕРНУТЬСЯ В ИНВЕНТАРЬ
        </button>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2200);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Кнопка возврата в каталог */}
      <div className="flex items-center justify-between text-xs">
        <Link
          to="/catalog"
          onClick={() => soundManager.playClick()}
          className="flex items-center gap-1.5 hover:underline font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>[ESC] НАЗАД В КАТАЛОГ</span>
        </Link>

        <span className="opacity-75 uppercase">
          АРТИКУЛ: {product.id} // {product.franchise}
        </span>
      </div>

      {/* Двухколоночный интерфейс карточки товара */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ЛЕВАЯ КОЛОНКА (7/12): Фотогалерея (по умолчанию) + 3D инспектор */}
        <div className="lg:col-span-7 space-y-4">
          <ModelViewer3D
            productImage={product.image}
            productImages={product.images || [product.image]}
            productTitle={product.titleRu}
          />

          {/* Карточка истории / Lore */}
          <div className={`border-2 p-4 ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
          }`}>
            <div className="flex items-center gap-2 text-xs font-bold uppercase border-b pb-1.5 mb-2 border-current/30">
              <Terminal className="w-4 h-4" />
              <span>АРХИВНАЯ СПРАВКА // LORE</span>
            </div>
            <p className="text-sm sm:text-base leading-relaxed opacity-90">
              {product.lore}
            </p>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА (5/12): Упрощенный, понятный блок интернет-магазина */}
        <div className={`lg:col-span-5 border-2 p-5 space-y-5 ${
          isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/90 text-[#15FF0E]'
        }`}>
          {/* 1. СВЕРХУ: НАЗВАНИЕ ТОВАРА */}
          <div className="border-b pb-4 border-current/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                isPreWar ? 'border-[#0033A0] bg-[#0033A0] text-white' : 'border-[#15FF0E] bg-[#15FF0E]/20 text-[#15FF0E]'
              }`}>
                {product.franchise}
              </span>

              {product.rarity === 'LEGENDARY' && (
                <span className="text-[10px] font-black uppercase text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  LEGENDARY ★★★
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide leading-tight">
              {product.titleRu}
            </h1>
            <p className="text-xs sm:text-sm opacity-75">
              {product.title}
            </p>

            {/* ЦЕНА В РУБЛЯХ */}
            <div className="pt-2 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black tracking-tight text-white font-mono">
                {product.priceRub.toLocaleString()} ₽
              </span>

              {product.oldPriceRub && product.oldPriceRub > product.priceRub && (
                <span className="text-lg line-through opacity-50 font-bold font-mono">
                  {product.oldPriceRub.toLocaleString()} ₽
                </span>
              )}
            </div>
          </div>

          {/* 2. ОПИСАНИЕ ТОВАРА */}
          <div className="border-b pb-4 border-current/30 space-y-1.5">
            <div className="font-bold uppercase text-xs opacity-80">
              ОПИСАНИЕ ТОВАРА:
            </div>
            <p className="text-sm sm:text-base leading-relaxed opacity-95">
              {product.description}
            </p>
          </div>

          {/* 3. ПРОСТЫЕ ХАРАКТЕРИСТИКИ */}
          <div className="border-b pb-4 border-current/30 space-y-2">
            <div className="font-bold uppercase text-[11px] opacity-75 mb-2">
              ХАРАКТЕРИСТИКИ:
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 border border-current/30 bg-black/20">
                <span className="text-[10px] opacity-70 block uppercase">СОСТОЯНИЕ:</span>
                <span className="font-bold">{product.conditionCnd}% (Новое)</span>
              </div>

              <div className="p-2 border border-current/30 bg-black/20">
                <span className="text-[10px] opacity-70 block uppercase">ВЕС ПРЕДМЕТА:</span>
                <span className="font-bold">{product.weightWg} кг ({product.weightWg} lbs)</span>
              </div>

              <div className="p-2 border border-current/30 bg-black/20">
                <span className="text-[10px] opacity-70 block uppercase">КАТЕГОРИЯ:</span>
                <span className="font-bold">{product.category}</span>
              </div>

              <div className="p-2 border border-current/30 bg-black/20">
                <span className="text-[10px] opacity-70 block uppercase">ФРАНШИЗА:</span>
                <span className="font-bold">{product.franchise}</span>
              </div>

              {/* Дополнительные параметры из объекта продукта */}
              {product.stats.map((stat, idx) => (
                <div key={idx} className="p-2 border border-current/30 bg-black/20">
                  <span className="text-[10px] opacity-70 block uppercase">{stat.label}:</span>
                  <span className="font-bold">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. ДОСТУПНО НА СКЛАДЕ / СТАТУС */}
          <div className={`p-3 border text-xs flex items-center justify-between font-bold ${
            product.status === 'PREORDER'
              ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-400'
              : product.stock > 0 && product.status !== 'OUT_OF_STOCK'
                ? isPreWar ? 'border-green-600 bg-green-50 text-green-900' : 'border-emerald-500/60 bg-emerald-950/30 text-emerald-400'
                : 'border-red-500 bg-red-950/20 text-red-400'
          }`}>
            <span className="flex items-center gap-2 uppercase">
              {product.status === 'PREORDER' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span>СТАТУС ПОСТАВКИ:</span>
                </>
              ) : product.stock > 0 && product.status !== 'OUT_OF_STOCK' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ДОСТУПНО НА СКЛАДЕ:</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>НЕТ В НАЛИЧИИ:</span>
                </>
              )}
            </span>
            <span className="text-sm">
              {product.status === 'PREORDER' 
                ? '★ ОТКРЫТ ПРЕДЗАКАЗ' 
                : product.stock > 0 && product.status !== 'OUT_OF_STOCK'
                  ? `${product.stock} ЕД. В НАЛИЧИИ` 
                  : 'РАСПРОДАНО'}
            </span>
          </div>

          {/* 5. ВЫБОР КОЛИЧЕСТВА И КНОПКА ДОБАВЛЕНИЯ [E] */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold">КОЛИЧЕСТВО:</span>
              <div className="flex items-center border border-current">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  className="px-3 py-1 hover:bg-current hover:text-[#0D1117] transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 py-1 text-sm font-bold min-w-10 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setQuantity((q) => product.stock > 0 ? Math.min(product.stock, q + 1) : q + 1);
                  }}
                  className="px-3 py-1 hover:bg-current hover:text-[#0D1117] transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Главная кнопка ДОБАВИТЬ В КОРЗИНУ */}
            <button
              onClick={handleAdd}
              disabled={product.stock === 0 && product.status !== 'PREORDER' || product.status === 'OUT_OF_STOCK'}
              className={`pipboy-btn w-full py-3.5 px-4 font-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                addedNotice
                  ? 'bg-emerald-500 text-black border-emerald-500'
                  : product.status === 'PREORDER'
                    ? 'bg-cyan-500 text-black border-cyan-500 hover:bg-cyan-400'
                    : isPreWar
                      ? 'bg-[#0033A0] text-white border-[#0033A0]'
                      : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
              }`}
            >
              {addedNotice ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>ДОБАВЛЕНО В ПРИПАСЫ!</span>
                </>
              ) : product.status === 'PREORDER' ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>ОФОРМИТЬ ПРЕДЗАКАЗ [E]</span>
                </>
              ) : product.stock === 0 || product.status === 'OUT_OF_STOCK' ? (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span>НЕТ В НАЛИЧИИ</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>ДОБАВИТЬ В КОРЗИНУ [E]</span>
                </>
              )}
            </button>

            <div className="text-[10px] text-center opacity-70">
              Быстрая клавиша: нажмите <kbd className="px-1 border border-current font-bold">E</kbd> на клавиатуре
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
