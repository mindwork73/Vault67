import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { ProductCard } from '../components/catalog/ProductCard';
import { NukaColaVendingMachine } from '../components/common/NukaColaVendingMachine';
import { soundManager } from '../utils/sound';
import { CategoryItem, SpecialCategory } from '../types';
import { 
  Terminal, 
  ShieldAlert, 
  Zap, 
  Radio, 
  ArrowRight, 
  Box, 
  Sparkles,
  Flame,
  Award
} from 'lucide-react';

// Флаг отображения ретро-автомата выдачи Ядер-Колы
// (пока скрыт по запросу пользователя, но весь код и анимация сохранены в src/components/common/NukaColaVendingMachine.tsx)
const SHOW_NUKA_VENDING_MACHINE = false;

const BOOT_TEXT = [
  'ROBCO INDUSTRIES (TM) TERMLINK PROTOCOL v4.02',
  'COPYRIGHT 2077 ROBCO INDUSTRIES CORP.',
  'INITIALIZING VAULT 67 AUTOMATED WAREHOUSE...',
  'DIAGNOSTICS: WATER PURIFIER [OK] | REACTOR [NOMINAL]',
  'GEIGER DETECTION: 42 RAD/HR (ACCEPTABLE WASTELAND TOLERANCE)',
  'CARAVAN COMMS LINK: ACTIVE (CRVN-MOJAVE-67)',
  '=====================================================',
  '>>> CONNECTION ESTABLISHED. ACCESS GRANTED TO GEEK REQUISITIONS <<<'
];

const SPECIAL_CATEGORIES: {
  key: SpecialCategory;
  letter: string;
  name: string;
  desc: string;
  icon: string;
}[] = [
  { key: 'STRENGTH', letter: 'S', name: 'Сила', desc: 'Фигурки, статуи и реплики тяжелого оружия', icon: '💪' },
  { key: 'PERCEPTION', letter: 'P', name: 'Восприятие', desc: 'Оптика, ночники, постеры и арт-принты', icon: '👁️' },
  { key: 'ENDURANCE', letter: 'E', name: 'Выносливость', desc: 'Броня, худи, куртки и тактический мерч', icon: '🛡️' },
  { key: 'CHARISMA', letter: 'C', name: 'Харизма', desc: 'Значки, нашивки, крышки и косплей-детали', icon: '⭐' },
  { key: 'INTELLIGENCE', letter: 'I', name: 'Интеллект', desc: 'Манга, комиксы, артбуки и схемы', icon: '🧠' },
  { key: 'AGILITY', letter: 'A', name: 'Ловкость', desc: 'Клавиатуры, мыши, гаджеты и девайсы', icon: '⚡' },
  { key: 'LUCK', letter: 'L', name: 'Удача', desc: 'Секретные лутбоксы и Mystery Airdrops', icon: '🍀' },
];

export const HomePage: React.FC = () => {
  const { products, categories, theme } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // Пользовательские разделы, созданные в админке
  const customCategories = useMemo(() => {
    return categories.filter(c => !SPECIAL_CATEGORIES.some(sc => sc.key === c.key));
  }, [categories]);

  // Посимвольная печать текста терминала
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [currentCharIdx, setCurrentCharIdx] = useState(0);
  const [isBootDone, setIsBootDone] = useState(false);

  useEffect(() => {
    if (currentLineIdx < BOOT_TEXT.length) {
      const currentFullLine = BOOT_TEXT[currentLineIdx];
      if (currentCharIdx < currentFullLine.length) {
        const timeout = setTimeout(() => {
          setTypedLines((prev) => {
            const next = [...prev];
            next[currentLineIdx] = (next[currentLineIdx] || '') + currentFullLine[currentCharIdx];
            return next;
          });
          setCurrentCharIdx((prev) => prev + 1);
        }, 12);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setCurrentLineIdx((prev) => prev + 1);
          setCurrentCharIdx(0);
        }, 80);
        return () => clearTimeout(timeout);
      }
    } else {
      setIsBootDone(true);
    }
  }, [currentLineIdx, currentCharIdx]);

  const handleSkipBoot = () => {
    setTypedLines([...BOOT_TEXT]);
    setCurrentLineIdx(BOOT_TEXT.length);
    setIsBootDone(true);
    soundManager.playClick();
  };

  const featuredProducts = products.filter((p) => p.featured).slice(0, 6);

  return (
    <div className="space-y-12">
      {/* 1. HERO БЛОК: ЗАГРУЗОЧНЫЙ ЭКРАН ТЕРМИНАЛА ROBCO */}
      <section className={`border-2 p-4 sm:p-6 transition-all ${
        isPreWar
          ? 'border-[#0033A0] bg-white shadow-xl'
          : 'border-[#15FF0E] bg-black/90 shadow-[0_0_30px_rgba(21,255,14,0.15)]'
      }`}>
        {/* Заголовок окна терминала */}
        <div className={`flex items-center justify-between border-b pb-2 mb-4 text-xs font-mono font-bold ${
          isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
        }`}>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 animate-pulse" />
            <span>ROBCO OS v4.02 // BOOT_SEQUENCE.BAT</span>
          </div>

          <div className="flex items-center gap-3">
            {!isBootDone && (
              <button
                onClick={handleSkipBoot}
                className="underline hover:opacity-80 text-[10px] uppercase cursor-pointer"
              >
                [ПРОПУСТИТЬ ТЕКСТ / SKIP]
              </button>
            )}
            <span className="hidden sm:inline">[PORT: 3000 // TTY_01]</span>
          </div>
        </div>

        {/* Экран печати терминала */}
        <div className="font-mono text-xs sm:text-sm space-y-1 min-h-[140px] leading-relaxed">
          {typedLines.map((line, idx) => (
            <div
              key={idx}
              className={`${
                idx === BOOT_TEXT.length - 1
                  ? isPreWar ? 'text-[#0033A0] font-black' : 'text-[#15FF0E] font-black pipboy-glow'
                  : 'opacity-90'
              }`}
            >
              &gt; {line}
            </div>
          ))}
          {!isBootDone && (
            <span className="terminal-cursor text-[#15FF0E]" />
          )}
        </div>

        {/* Интерактивный призыв после загрузки */}
        {isBootDone && (
          <div className={`mt-6 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in ${
            isPreWar ? 'border-[#0033A0]/30' : 'border-[#15FF0E]/30'
          }`}>
            <div className="text-xs font-mono">
              <span className="font-bold">СТАТУС СКЛАДА: </span>
              В наличии реликвии вселенных Fallout, Evangelion, Cyberpunk, Warhammer 40k.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                to="/catalog"
                onClick={() => soundManager.playTab()}
                className={`pipboy-btn py-2 px-5 text-xs font-mono font-bold flex items-center justify-center gap-2 w-full sm:w-auto ${
                  isPreWar
                    ? 'bg-[#0033A0] text-white border-[#0033A0]'
                    : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                }`}
              >
                <span>ОТКРЫТЬ ИНВЕНТАРЬ [ENTER]</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 
        2. [NUKA-COLA CORP. // АВТОМАТ ВЫДАЧИ №67]
        Интерактивный ретро-автомат с неоновым розжигом вывески и выдачей Ядер-Колы временно скрыт из интерфейса (SHOW_NUKA_VENDING_MACHINE = false),
        но сохранен в кодовой базе (компонент src/components/common/NukaColaVendingMachine.tsx).
        Включает звуковой синтез розжига ламп, селектор сортов (Quantum, Cherry, Dark и др.), выдачу лута и крышек.
      */}
      {SHOW_NUKA_VENDING_MACHINE && (
        <section>
          <NukaColaVendingMachine />
        </section>
      )}

      {/* 3. КАТЕГОРИИ S.P.E.C.I.A.L. */}
      <section>
        <div className="flex items-center justify-between mb-4 border-b pb-2 border-current/30">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider font-mono flex items-center gap-2">
              <Zap className="w-5 h-5 text-current animate-pulse" />
              <span>СИСТЕМА S.P.E.C.I.A.L. // КАТЕГОРИИ ЛУТА</span>
            </h2>
            <p className="text-xs opacity-75 font-mono">
              Выберите характеристику для фильтрации артефактов и снаряжения
            </p>
          </div>

          <Link
            to="/catalog"
            onClick={() => soundManager.playTab()}
            className="text-xs font-mono font-bold hover:underline hidden sm:flex items-center gap-1"
          >
            <span>ВЕСЬ ЛУТ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {SPECIAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.key}
              to={`/catalog?cat=${cat.key}`}
              onClick={() => soundManager.playTab()}
              className={`group border-2 p-3.5 sm:p-4 text-center transition-all flex flex-col justify-between ${
                isPreWar
                  ? 'border-[#0033A0] bg-white text-[#1C2331] hover:border-[#FFD100] hover:bg-[#FFD100]/10'
                  : 'border-[#15FF0E] bg-black/60 text-[#15FF0E] hover:bg-[#15FF0E] hover:text-[#0D1117]'
              }`}
            >
              <div>
                {/* Большая буква S.P.E.C.I.A.L. */}
                <div className="text-3xl font-black font-mono tracking-tighter mb-1 transition-transform group-hover:scale-110">
                  {cat.letter}
                </div>
                <div className="text-xl mb-1">{cat.icon}</div>
                <div className="font-bold text-xs sm:text-sm uppercase font-mono tracking-wider mb-1">
                  {cat.name}
                </div>
              </div>
              <p className="text-xs sm:text-[13px] opacity-95 font-mono mt-2 leading-snug">
                {cat.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* Дополнительные созданные разделы */}
        {customCategories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-current/20">
            <div className="text-xs font-bold uppercase mb-2 opacity-80">
              НОВЫЕ ПОЛЬЗОВАТЕЛЬСКИЕ РАЗДЕЛЫ:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {customCategories.map((c: CategoryItem) => (
                <Link
                  key={c.id}
                  to={`/catalog?cat=${c.key}`}
                  onClick={() => soundManager.playTab()}
                  className={`border-2 p-3 transition-all flex items-center gap-3 ${
                    isPreWar
                      ? 'border-[#0033A0] bg-white text-[#1C2331] hover:border-[#FFD100]'
                      : 'border-[#15FF0E] bg-black/60 text-[#15FF0E] hover:bg-[#15FF0E] hover:text-[#0D1117]'
                  }`}
                >
                  <span className="text-2xl">{c.icon || '📦'}</span>
                  <div>
                    <div className="font-bold text-sm uppercase">{c.name}</div>
                    <div className="text-xs opacity-90 line-clamp-1">{c.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. ВИТРИНА ЛУТА: СЕТКА ИЗ 4-6 ПОПУЛЯРНЫХ ТОВАРОВ */}
      <section>
        <div className="flex items-center justify-between mb-4 border-b pb-2 border-current/30">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider font-mono flex items-center gap-2">
              <Flame className="w-5 h-5 text-current animate-bounce" />
              <span>ГОРЯЧИЙ ЛУТ ПУСТОШИ // ИЗБРАННОЕ</span>
            </h2>
            <p className="text-xs opacity-75 font-mono">
              Самые редкие довоенные находки, отреставрированные мастерами Убежища 67
            </p>
          </div>

          <Link
            to="/catalog"
            onClick={() => soundManager.playTab()}
            className="text-xs font-mono font-bold hover:underline flex items-center gap-1"
          >
            <span>СМОТРЕТЬ ВСЕ ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. БАННЕР КАРАВАНОВ И ТОРГОВЫХ ПАКТОВ */}
      <section className={`border-2 p-5 font-mono flex flex-col md:flex-row items-center justify-between gap-6 ${
        isPreWar
          ? 'border-[#0033A0] bg-blue-50 text-[#0033A0]'
          : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
      }`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 border-2 border-current flex items-center justify-center shrink-0">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-sm uppercase tracking-wider">
              ТОРГОВЫЕ КАРАВАНЫ "КРИМСОН КАРАВАН" И УБЕЖИЩА 67
            </div>
            <div className="text-xs opacity-80 mt-1 leading-relaxed">
              Быстрая доставка ящиков с лутом через радиационные штормы. Оплата принимается крышками Nuka-Cola,
              довоенными рублями (СБП) или прямым бартером на патроны.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/delivery"
            onClick={() => soundManager.playTab()}
            className={`pipboy-btn py-2 px-4 text-xs font-bold uppercase tracking-wider ${
              isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
            }`}
          >
            МАРШРУТЫ КАРАВАНОВ
          </Link>
        </div>
      </section>
    </div>
  );
};
