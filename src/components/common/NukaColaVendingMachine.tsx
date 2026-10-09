import React, { useState, useEffect } from 'react';
import { soundManager } from '../../utils/sound';
import { useVaultStore } from '../../store/useVaultStore';
import { 
  Sparkles, 
  RefreshCw, 
  Zap, 
  Coins, 
  Check, 
  Flame,
  Volume2,
  VolumeX,
  Droplets
} from 'lucide-react';

interface NukaFlavor {
  id: string;
  name: string;
  nameEn: string;
  glowColor: string;
  borderGlow: string;
  bottleColor: string;
  priceRub: number;
  perk: string;
  rads: number;
}

const FLAVORS: NukaFlavor[] = [
  {
    id: 'classic',
    name: 'Ядер-Кола (Классика)',
    nameEn: 'Nuka-Cola Classic',
    glowColor: 'rgba(255, 30, 30, 0.9)',
    borderGlow: '#ff2222',
    bottleColor: 'from-red-950 via-red-800 to-amber-900',
    priceRub: 350,
    perk: '+10 ОД (Ловкость)',
    rads: 5
  },
  {
    id: 'quantum',
    name: 'Ядер-Кола Квантовая',
    nameEn: 'Nuka-Cola Quantum',
    glowColor: 'rgba(0, 229, 255, 0.95)',
    borderGlow: '#00e5ff',
    bottleColor: 'from-cyan-900 via-blue-600 to-cyan-300',
    priceRub: 980,
    perk: '+100 ОД, Неоновое свечение кожи',
    rads: 45
  },
  {
    id: 'cherry',
    name: 'Ядер-Вишня',
    nameEn: 'Nuka-Cherry',
    glowColor: 'rgba(255, 40, 120, 0.9)',
    borderGlow: '#ff2a75',
    bottleColor: 'from-pink-950 via-rose-700 to-red-600',
    priceRub: 420,
    perk: '+25 ОЗ (Здоровье)',
    rads: 8
  },
  {
    id: 'victory',
    name: 'Ядер-Кола Победа',
    nameEn: 'Nuka-Victory',
    glowColor: 'rgba(255, 180, 0, 0.95)',
    borderGlow: '#ffb000',
    bottleColor: 'from-amber-950 via-amber-600 to-yellow-400',
    priceRub: 650,
    perk: '+50 ОЗ, Огнестойкость',
    rads: 15
  }
];

export const NukaColaVendingMachine: React.FC = () => {
  const { theme, soundEnabled } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // Состояние последовательности розжига неона
  const [animationKey, setAnimationKey] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState<NukaFlavor>(FLAVORS[0]);
  const [dispenseMessage, setDispenseMessage] = useState<string | null>(null);
  const [isPoweringUp, setIsPoweringUp] = useState(true);

  // Запуск последовательности включения при первой загрузке главной страницы
  useEffect(() => {
    triggerLightUpSequence();
  }, []);

  const triggerLightUpSequence = () => {
    // Звук розжига неона и искрения стартера
    soundManager.playNukaIgnition();
    setIsPoweringUp(true);
    setAnimationKey((prev) => prev + 1);

    const timer = setTimeout(() => {
      setIsPoweringUp(false);
    }, 2200);

    return () => clearTimeout(timer);
  };

  const handleDispenseBottle = (flavor: NukaFlavor) => {
    setSelectedFlavor(flavor);
    soundManager.playCaps();
    setDispenseMessage(`ВЫДАЧА: ${flavor.name}! ${flavor.perk} [+1 КРЫШКА]`);

    setTimeout(() => {
      setDispenseMessage(null);
    }, 3800);
  };

  return (
    <div className={`border-2 sm:border-4 transition-all overflow-hidden ${
      isPreWar
        ? 'border-[#0033A0] bg-white text-[#1C2331] shadow-xl'
        : 'border-[#15FF0E]/80 bg-[#070b09] text-[#15FF0E] shadow-[0_0_30px_rgba(21,255,14,0.15)]'
    }`}>
      {/* 1. Верхняя служебная плашка RobCo */}
      <div className={`px-4 py-2 border-b flex flex-wrap items-center justify-between gap-2 text-xs font-mono font-bold ${
        isPreWar ? 'border-[#0033A0]/30 bg-blue-50/80 text-[#0033A0]' : 'border-[#15FF0E]/30 bg-black/60 text-[#15FF0E]'
      }`}>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="uppercase tracking-widest text-[11px] sm:text-xs">
            [NUKA-COLA CORP. // АВТОМАТ ВЫДАЧИ №67]
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerLightUpSequence}
            className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider border flex items-center gap-1.5 transition-all ${
              isPreWar
                ? 'border-[#0033A0] hover:bg-[#0033A0] hover:text-white'
                : 'border-[#15FF0E] hover:bg-[#15FF0E] hover:text-black'
            }`}
            title="Запустить ретро-последовательность включения и розжига неона заново"
          >
            <RefreshCw className={`w-3 h-3 ${isPoweringUp ? 'animate-spin' : ''}`} />
            <span>ПЕРЕЗАПУСК НЕОНА [IGNITE]</span>
          </button>
        </div>
      </div>

      {/* 2. Тело ретро-автомата Ядер-Колы */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Левая часть (5/12): Корпус автомата с неоновой вывеской и витриной бутылок */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-[340px] rounded-3xl p-4 bg-gradient-to-b from-[#8B0000] via-[#660000] to-[#3a0000] border-4 border-[#ff2a2a] shadow-[0_0_35px_rgba(255,0,0,0.4)] text-white">
            {/* Заклепки корпуса */}
            <div className="absolute top-2 left-4 w-2 h-2 rounded-full bg-neutral-400 border border-black shadow" />
            <div className="absolute top-2 right-4 w-2 h-2 rounded-full bg-neutral-400 border border-black shadow" />
            <div className="absolute bottom-2 left-4 w-2 h-2 rounded-full bg-neutral-400 border border-black shadow" />
            <div className="absolute bottom-2 right-4 w-2 h-2 rounded-full bg-neutral-400 border border-black shadow" />

            {/* ВЕРХНИЙ НЕОНОВЫЙ КАРТУШ С ЛОГОТИПОМ NUKA-COLA (CSS ANIMATION) */}
            <div
              key={`neon-${animationKey}`}
              className="py-3 px-4 rounded-xl border-2 border-red-500/60 bg-black/80 text-center relative overflow-hidden mb-4 nuka-neon-animating"
            >
              <div className="text-[10px] font-black tracking-[0.3em] uppercase text-amber-300 opacity-90 mb-0.5">
                ★ ZAP THAT THIRST! ★
              </div>
              <div className="text-2xl sm:text-3xl font-black italic tracking-widest text-red-500 font-serif drop-shadow-[0_0_12px_rgba(255,0,0,0.9)]">
                Nuka-Cola
              </div>
              <div className="text-[9px] tracking-widest font-mono text-red-200 opacity-80 uppercase mt-0.5">
                ICE COLD REFRESHMENT
              </div>
            </div>

            {/* ХОЛОДИЛЬНАЯ КАМЕРА С БУТЫЛКАМИ (CSS CHAMBER IGNITION) */}
            <div
              key={`chamber-${animationKey}`}
              className="relative p-3 rounded-xl border-2 border-cyan-400/50 bg-black/85 overflow-hidden mb-4 nuka-chamber-animating shadow-inner"
            >
              {/* Ледяной иней / подсветка камеры */}
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-700 opacity-25"
                style={{ backgroundColor: selectedFlavor.borderGlow }}
              />

              <div className="text-[9px] font-mono font-bold uppercase text-cyan-300 mb-2 flex items-center justify-between">
                <span>ОХЛАЖДЕНИЕ: -4°C</span>
                <span className="flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-cyan-400" />
                  <span>ВИТРИНА</span>
                </span>
              </div>

              {/* 4 бутылки в ряд с радиационным свечением */}
              <div className="grid grid-cols-4 gap-2 py-2">
                {FLAVORS.map((flavor) => {
                  const isSelected = selectedFlavor.id === flavor.id;

                  return (
                    <button
                      key={flavor.id}
                      onClick={() => handleDispenseBottle(flavor)}
                      className={`group flex flex-col items-center p-1.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-white bg-white/10 scale-105 shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                          : 'border-white/20 hover:border-white/60 hover:bg-white/5'
                      }`}
                      title={`Выбрать ${flavor.name}`}
                    >
                      {/* Бутылка Ядер-Колы */}
                      <div className="relative w-7 h-16 flex items-center justify-center">
                        {/* Горлышко */}
                        <div className="absolute top-0 w-2.5 h-3 bg-neutral-300 rounded-t border border-neutral-700 z-10" />
                        {/* Тело бутылки с жидкостью */}
                        <div
                          className={`w-5 h-13 mt-2.5 rounded-b-md bg-gradient-to-b ${flavor.bottleColor} border border-neutral-300/40 relative shadow-lg ${
                            flavor.id === 'quantum' ? 'nuka-quantum-pulse' : ''
                          }`}
                          style={{
                            boxShadow: `0 0 12px ${flavor.glowColor}`
                          }}
                        >
                          {/* Этикетка */}
                          <div className="absolute top-4 inset-x-0.5 h-3 bg-red-600 border-y border-white/60 flex items-center justify-center">
                            <span className="text-[5px] font-black text-white leading-none">NUKA</span>
                          </div>
                        </div>
                      </div>

                      <span className="text-[8px] font-black uppercase text-center mt-1 truncate max-w-full text-white/90">
                        {flavor.id}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* НИЖНЯЯ ПАНЕЛЬ: ИНДИКАТОР ICE COLD И ЛОТОК ВЫДАЧИ */}
            <div className="grid grid-cols-2 gap-2 items-center">
              {/* Табло "ICE COLD" */}
              <div
                key={`icecold-${animationKey}`}
                className="py-1.5 px-2 rounded-md border border-cyan-400 bg-cyan-950/80 text-cyan-300 text-center font-black text-[10px] tracking-wider uppercase nuka-icecold-animating"
              >
                ★ ICE COLD ★
              </div>

              {/* Монетоприемник */}
              <div className="py-1.5 px-2 rounded-md border border-amber-400/60 bg-amber-950/60 text-amber-300 text-center font-mono font-bold text-[10px]">
                350 ₽ // 10 C
              </div>
            </div>

            {/* Лоток выдачи бутылок */}
            <div
              onClick={() => handleDispenseBottle(selectedFlavor)}
              className="mt-3 p-2 rounded-md border-2 border-neutral-700 bg-neutral-900 text-center cursor-pointer hover:bg-neutral-800 transition-colors"
              title="Нажмите, чтобы открыть лоток выдачи!"
            >
              <div className="w-16 h-1 bg-neutral-600 mx-auto mb-1 rounded-full" />
              <div className="text-[9px] uppercase font-mono font-bold tracking-widest text-neutral-400">
                [ЛОТОК ВЫДАЧИ БУТЫЛОК]
              </div>
            </div>
          </div>
        </div>

        {/* Правая часть (7/12): Интерактивная витрина со свойствами и кнопками заказа */}
        <div className="lg:col-span-7 space-y-4 font-mono">
          <div className="border-b pb-2 border-current/30">
            <div className="text-xs uppercase tracking-widest opacity-80 mb-0.5">
              СЕЛЕКТОР ЛЕГЕНДАРНЫХ НАПИТКОВ ПУСТОШИ
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              <span>{selectedFlavor.name}</span>
            </h2>
            <div className="text-xs opacity-75">
              {selectedFlavor.nameEn} • Охлаждено до совершенства
            </div>
          </div>

          {/* Сообщение о выдаче напитка */}
          {dispenseMessage && (
            <div className="p-3 border-2 border-emerald-400 bg-emerald-950/40 text-emerald-400 text-xs font-bold flex items-center justify-between animate-in zoom-in-95">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{dispenseMessage}</span>
              </div>
              <span className="text-[10px] opacity-80">+1 CAP ДОБАВЛЕНО</span>
            </div>
          )}

          {/* Свойства и характеристики напитка */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 border border-current/30 bg-black/20">
              <span className="text-[10px] opacity-70 block uppercase">ЭФФЕКТ ВЫЖИВАНИЯ:</span>
              <span className="font-bold text-amber-400">{selectedFlavor.perk}</span>
            </div>

            <div className="p-2.5 border border-current/30 bg-black/20">
              <span className="text-[10px] opacity-70 block uppercase">РАДИАЦИОННАЯ ДОЗА:</span>
              <span className="font-bold text-red-400">+{selectedFlavor.rads} RADS</span>
            </div>

            <div className="p-2.5 border border-current/30 bg-black/20">
              <span className="text-[10px] opacity-70 block uppercase">СТОИМОСТЬ:</span>
              <span className="font-bold text-base font-mono">{selectedFlavor.priceRub.toLocaleString()} ₽</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed opacity-90">
            Легендарный напиток довоенной эпохи, бережно сохраненный в герметичном холодильном шкафу Убежища 67. 
            Каждая бутылка обладает аутентичным вкусом 2077 года, шипящей радиоактивной карбонизацией и фирменной крышечкой на горлышке.
          </p>

          {/* Быстрые кнопки переключения сортов */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold uppercase opacity-75 block">
              ВЫБРАТЬ ВКУС И ЗАПУСТИТЬ ОХЛАЖДЕНИЕ:
            </span>
            <div className="flex flex-wrap gap-2">
              {FLAVORS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedFlavor(f);
                  }}
                  className={`px-3 py-1 text-xs font-bold uppercase border transition-all ${
                    selectedFlavor.id === f.id
                      ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-black border-[#15FF0E]'
                      : 'border-current/40 hover:bg-current/10'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* Кнопка мгновенной выдачи */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleDispenseBottle(selectedFlavor)}
              className={`pipboy-btn py-2.5 px-6 text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-black'
              }`}
            >
              <Coins className="w-4 h-4" />
              <span>КУПИТЬ И ОТКРЫТЬ [DISPENSE] — {selectedFlavor.priceRub} ₽</span>
            </button>

            <span className="text-[11px] opacity-75 font-mono">
              +1 крышка в инвентарь при открытии
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
