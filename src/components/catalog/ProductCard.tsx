import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { useVaultStore } from '../../store/useVaultStore';
import { soundManager } from '../../utils/sound';
import { ShoppingCart, Eye, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { theme, addToCart } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className={`group relative border-2 flex flex-col justify-between transition-all duration-150 ${
      isPreWar
        ? 'border-[#0033A0] bg-white text-[#1C2331] hover:border-[#FFD100] hover:shadow-lg'
        : 'border-[#15FF0E] bg-[#0D1117] text-[#15FF0E] hover:border-[#15FF0E] hover:shadow-[0_0_15px_rgba(21,255,14,0.25)]'
    }`}>
      {/* Верхний статус-бейдж: Франшиза и S.P.E.C.I.A.L. */}
      <div className={`px-2.5 py-1 border-b text-[10px] font-mono font-bold flex items-center justify-between tracking-wider ${
        isPreWar
          ? 'border-[#0033A0] bg-[#0033A0] text-[#FFD100]'
          : 'border-[#15FF0E] bg-[#15FF0E]/10 text-[#15FF0E]'
      }`}>
        <span className="truncate">{product.franchise}</span>
        <span className={`px-1 py-0.2 border ${
          isPreWar ? 'border-[#FFD100] text-white' : 'border-[#15FF0E] text-[#15FF0E]'
        }`}>
          [{product.category.substring(0, 3)}]
        </span>
      </div>

      {/* Фото товара с зеленым CRT-фильтром (снимается на :hover) */}
      <Link
        to={`/product/${product.id}`}
        onClick={() => soundManager.playTab()}
        className="relative block h-48 sm:h-52 overflow-hidden bg-black/40 border-b border-current p-2"
      >
        <img
          src={product.image}
          alt={product.titleRu}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            isPreWar ? '' : 'pipboy-image-filter'
          }`}
          loading="lazy"
        />

        {/* Рамка-прицел инспектора */}
        <div className="absolute inset-2 border border-current/20 pointer-events-none group-hover:border-current/60 transition-colors" />

        {/* Бейджи статуса и редкости */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          {product.status === 'PREORDER' && (
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-cyan-500 text-black shadow">
              ★ ПРЕДЗАКАЗ
            </span>
          )}
          {(product.status === 'OUT_OF_STOCK' || product.stock === 0) && (
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black shadow">
              НЕТ В НАЛИЧИИ
            </span>
          )}
          {product.badge && (
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-[#FFD100] text-[#0033A0] shadow">
              {product.badge}
            </span>
          )}
          {product.rarity === 'LEGENDARY' && (
            <div className={`px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
              isPreWar ? 'bg-[#FFD100] text-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117]'
            }`}>
              <Sparkles className="w-2.5 h-2.5" />
              <span>LEGENDARY ★★★</span>
            </div>
          )}
        </div>

        {/* CND полоска (Состояние) */}
        <div className="absolute bottom-3 left-3 right-3 bg-black/80 backdrop-blur-xs p-1.5 border border-current text-xs font-mono flex items-center justify-between">
          <span className="text-[11px] font-bold">CND: {product.conditionCnd}%</span>
          <div className="w-16 h-1.5 border border-current p-0.2">
            <div
              className={`h-full ${isPreWar ? 'bg-[#FFD100]' : 'bg-[#15FF0E]'}`}
              style={{ width: `${product.conditionCnd}%` }}
            />
          </div>
          <span className="text-[11px] font-bold">WG: {product.weightWg} lbs</span>
        </div>
      </Link>

      {/* Описание и характеристики */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/product/${product.id}`}
            onClick={() => soundManager.playTab()}
            className="block"
          >
            <h3 className="font-bold text-sm sm:text-base tracking-wide line-clamp-2 hover:underline mb-1.5 font-mono leading-snug">
              {product.titleRu}
            </h3>
            <p className="text-xs sm:text-[13px] opacity-90 font-mono line-clamp-1 mb-2.5 leading-normal text-current/90 font-medium">
              {product.title}
            </p>
          </Link>
        </div>

        {/* Нижний блок: Цена и кнопки действий */}
        <div className="pt-2 border-t border-current/30 mt-2">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-xl sm:text-2xl font-black tracking-tight font-mono">
                {product.priceRub.toLocaleString()} ₽
              </span>
              {product.oldPriceRub && product.oldPriceRub > product.priceRub && (
                <span className="text-xs line-through opacity-50 ml-2 font-mono">
                  {product.oldPriceRub.toLocaleString()} ₽
                </span>
              )}
            </div>
            {product.stock > 0 && product.stock <= 5 && (
              <span className="text-[10px] font-bold text-amber-400">
                ОСТАЛОСЬ: {product.stock} ШТ
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <Link
              to={`/product/${product.id}`}
              onClick={() => soundManager.playTab()}
              className={`pipboy-btn py-1.5 px-2 text-[11px] text-center flex items-center justify-center gap-1 ${
                isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>ОСМОТР</span>
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || product.status === 'OUT_OF_STOCK'}
              className={`pipboy-btn py-1.5 px-2 text-[11px] text-center flex items-center justify-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                isPreWar
                  ? 'bg-[#0033A0] text-white border-[#0033A0]'
                  : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
              }`}
            >
              <ShoppingCart className="w-3 h-3" />
              <span>
                {product.status === 'PREORDER' 
                  ? 'ПРЕДЗАКАЗ' 
                  : product.stock === 0 || product.status === 'OUT_OF_STOCK'
                    ? 'НЕТ' 
                    : 'В ЛУТ [E]'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
