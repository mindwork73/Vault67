import React from 'react';
import { useVaultStore } from '../../store/useVaultStore';

export const ProductCardSkeleton: React.FC = () => {
  const { theme } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  return (
    <div className={`border-2 flex flex-col justify-between animate-pulse ${
      isPreWar
        ? 'border-[#0033A0]/40 bg-white'
        : 'border-[#15FF0E]/50 bg-black/70'
    }`}>
      {/* Верхний статус-бар */}
      <div className={`px-2.5 py-1 border-b flex justify-between items-center ${
        isPreWar ? 'border-[#0033A0]/30 bg-blue-50' : 'border-[#15FF0E]/30 bg-[#15FF0E]/10'
      }`}>
        <div className={`h-2.5 w-24 ${isPreWar ? 'bg-[#0033A0]/20' : 'bg-[#15FF0E]/30'}`} />
        <div className={`h-2.5 w-8 ${isPreWar ? 'bg-[#0033A0]/20' : 'bg-[#15FF0E]/30'}`} />
      </div>

      {/* Фото-заглушка со сканирующей сеткой */}
      <div className={`relative h-48 sm:h-52 border-b flex items-center justify-center overflow-hidden ${
        isPreWar ? 'border-[#0033A0]/30 bg-gray-100' : 'border-[#15FF0E]/30 bg-black/90'
      }`}>
        <div className="text-center font-mono space-y-2 p-4">
          <div className="w-8 h-8 mx-auto border-2 border-current border-t-transparent animate-spin rounded-full opacity-60" />
          <div className="text-[10px] tracking-widest uppercase opacity-75">
            [СКАНИРОВАНИЕ ЛУТА...]
          </div>
        </div>

        {/* Индикатор CND */}
        <div className="absolute bottom-3 left-3 right-3 bg-black/60 p-1 border border-current/40 flex justify-between items-center">
          <div className={`h-2 w-12 ${isPreWar ? 'bg-[#0033A0]/30' : 'bg-[#15FF0E]/30'}`} />
          <div className={`h-2 w-16 ${isPreWar ? 'bg-[#0033A0]/30' : 'bg-[#15FF0E]/30'}`} />
        </div>
      </div>

      {/* Текстовые строки */}
      <div className="p-3 space-y-3">
        <div className="space-y-1.5">
          <div className={`h-4 w-3/4 ${isPreWar ? 'bg-[#0033A0]/25' : 'bg-[#15FF0E]/40'}`} />
          <div className={`h-3 w-1/2 ${isPreWar ? 'bg-[#0033A0]/15' : 'bg-[#15FF0E]/20'}`} />
        </div>

        {/* Цена и кнопки */}
        <div className="pt-2 border-t border-current/20 space-y-2">
          <div className="flex justify-between items-baseline">
            <div className={`h-5 w-20 ${isPreWar ? 'bg-[#0033A0]/30' : 'bg-[#15FF0E]/40'}`} />
            <div className={`h-3 w-14 ${isPreWar ? 'bg-[#0033A0]/15' : 'bg-[#15FF0E]/20'}`} />
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <div className={`h-7 border ${isPreWar ? 'border-[#0033A0]/30' : 'border-[#15FF0E]/30'}`} />
            <div className={`h-7 border ${isPreWar ? 'border-[#0033A0]/30' : 'border-[#15FF0E]/30'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
