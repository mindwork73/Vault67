import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Radio, 
  Compass, 
  ShieldCheck, 
  RefreshCw, 
  Copy, 
  Check, 
  Package, 
  Navigation,
  Activity,
  ArrowRight
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { useVaultStore } from '../../store/useVaultStore';
import { soundManager } from '../../utils/sound';

interface PipBoyOrderTrackerProps {
  order?: Order;
  initialTrackingNumber?: string;
  onClose?: () => void;
  standalone?: boolean;
}

interface Milestone {
  key: string;
  title: string;
  titleEn: string;
  description: string;
  icon: React.ReactNode;
  stepNumber: number;
}

export const PipBoyOrderTracker: React.FC<PipBoyOrderTrackerProps> = ({
  order: propOrder,
  initialTrackingNumber,
  onClose,
  standalone = false,
}) => {
  const theme = useVaultStore((state) => state.theme);
  const orders = useVaultStore((state) => state.orders);
  const isPreWar = theme === 'pre-war';

  // Поиск по трек-номеру или номеру заказа
  const [searchInput, setSearchInput] = useState<string>(initialTrackingNumber || '');
  const [copied, setCopied] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingMessage, setPingMessage] = useState<string | null>(null);
  const [showManifest, setShowManifest] = useState(false);

  // Выбор активного заказа: из пропа или по поиску/дефолту
  const activeOrder = React.useMemo(() => {
    if (propOrder) return propOrder;
    if (searchInput.trim()) {
      const query = searchInput.trim().toUpperCase();
      const found = orders.find(
        (o) => o.trackingNumber.toUpperCase() === query || o.id.toUpperCase() === query
      );
      if (found) return found;
    }
    // Если ничего не выбрано, берем первый доступный заказ
    return orders[0] || null;
  }, [propOrder, searchInput, orders]);

  // Вычисление текущего этапа трекинга
  const getStatusLevel = (status?: OrderStatus): number => {
    if (!status) return 1;
    switch (status) {
      case 'PREPARATION':
      case 'ORDER_PLACED':
        return 1;
      case 'CARAVAN_DISPATCHED':
      case 'IN_TRANSIT':
        return 2;
      case 'OUT_FOR_DELIVERY':
        return 3;
      case 'DELIVERED_TO_VAULT':
        return 4;
      case 'CANCELLED':
        return -1;
      default:
        return 1;
    }
  };

  const statusLevel = getStatusLevel(activeOrder?.status);

  // Список 4 этапов доставки в стиле Pip-Boy
  const milestones: Milestone[] = [
    {
      stepNumber: 1,
      key: 'PREPARATION',
      title: 'СБОРКА В УБЕЖИЩЕ',
      titleEn: 'ORDER PREPARED',
      description: 'Товары упакованы в герметичный свинцовый контейнер Vault-Tec.',
      icon: <Package className="w-4 h-4" />
    },
    {
      stepNumber: 2,
      key: 'IN_TRANSIT',
      title: 'В ПУТИ (КАРАВАН)',
      titleEn: 'IN TRANSIT',
      description: 'Караван «Красный Караван» следует через радиоактивную Пустошь.',
      icon: <Truck className="w-4 h-4" />
    },
    {
      stepNumber: 3,
      key: 'OUT_FOR_DELIVERY',
      title: 'КУРЬЕР В ВАШЕМ СЕКТОРЕ',
      titleEn: 'OUT FOR DELIVERY',
      description: 'Курьер Шестой на подходе к внешнему шлюзу Убежища / пункту выдачи.',
      icon: <Navigation className="w-4 h-4" />
    },
    {
      stepNumber: 4,
      key: 'DELIVERED_TO_VAULT',
      title: 'ГРУЗ ДОСТАВЛЕН',
      titleEn: 'DELIVERED',
      description: 'Контейнер успешно передан реципиенту, биометрия верифицирована.',
      icon: <CheckCircle2 className="w-4 h-4" />
    }
  ];

  // Скопировать трек-номер
  const handleCopyTracking = () => {
    if (!activeOrder) return;
    soundManager.playClick();
    navigator.clipboard.writeText(activeOrder.trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Пинг каравана через эхолокатор Pip-Boy
  const handlePingCaravan = () => {
    soundManager.playPing();
    setIsPinging(true);
    setPingMessage('СКАНИРОВАНИЕ СПУТНИКОВОГО ЛИНКА ROBCO...');

    setTimeout(() => {
      soundManager.playClick();
      setIsPinging(false);
      const rads = Math.floor(Math.random() * 8) + 10;
      setPingMessage(`КАРАВАН В СЕТИ // КООРДИНАТЫ ПОДТВЕРЖДЕНЫ // ФОН: ${rads} RAD/ч`);
    }, 1400);
  };

  // Маршрутные точки (чекпоинты пути)
  const routeCheckpoints = React.useMemo(() => {
    if (!activeOrder) return [];
    const baseDate = activeOrder.date || '2077-10-23';

    return [
      {
        id: 1,
        time: `${baseDate} 08:30`,
        checkpoint: 'Центральный склад Убежища 67',
        event: 'Заказ зарегистрирован терминалом Смотрителя, запущен протокол сбора лута.',
        completed: statusLevel >= 1,
        current: statusLevel === 1
      },
      {
        id: 2,
        time: `${baseDate} 12:15`,
        checkpoint: 'Гермошлюз Сектора B // Внешний КПП',
        event: 'Контейнер опломбирован сургучом Vault-Tec, передан погонщику брамины.',
        completed: statusLevel >= 2,
        current: statusLevel === 2
      },
      {
        id: 3,
        time: `${baseDate} 17:40`,
        checkpoint: 'Аванпост Мохаве // Радиовышка 108.4 MHz',
        event: 'Караван прошел радиоконтроль. Отряд наемников сопровождения на связи.',
        completed: statusLevel >= 3,
        current: statusLevel === 3
      },
      {
        id: 4,
        time: `${baseDate} 21:00`,
        checkpoint: activeOrder.wastelandLocation || 'Пункт выдачи назначения',
        event: 'Финальный этап передачи: проверка герметичности и вручение адресату.',
        completed: statusLevel >= 4,
        current: statusLevel === 4
      }
    ];
  }, [activeOrder, statusLevel]);

  // Вычисление процента заполнения шкалы
  const progressPercent = Math.max(0, Math.min(100, statusLevel === 1 ? 25 : statusLevel === 2 ? 55 : statusLevel === 3 ? 85 : 100));

  return (
    <div
      className={`border-2 sm:border-4 p-4 sm:p-6 space-y-6 relative overflow-hidden transition-all ${
        isPreWar
          ? 'border-[#0033A0] bg-white text-[#1C2331] shadow-xl'
          : 'border-[#15FF0E] bg-black/95 text-[#15FF0E] shadow-[0_0_25px_rgba(21,255,14,0.2)]'
      }`}
    >
      {/* Pip-Boy Электронная строка телеметрии */}
      <div className={`border-b pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
        isPreWar ? 'border-[#0033A0]/30' : 'border-[#15FF0E]/30'
      }`}>
        <div className="flex items-center gap-2">
          <Radio className={`w-4 h-4 shrink-0 ${isPinging ? 'animate-spin text-amber-400' : 'animate-pulse'}`} />
          <span className="font-mono font-bold tracking-wider text-[11px] sm:text-xs uppercase">
            [PIP-BOY 3000 // СЛУЖБА ТРЕКИНГА КАРАВАНОВ УБЕЖИЩА 67]
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono opacity-80">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>ЛИНК: 108.4 MHz</span>
          </span>
          <span>|</span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-current" />
            <span>СИГНАЛ: 98%</span>
          </span>
          <span>|</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>ROBCO SECURE</span>
          </span>
        </div>
      </div>

      {/* Поле поиска по трек-номеру (если трекер используется без конкретного заказа) */}
      {!propOrder && (
        <div className={`p-3 border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ${
          isPreWar ? 'border-[#0033A0]/30 bg-blue-50/50' : 'border-[#15FF0E]/30 bg-black/40'
        }`}>
          <div className="flex-1 flex items-center gap-2">
            <Compass className="w-4 h-4 shrink-0 opacity-70" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Введите трек-номер каравана (например: CRVN-NV-99410) или ID заказа..."
              className={`w-full bg-transparent text-xs font-mono font-bold outline-none uppercase placeholder:opacity-50 ${
                isPreWar ? 'text-[#0033A0]' : 'text-[#15FF0E]'
              }`}
            />
          </div>

          {/* Быстрые чипы доступных заказов */}
          {orders.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto text-[10px] py-1">
              <span className="opacity-70 uppercase shrink-0">Заказы:</span>
              {orders.slice(0, 3).map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSearchInput(o.trackingNumber);
                  }}
                  className={`px-2 py-0.5 border text-[10px] font-mono shrink-0 transition-colors ${
                    activeOrder?.id === o.id
                      ? isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-black font-bold'
                      : 'hover:bg-current/10 border-current/40'
                  }`}
                >
                  {o.trackingNumber}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Если заказ не найден */}
      {!activeOrder ? (
        <div className="p-8 text-center space-y-3 border border-dashed border-current/40">
          <AlertTriangle className="w-8 h-8 mx-auto text-amber-400" />
          <h3 className="font-bold uppercase text-sm">КАРАВАН НЕ ОБНАРУЖЕН НА РАДАРЕ</h3>
          <p className="text-xs opacity-80 max-w-md mx-auto">
            Проверьте правильность введенного трек-номера или выберите один из активных заказов из журнала Убежища.
          </p>
        </div>
      ) : (
        <>
          {/* Верхняя карточка статуса каравана */}
          <div className={`p-4 border-2 flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
            isPreWar ? 'border-[#0033A0] bg-blue-50/80' : 'border-[#15FF0E] bg-[#15FF0E]/10'
          }`}>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold opacity-75">ТРЕК-КОД КАРАВАНА:</span>
                <span className="font-mono font-black text-sm tracking-wider text-amber-400">
                  {activeOrder.trackingNumber}
                </span>
                <button
                  onClick={handleCopyTracking}
                  className="p-1 hover:bg-current/20 transition-colors"
                  title="Скопировать трек-код"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <span className="text-[10px] opacity-60">| Заказ: {activeOrder.id}</span>
              </div>

              <div className="flex items-center gap-2 text-xs opacity-90">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-red-400" />
                <span className="font-bold">ПУНКТ ВЫДАЧИ:</span>
                <span className="truncate">{activeOrder.wastelandLocation}</span>
              </div>

              <div className="text-[11px] opacity-80">
                ПОЛУЧАТЕЛЬ: <span className="font-bold">{activeOrder.recipientName}</span>
              </div>
            </div>

            {/* Текущий значок статуса */}
            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <span className={`px-3 py-1.5 border-2 text-xs font-black uppercase flex items-center gap-2 font-mono ${
                activeOrder.status === 'CANCELLED'
                  ? 'border-red-500 text-red-400 bg-red-950/40'
                  : statusLevel === 4
                    ? 'border-emerald-500 text-emerald-400 bg-emerald-950/30'
                    : statusLevel === 3
                      ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30 animate-pulse'
                      : statusLevel === 2
                        ? 'border-blue-400 text-blue-300 bg-blue-950/30 animate-pulse'
                        : 'border-yellow-400 text-yellow-300 bg-yellow-950/30'
              }`}>
                {activeOrder.status === 'CANCELLED' && <AlertTriangle className="w-4 h-4" />}
                {statusLevel === 1 && <Clock className="w-4 h-4" />}
                {statusLevel === 2 && <Truck className="w-4 h-4" />}
                {statusLevel === 3 && <Navigation className="w-4 h-4" />}
                {statusLevel === 4 && <CheckCircle2 className="w-4 h-4" />}

                <span>
                  {activeOrder.status === 'CANCELLED' && 'СДЕЛКА АННУЛИРОВАНА'}
                  {statusLevel === 1 && 'СБОРКА НА СКЛАДЕ'}
                  {statusLevel === 2 && 'В ПУТИ (IN TRANSIT)'}
                  {statusLevel === 3 && 'КУРЬЕР В ВАШЕМ СЕКТОРЕ'}
                  {statusLevel === 4 && 'ДОСТАВЛЕНО В УБЕЖИЩЕ'}
                </span>
              </span>

              {/* Кнопка Ping для опроса частоты каравана */}
              <button
                onClick={handlePingCaravan}
                disabled={isPinging}
                className={`pipboy-btn px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-1.5 border ${
                  isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
                } ${isPinging ? 'opacity-50 cursor-wait' : ''}`}
                title="Опросить радарный маяк каравана"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
                <span>ПИНГОВАТЬ [PING]</span>
              </button>
            </div>
          </div>

          {/* Сообщение после пинга */}
          {pingMessage && (
            <div className={`p-2.5 border text-xs font-mono font-bold flex items-center justify-between ${
              isPreWar ? 'border-[#0033A0] bg-blue-100 text-[#0033A0]' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>{pingMessage}</span>
              </div>
              <span className="text-[10px] opacity-70">СВЯЗЬ: 100% OK</span>
            </div>
          )}

          {/* ВИЗУАЛЬНЫЙ ТРЕКЕР PIP-BOY: 4-ЭТАПНЫЙ ПРОГРЕСС-БАР */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-mono font-bold uppercase">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>МАРШРУТ ДОСТАВКИ ГРУЗА ПО ПУСТОШИ</span>
              </span>
              <span className="text-[11px] opacity-80">
                ПРОГРЕСС: {progressPercent}%
              </span>
            </div>

            {/* Шкала прогресса с неоновым свечением */}
            <div className="relative">
              <div className="w-full h-3 border-2 border-current bg-black/40 p-0.5">
                <div
                  className={`h-full transition-all duration-700 ease-out ${
                    isPreWar 
                      ? 'bg-[#0033A0]' 
                      : 'bg-[#15FF0E] shadow-[0_0_12px_rgba(21,255,14,0.8)]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* Сетка контрольных точек на шкале */}
              <div className="grid grid-cols-4 gap-2 pt-4">
                {milestones.map((milestone) => {
                  const isPassed = statusLevel >= milestone.stepNumber;
                  const isCurrent = statusLevel === milestone.stepNumber;

                  return (
                    <div
                      key={milestone.key}
                      className={`flex flex-col items-center text-center space-y-1.5 transition-all ${
                        isCurrent 
                          ? 'scale-105 opacity-100' 
                          : isPassed 
                            ? 'opacity-90' 
                            : 'opacity-40'
                      }`}
                    >
                      {/* Значок шага */}
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 border-2 rounded-none flex items-center justify-center transition-all ${
                          isCurrent
                            ? isPreWar
                              ? 'bg-[#0033A0] text-white border-[#0033A0] ring-2 ring-[#FFD100]'
                              : 'bg-[#15FF0E] text-black border-[#15FF0E] shadow-[0_0_15px_rgba(21,255,14,0.6)] animate-pulse'
                            : isPassed
                              ? isPreWar
                                ? 'bg-blue-100 text-[#0033A0] border-[#0033A0]'
                                : 'bg-[#15FF0E]/20 text-[#15FF0E] border-[#15FF0E]'
                              : 'bg-black/20 text-current border-current/40'
                        }`}
                      >
                        {isPassed && !isCurrent ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          milestone.icon
                        )}
                      </div>

                      {/* Текст шага */}
                      <div className="text-[10px] sm:text-xs font-black uppercase leading-tight font-mono">
                        {milestone.title}
                      </div>
                      <div className="text-[8px] sm:text-[9px] font-mono opacity-70 hidden sm:block">
                        [{milestone.titleEn}]
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ЖУРНАЛ ПЕРЕМЕЩЕНИЙ КАРАВАНА (WAYPOINTS LOG) */}
          <div className={`border-2 p-4 space-y-3 ${
            isPreWar ? 'border-[#0033A0]/30 bg-blue-50/30' : 'border-[#15FF0E]/30 bg-black/60'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold uppercase border-b pb-2 border-current/25 font-mono">
              <span className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emerald-400" />
                <span>ЖУРНАЛ КОНТРОЛЬНЫХ ТОЧЕК [WAYPOINT TELEMETRY]</span>
              </span>
              <span className="text-[10px] opacity-70">СЕАНС СВЯЗИ: РЕАЛЬНОЕ ВРЕМЯ</span>
            </div>

            <div className="space-y-3 pt-1">
              {routeCheckpoints.map((cp, idx) => (
                <div
                  key={cp.id}
                  className={`flex items-start gap-3 text-xs pb-2 border-b last:border-b-0 border-current/15 ${
                    cp.current 
                      ? 'font-bold opacity-100' 
                      : cp.completed 
                        ? 'opacity-85' 
                        : 'opacity-40'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {cp.completed ? (
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
                        ✓
                      </div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-current/40 flex items-center justify-center text-[9px]">
                        {idx + 1}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-bold uppercase tracking-tight text-[11px] sm:text-xs">
                        {cp.checkpoint}
                        {cp.current && (
                          <span className="ml-2 text-[10px] text-amber-400 font-mono animate-pulse">
                            &lt;ТЕКУЩЕЕ МЕСТОПОЛОЖЕНИЕ&gt;
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] font-mono opacity-70">{cp.time}</span>
                    </div>
                    <p className="text-[11px] opacity-80 leading-relaxed font-sans">
                      {cp.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* МАНИФЕСТ ГРУЗА (ТОВАРЫ В ПОСЫЛКЕ С РУБЛЕВЫМИ ЦЕНАМИ) */}
          <div className="border-t pt-3 border-current/30">
            <button
              onClick={() => {
                soundManager.playClick();
                setShowManifest(!showManifest);
              }}
              className="w-full flex items-center justify-between text-xs font-bold uppercase py-2 hover:opacity-85 transition-opacity font-mono"
            >
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>МАНИФЕСТ ГРУЗА И СОДЕРЖИМОЕ ({activeOrder.items.reduce((s, i) => s + i.quantity, 0)} ШТ.)</span>
              </span>
              <span className="text-[10px] underline">
                {showManifest ? '[СВЕРНУТЬ]' : '[РАЗВЕРНУТЬ СОДЕРЖИМОЕ]'}
              </span>
            </button>

            {showManifest && (
              <div className={`mt-2 p-3 border space-y-2.5 text-xs animate-in fade-in duration-200 ${
                isPreWar ? 'border-[#0033A0]/30 bg-white' : 'border-[#15FF0E]/30 bg-black/80'
              }`}>
                {activeOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-3 border-b last:border-b-0 pb-2 border-current/15">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt=""
                        className={`w-9 h-9 object-cover border border-current shrink-0 ${
                          isPreWar ? '' : 'pipboy-image-filter'
                        }`}
                      />
                      <div>
                        <div className="font-bold leading-tight">{item.product.titleRu}</div>
                        <div className="text-[10px] opacity-75">
                          {item.quantity} шт. • [{item.product.category}] • {item.product.weightWg * item.quantity} lbs
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono font-bold shrink-0">
                      {(item.product.priceRub * item.quantity).toLocaleString()} ₽
                    </div>
                  </div>
                ))}

                <div className="border-t pt-2 mt-2 flex justify-between items-baseline font-mono font-black text-sm">
                  <span>ОБЩАЯ СТОИМОСТЬ ГРУЗА:</span>
                  <span className="text-base">
                    {(activeOrder.totalRub || activeOrder.items.reduce((s, it) => s + it.product.priceRub * it.quantity, 0)).toLocaleString()} ₽
                  </span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Кнопка закрытия модалки если передана */}
      {onClose && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className={`pipboy-btn py-1.5 px-4 text-xs font-bold uppercase ${
              isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-black'
            }`}
          >
            ЗАКРЫТЬ ТЕРМИНАЛ ТРЕКИНГА
          </button>
        </div>
      )}
    </div>
  );
};
