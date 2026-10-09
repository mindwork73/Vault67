import React from 'react';
import { Link } from 'react-router-dom';
import { useVaultStore } from '../../store/useVaultStore';
import { soundManager } from '../../utils/sound';
import { Radio, ShieldCheck, Terminal, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { theme, triggerKonamiBonus } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  return (
    <footer className={`mt-20 border-t-2 font-mono text-xs transition-colors duration-200 ${
      isPreWar
        ? 'bg-[#0033A0] text-white border-[#FFD100]'
        : 'bg-[#06090c] text-[#15FF0E]/80 border-[#15FF0E]'
    }`}>
      {/* Главная информационная полоса */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-6 h-6 border font-bold flex items-center justify-center text-xs ${
              isPreWar ? 'border-[#FFD100] text-[#FFD100]' : 'border-[#15FF0E] text-[#15FF0E]'
            }`}>
              67
            </div>
            <span className="font-bold text-base tracking-widest">
              VAULT 67 REQUISITIONS
            </span>
          </div>
          <p className="opacity-80 text-[11px] leading-relaxed mb-3">
            Главный распределительный склад довоенного гик-мерча, аниме-реликвий и силового снаряжения Пустоши.
            Одобрено Смотрителем Убежища 67.
          </p>
          <div className="flex items-center gap-2 text-[10px] opacity-70">
            <Radio className="w-3.5 h-3.5 animate-pulse text-current" />
            <span>ЧАСТОТА РАДИОСТАНЦИИ: 104.2 FM GEEK-WAVE</span>
          </div>
        </div>

        <div>
          <div className="font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b pb-1 border-current/30">
            <Terminal className="w-3.5 h-3.5" />
            <span>Терминалы и Каталог</span>
          </div>
          <ul className="space-y-1.5 text-[12px]">
            <li>
              <Link to="/catalog" onClick={() => soundManager.playClick()} className="hover:underline flex items-center gap-1">
                <span>&gt;</span> Полный Инвентарь
              </Link>
            </li>
            <li>
              <Link to="/catalog?cat=STRENGTH" onClick={() => soundManager.playClick()} className="hover:underline flex items-center gap-1">
                <span>&gt;</span> Фигурки и Статуи [STR]
              </Link>
            </li>
            <li>
              <Link to="/catalog?cat=ENDURANCE" onClick={() => soundManager.playClick()} className="hover:underline flex items-center gap-1">
                <span>&gt;</span> Одежда и Броня [END]
              </Link>
            </li>
            <li>
              <Link to="/catalog?cat=LUCK" onClick={() => soundManager.playClick()} className="hover:underline flex items-center gap-1">
                <span>&gt;</span> Mystery Boxes [LCK]
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b pb-1 border-current/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Голозаписи Выживания</span>
          </div>
          <ul className="space-y-1.5 text-[12px]">
            <li>
              <Link to="/delivery" onClick={() => soundManager.playClick()} className="hover:underline flex items-center gap-1">
                <span>&gt;</span> LOG_01: Караваны Пустоши
              </Link>
            </li>
            <li>
              <Link to="/payment" onClick={() => soundManager.playClick()} className="hover:underline flex items-center gap-1">
                <span>&gt;</span> LOG_02: Бартер и Крышки
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={() => soundManager.playClick()} className="hover:underline flex items-center gap-1">
                <span>&gt;</span> LOG_03: Досье Убежища 67
              </Link>
            </li>
            <li>
              <Link to="/admin" onClick={() => soundManager.playClick()} className="hover:underline flex items-center gap-1 text-amber-400">
                <span>&gt;</span> Доступ Смотрителя (Админ)
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b pb-1 border-current/30">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Секретные Протоколы</span>
          </div>
          <div className={`p-2.5 border text-[11px] leading-relaxed mb-3 ${
            isPreWar ? 'border-[#FFD100]/50 bg-blue-900/60' : 'border-[#15FF0E]/30 bg-black/50'
          }`}>
            <span className="font-bold block mb-1">ПОДСКАЗКА ТЕРМИНАЛА:</span>
            Введите на клавиатуре:
            <code className="block mt-1 font-mono font-bold tracking-wider text-amber-400">
              ↑ ↑ ↓ ↓ ← → ← → B A
            </code>
            для вызова одобрения Волт-Боя и начисления крышек.
          </div>
          <button
            onClick={() => triggerKonamiBonus()}
            className="text-[10px] underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            [Активировать протокол вручную]
          </button>
        </div>
      </div>

      {/* Копирайт RobCo */}
      <div className={`border-t py-3 px-4 text-center text-[10px] ${
        isPreWar ? 'border-[#FFD100]/30 text-white/80' : 'border-[#15FF0E]/20 text-[#15FF0E]/60'
      }`}>
        <p>
          ROBCO INDUSTRIES UNIFIED OPERATING SYSTEM v4.02 — COPYRIGHT 2077 VAULT-TEC CORPORATION.
          ВСЕ ПРАВА ЗАЩИЩЕНЫ. ОСТЕРЕГАЙТЕСЬ ДИКИХ ГУЛЕЙ И РАДТАРАКАНОВ.
        </p>
      </div>
    </footer>
  );
};
