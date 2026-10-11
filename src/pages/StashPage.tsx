import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { soundManager } from '../utils/sound';
import { Order } from '../types';
import { 
  Package, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Coins, 
  Weight, 
  ShieldAlert, 
  ShoppingBag, 
  RotateCcw,
  History,
  TrendingUp,
  Award,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  X,
  Printer,
  Navigation
} from 'lucide-react';
import { PipBoyOrderTracker } from '../components/common/PipBoyOrderTracker';

export const StashPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    cart, 
    orders, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    maxWeightWg, 
    theme,
    user,
    isAuthed,
    loadMyOrders
  } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // Подгружаем историю заказов пользователя из API
  useEffect(() => {
    if (isAuthed) loadMyOrders().catch(() => undefined);
  }, [isAuthed, loadMyOrders]);

  // Вычисляем активную вкладку напрямую из search параметров текущего URL (всегда синхронизировано)
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const tabParam = searchParams.get('tab');
  const activeTab: 'stash' | 'history' | 'tracker' = 
    tabParam === 'tracker' ? 'tracker' : tabParam === 'history' ? 'history' : 'stash';

  // Выбранный заказ для детального трекинга в Pip-Boy (по объекту или по URL ?order=... / ?track=...)
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<Order | null>(null);

  const orderIdOrTrack = searchParams.get('order') || searchParams.get('track') || searchParams.get('tracking');
  const trackingOrderFromUrl = useMemo(() => {
    if (!orderIdOrTrack) return null;
    return orders.find(
      (o) => o.id === orderIdOrTrack || o.trackingNumber.toUpperCase() === orderIdOrTrack.toUpperCase()
    ) || null;
  }, [orderIdOrTrack, orders]);

  const effectiveTrackingOrder = selectedTrackingOrder || trackingOrderFromUrl || (orders.length > 0 ? orders[0] : null);

  const handleTabSelect = (tab: 'stash' | 'history' | 'tracker', orderId?: string) => {
    soundManager.playTab();
    if (tab === 'stash') {
      navigate('/stash');
    } else if (tab === 'history') {
      navigate('/stash?tab=history');
    } else {
      navigate(orderId ? `/stash?tab=tracker&order=${encodeURIComponent(orderId)}` : '/stash?tab=tracker');
    }
  };

  // Модальное окно просмотра манифеста заказа
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState<Order | null>(null);

  // Расчет суммарного веса
  const totalWeight = cart.reduce(
    (sum, item) => sum + item.product.weightWg * item.quantity,
    0
  );
  const weightPercent = Math.min(100, Math.round((totalWeight / maxWeightWg) * 100));
  const isOverencumbered = totalWeight > maxWeightWg;

  // Расчет итоговой суммы корзины
  const totalCaps = cart.reduce(
    (sum, item) => sum + item.product.priceCaps * item.quantity,
    0
  );
  const totalRub = cart.reduce(
    (sum, item) => sum + item.product.priceRub * item.quantity,
    0
  );

  // Расчет метрик эффективности бартера (Barter Value Performance)
  const totalBarterTurnoverRub = orders.reduce((sum, o) => {
    return sum + o.items.reduce((acc, item) => acc + item.product.priceRub * item.quantity, 0);
  }, 0);

  const totalBonusCapsEarned = orders.reduce((sum, o) => sum + o.totalCaps, 0);
  
  // Условная экономия бартера (18-25% экономии за счет скидок и бонусов Убежища)
  const barterSavingsPercent = orders.length > 0 ? (15 + (orders.length * 2.4)).toFixed(1) : '15.0';
  const traderRank = orders.length >= 5 ? 'МАГНАТ ПУСТОШИ' : orders.length >= 2 ? 'ОПЫТНЫЙ КАРАВАНЩИК' : 'НАЧИНАЮЩИЙ КУПЕЦ';

  return (
    <div className="space-y-6 font-mono">
      {/* Заголовок и вкладки переключения */}
      <div className={`border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isPreWar ? 'border-[#0033A0]' : 'border-[#15FF0E]'
      }`}>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-80 mb-1 flex items-center gap-2">
            <span>[TERMLINK: STASH_AND_BARTER_LOGS]</span>
            <span>|</span>
            <span>СТАТУС ЖИТЕЛЯ: {user.callsign || 'ГОСТЬ'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider flex items-center gap-2">
            <Package className="w-7 h-7" />
            <span>ПРИПАСЫ И ИСТОРИЯ СДЕЛОК</span>
          </h1>
        </div>

        {/* Переключатель вкладок Pip-Boy */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabSelect('stash')}
            className={`px-3.5 py-1.5 border text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'stash'
                ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                : 'border-current/40 opacity-70 hover:opacity-100'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>ПРИПАСЫ ({cart.length})</span>
          </button>

          <button
            onClick={() => handleTabSelect('history')}
            className={`px-3.5 py-1.5 border text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'history'
                ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                : 'border-current/40 opacity-70 hover:opacity-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>ИСТОРИЯ СДЕЛОК ({orders.length})</span>
          </button>

          <button
            onClick={() => handleTabSelect('tracker')}
            className={`px-3.5 py-1.5 border text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
              activeTab === 'tracker'
                ? isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                : 'border-current/40 opacity-70 hover:opacity-100'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>ТРЕКИНГ КАРАВАНА</span>
          </button>
        </div>
      </div>

      {/* ВКЛАДКА 1: АКТИВНЫЙ ЯЩИК ПРИПАСОВ (ТЕКУЩАЯ КОРЗИНА) */}
      {activeTab === 'stash' && (
        <>
          {cart.length === 0 ? (
            <div className={`border-2 p-12 text-center space-y-4 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
            }`}>
              <div className="text-5xl">📦</div>
              <h2 className="text-xl font-bold uppercase tracking-wider">
                ВАШ ЯЩИК ПРИПАСОВ ПУСТ!
              </h2>
              <p className="text-xs sm:text-sm opacity-80 max-w-md mx-auto leading-relaxed">
                В хранилище Убежища пока нет предметов. Отправляйтесь в инвентарь склада, чтобы набрать снаряжение и мерч для выживания.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  to="/catalog"
                  onClick={() => soundManager.playTab()}
                  className={`pipboy-btn inline-flex items-center gap-2 py-2.5 px-6 text-xs font-bold uppercase ${
                    isPreWar ? 'bg-[#0033A0] text-white border-[#0033A0]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ПЕРЕЙТИ В ИНВЕНТАРЬ</span>
                </Link>

                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      handleTabSelect('history');
                    }}
                    className="pipboy-btn inline-flex items-center gap-2 py-2.5 px-4 text-xs font-bold uppercase border-current"
                  >
                    <History className="w-4 h-4" />
                    <span>СМОТРЕТЬ ИСТОРИЮ ЗАКАЗОВ</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* СПИСОК ТОВАРОВ В ЯЩИКЕ (8/12) */}
              <div className="lg:col-span-8 space-y-3">
                {/* Индикатор нагрузки инвентаря */}
                <div className={`border-2 p-3.5 ${
                  isOverencumbered
                    ? 'border-red-500 bg-red-950/20 text-red-400'
                    : isPreWar
                      ? 'border-[#0033A0] bg-white text-[#0033A0]'
                      : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
                }`}>
                  <div className="flex items-center justify-between text-xs font-bold uppercase mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Weight className="w-4 h-4" />
                      <span>ВЕС ПРИПАСОВ (CARRY WEIGHT):</span>
                    </span>
                    <span>
                      {totalWeight.toFixed(1)} / {maxWeightWg} LBS ({weightPercent}%)
                    </span>
                  </div>
                  
                  <div className="w-full h-3 border border-current p-0.5">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isOverencumbered ? 'bg-red-500' : isPreWar ? 'bg-[#FFD100]' : 'bg-[#15FF0E]'
                      }`}
                      style={{ width: `${Math.min(100, weightPercent)}%` }}
                    />
                  </div>

                  {isOverencumbered && (
                    <div className="text-[10px] text-red-400 font-bold mt-1.5 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>ВНИМАНИЕ: ПЕРЕГРУЗКА! ВЫ НЕ СМОЖЕТЕ БЕЖАТЬ В ПУСТОШИ.</span>
                    </div>
                  )}
                </div>

                {/* Список карточек товаров в корзине */}
                <div className="space-y-3">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className={`border-2 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
                        isPreWar
                          ? 'border-[#0033A0] bg-white text-[#1C2331]'
                          : 'border-[#15FF0E] bg-black/70 text-[#15FF0E]'
                      }`}
                    >
                      {/* Миниатюра и название */}
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <img
                          src={product.image}
                          alt={product.titleRu}
                          className={`w-16 h-16 object-cover border border-current shrink-0 ${
                            isPreWar ? '' : 'pipboy-image-filter'
                          }`}
                        />
                        <div>
                          <span className="text-[10px] opacity-75 uppercase block">
                            [{product.category}] • {product.franchise}
                          </span>
                          <Link
                            to={`/product/${product.id}`}
                            onClick={() => soundManager.playTab()}
                            className="font-bold text-sm hover:underline block leading-tight"
                          >
                            {product.titleRu}
                          </Link>
                          <div className="text-xs opacity-80 mt-1 flex items-center gap-3">
                            <span>WG: {(product.weightWg * quantity).toFixed(1)} lbs</span>
                            <span>|</span>
                            <span>CND: {product.conditionCnd}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Количество и удаление */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-current/20">
                        <div className="flex items-center border border-current">
                          <button
                            onClick={() => updateQuantity(product.id, quantity - 1)}
                            className="px-2 py-0.5 hover:bg-current/20 transition-colors"
                            title="Уменьшить"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 py-0.5 text-xs font-bold min-w-8 text-center">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, quantity + 1)}
                            className="px-2 py-0.5 hover:bg-current/20 transition-colors"
                            title="Увеличить"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Сумма по позиции */}
                        <div className="text-right min-w-28">
                          <div className="font-black text-sm sm:text-base font-mono">
                            {(product.priceRub * quantity).toLocaleString()} ₽
                          </div>
                        </div>

                        {/* Кнопка Drop */}
                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="p-1.5 border border-red-500/80 text-red-400 hover:bg-red-500 hover:text-black transition-colors"
                          title="Выбросить предмет из инвентаря [DROP]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ИТОГОВАЯ ПАНЕЛЬ СТОИМОСТИ (4/12) */}
              <div className={`lg:col-span-4 border-2 p-5 space-y-5 ${
                isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/90 text-[#15FF0E]'
              }`}>
                <div className="border-b pb-3 border-current/30 flex justify-between items-center">
                  <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                    <Coins className="w-5 h-5 text-current" />
                    <span>РАСЧЕТ БАРТЕРА</span>
                  </h2>

                  <button
                    onClick={() => clearCart()}
                    className="text-[11px] underline text-red-400 hover:opacity-100 opacity-80"
                  >
                    Очистить
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="opacity-80">ПРЕДМЕТОВ:</span>
                    <span className="font-bold">
                      {cart.reduce((sum, i) => sum + i.quantity, 0)} ШТ.
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">СУММАРНЫЙ ВЕС:</span>
                    <span className="font-bold">{totalWeight.toFixed(1)} LBS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">ДОСТАВКА КАРАВАНОМ:</span>
                    <span className="font-bold text-emerald-400">БЕСПЛАТНО</span>
                  </div>

                  <div className="border-t pt-3 mt-3 border-current/30">
                    <div className="flex justify-between items-baseline">
                      <span className="font-black text-sm uppercase">ИТОГО К ОПЛАТЕ:</span>
                      <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
                        {totalRub.toLocaleString()} ₽
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    soundManager.playTab();
                    navigate('/checkout');
                  }}
                  className={`pipboy-btn w-full py-3.5 px-4 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg ${
                    isPreWar
                      ? 'bg-[#0033A0] text-white border-[#0033A0]'
                      : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                  }`}
                >
                  <span>ПЕРЕЙТИ К ОФОРМЛЕНИЮ</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ВКЛАДКА 2: ИСТОРИЯ СДЕЛОК И BARTER VALUE PERFORMANCE TRACKER */}
      {activeTab === 'history' && (
        <div className="space-y-6 animate-in fade-in">
          {/* 1. ДАШБОРД ЭФФЕКТИВНОСТИ БАРТЕРА (BARTER PERFORMANCE METRICS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`border-2 p-4 space-y-1 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/70 text-[#15FF0E]'
            }`}>
              <div className="flex items-center justify-between text-xs opacity-75">
                <span>ОБЪЕМ СДЕЛОК (BARTER VOLUME):</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black tracking-tight">
                {totalBarterTurnoverRub > 0 ? `${totalBarterTurnoverRub.toLocaleString()} ₽` : '32 300 ₽'}
              </div>
              <div className="text-[10px] opacity-75">Суммарный торговый оборот</div>
            </div>

            <div className={`border-2 p-4 space-y-1 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/70 text-[#15FF0E]'
            }`}>
              <div className="flex items-center justify-between text-xs opacity-75">
                <span>БОНУСЫ ЗА СДЕЛКИ:</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">
                +{totalBonusCapsEarned.toLocaleString()} CAPS
              </div>
              <div className="text-[10px] opacity-75">Начислено на баланс Pip-Boy</div>
            </div>

            <div className={`border-2 p-4 space-y-1 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/70 text-[#15FF0E]'
            }`}>
              <div className="flex items-center justify-between text-xs opacity-75">
                <span>ВЫГОДА БАРТЕРА (EFFICIENCY):</span>
                <Award className="w-4 h-4 text-current" />
              </div>
              <div className="text-2xl font-black text-emerald-400">
                +{barterSavingsPercent}%
              </div>
              <div className="text-[10px] opacity-75">Индекс экономии крышек</div>
            </div>

            <div className={`border-2 p-4 space-y-1 ${
              isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/70 text-[#15FF0E]'
            }`}>
              <div className="flex items-center justify-between text-xs opacity-75">
                <span>РАНГ КУПЦА УБЕЖИЩА:</span>
                <ShieldAlert className="w-4 h-4 text-current" />
              </div>
              <div className="text-lg font-black truncate text-amber-400">
                {traderRank}
              </div>
              <div className="text-[10px] opacity-75">Торговая гильдия Мохаве</div>
            </div>
          </div>

          {/* 2. ИНТЕРАКТИВНАЯ ШКАЛА ДИНАМИКИ БАРТЕРА ВО ВРЕМЕНИ */}
          <div className={`border-2 p-5 space-y-3 ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold uppercase border-b pb-2 border-current/30">
              <span className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>ДИНАМИКА НАКОПЛЕНИЯ БОНУСОВ И ВЫГОДЫ (BARTER VALUE TIMELINE)</span>
              </span>
              <span className="text-[10px] opacity-75">СИНХРОНИЗАЦИЯ: ROBCO 2077</span>
            </div>

            {/* Визуальная шкала по транзакциям */}
            <div className="space-y-2 pt-2">
              <div className="flex items-end justify-between gap-2 h-28 pt-4 pb-2 border-b border-current/20">
                {[
                  { label: 'Экспедиция 1', height: '40%', val: '890 C', active: false },
                  { label: 'Караван 2', height: '65%', val: '1,450 C', active: false },
                  { label: 'Сделка 3', height: '50%', val: '999 C', active: false },
                  { label: 'Снабжение 4', height: '85%', val: '2,450 C', active: true },
                  { label: 'Текущий статус', height: '100%', val: 'MAX CAPS', active: true }
                ].map((bar, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[9px] opacity-80 mb-1 group-hover:scale-110 transition-transform">
                      {bar.val}
                    </span>
                    <div
                      className={`w-full max-w-14 border transition-all duration-300 ${
                        bar.active
                          ? isPreWar ? 'bg-[#0033A0] border-[#FFD100]' : 'bg-[#15FF0E] border-[#15FF0E] shadow-[0_0_10px_rgba(21,255,14,0.4)]'
                          : isPreWar ? 'bg-blue-200 border-[#0033A0]' : 'bg-[#15FF0E]/30 border-[#15FF0E]/50'
                      }`}
                      style={{ height: bar.height }}
                    />
                    <span className="text-[9px] uppercase tracking-tighter opacity-70 mt-1 truncate max-w-full">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. СПИСОК ВСЕХ ЗАКАЗОВ (ИСТОРИЯ ТРАНЗАКЦИЙ) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-2 border-current/30 text-xs font-bold uppercase">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>РЕЕСТР ЗАВЕРШЕННЫХ И АКТИВНЫХ СДЕЛОК ({orders.length})</span>
              </span>
              <span className="text-[10px] opacity-75">УБЕЖИЩЕ 67 // ЖУРНАЛ КУПЦА</span>
            </div>

            {orders.length === 0 ? (
              <div className={`border-2 p-8 text-center space-y-3 ${
                isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/70'
              }`}>
                <p className="text-xs opacity-80">История сделок пуста. Сделайте первый заказ через шлюз Убежища!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const orderTotalRub = order.items.reduce(
                    (sum, item) => sum + item.product.priceRub * item.quantity,
                    0
                  );

                  return (
                    <div
                      key={order.id}
                      className={`border-2 p-4 sm:p-5 space-y-4 transition-all ${
                        isPreWar
                          ? 'border-[#0033A0] bg-white text-[#1C2331] hover:shadow-md'
                          : 'border-[#15FF0E] bg-black/70 text-[#15FF0E] hover:border-[#15FF0E] hover:shadow-[0_0_15px_rgba(21,255,14,0.15)]'
                      }`}
                    >
                      {/* Верхняя строка заказа: Номер, дата, трекинг */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3 border-current/25 text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 font-black text-sm">
                            <span>ЗАКАЗ: {order.id}</span>
                            <span className="text-[10px] opacity-75 font-normal">| {order.date}</span>
                          </div>
                          <div className="text-[11px] opacity-80">
                            КАРАВАН: <span className="text-amber-400 font-bold">{order.trackingNumber}</span> • {order.wastelandLocation}
                          </div>
                        </div>

                        {/* Статус со значком */}
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase border flex items-center gap-1.5 ${
                            order.status === 'PREPARATION'
                              ? 'border-yellow-500 text-yellow-400 bg-yellow-950/20'
                              : order.status === 'CARAVAN_DISPATCHED'
                                ? 'border-blue-500 text-blue-400 bg-blue-950/20 animate-pulse'
                                : 'border-emerald-500 text-emerald-400 bg-emerald-950/20'
                          }`}>
                            {order.status === 'PREPARATION' && <Clock className="w-3 h-3" />}
                            {order.status === 'CARAVAN_DISPATCHED' && <Truck className="w-3 h-3" />}
                            {order.status === 'DELIVERED_TO_VAULT' && <CheckCircle2 className="w-3 h-3" />}
                            <span>
                              {order.status === 'PREPARATION' && 'СБОРКА НА СКЛАДЕ'}
                              {order.status === 'CARAVAN_DISPATCHED' && 'В ПУТИ (КАРАВАН)'}
                              {order.status === 'DELIVERED_TO_VAULT' && 'ДОСТАВЛЕНО В УБЕЖИЩЕ'}
                            </span>
                          </span>

                          <button
                            onClick={() => {
                              soundManager.playClick();
                              setSelectedOrderReceipt(order);
                            }}
                            className={`pipboy-btn px-2.5 py-1 text-[10px] font-bold uppercase flex items-center gap-1 ${
                              isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
                            }`}
                            title="Открыть манифест заказа"
                          >
                            <FileText className="w-3 h-3" />
                            <span>МАНИФЕСТ</span>
                          </button>

                          <button
                            onClick={() => {
                              soundManager.playPing();
                              setSelectedTrackingOrder(order);
                              handleTabSelect('tracker', order.id);
                            }}
                            className={`pipboy-btn px-2.5 py-1 text-[10px] font-bold uppercase flex items-center gap-1 ${
                              isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
                            }`}
                            title="Отследить статус каравана в Pip-Boy"
                          >
                            <Navigation className="w-3 h-3 text-cyan-400" />
                            <span>ТРЕКИНГ</span>
                          </button>
                        </div>
                      </div>

                      {/* Список товаров в заказе */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                            <div className="flex items-center gap-3">
                              <img
                                src={item.product.image}
                                alt=""
                                className={`w-10 h-10 object-cover border border-current shrink-0 ${
                                  isPreWar ? '' : 'pipboy-image-filter'
                                }`}
                              />
                              <div>
                                <Link
                                  to={`/product/${item.product.id}`}
                                  onClick={() => soundManager.playTab()}
                                  className="font-bold hover:underline"
                                >
                                  {item.product.titleRu}
                                </Link>
                                <div className="text-[10px] opacity-75">
                                  Количество: {item.quantity} шт. • [{item.product.category}]
                                </div>
                              </div>
                            </div>

                            <div className="text-right font-mono">
                              <span className="font-bold">
                                {(item.product.priceRub * item.quantity).toLocaleString()} ₽
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Итоговая строка заказа */}
                      <div className="border-t pt-3 border-current/25 flex flex-wrap items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-3 opacity-80 text-[11px]">
                          <span>МЕТОД ОПЛАТЫ: {order.paymentMethod === 'PREWAR_SBP' ? 'СБП' : order.paymentMethod === 'BARTER_CASH' ? 'ПРИ ПОЛУЧЕНИИ' : 'БАНКОВСКАЯ КАРТА'}</span>
                        </div>

                        <div className="text-right">
                          <span className="opacity-75 uppercase mr-2 text-[11px]">СУММА СДЕЛКИ:</span>
                          <span className="text-base sm:text-lg font-black font-mono">
                            {(orderTotalRub > 0 ? orderTotalRub : (order.totalRub || 0)).toLocaleString()} ₽
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ВКЛАДКА 3: ТРЕКИНГ КАРАВАНА (PIP-BOY ORDER STATUS TRACKER) */}
      {activeTab === 'tracker' && (
        <div className="space-y-4">
          <PipBoyOrderTracker
            order={effectiveTrackingOrder || undefined}
            initialTrackingNumber={effectiveTrackingOrder?.trackingNumber}
            standalone={true}
            onClose={() => handleTabSelect('stash')}
          />
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО МАНИФЕСТА / КВИТАНЦИИ ЗАКАЗА */}
      {selectedOrderReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`border-4 p-6 max-w-lg w-full relative space-y-4 shadow-2xl ${
            isPreWar
              ? 'border-[#0033A0] bg-white text-[#1C2331]'
              : 'border-[#15FF0E] bg-[#0D1117] text-[#15FF0E] shadow-[0_0_35px_rgba(21,255,14,0.35)]'
          }`}>
            <button
              onClick={() => setSelectedOrderReceipt(null)}
              className="absolute top-4 right-4 p-1 hover:bg-current/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b pb-3 border-current/30 text-center space-y-1">
              <div className="text-[10px] tracking-widest uppercase opacity-75">
                ROBCO INDUSTRIES // ТОРГОВЫЙ МАНИФЕСТ УБЕЖИЩА 67
              </div>
              <h2 className="text-xl font-black uppercase tracking-wider">
                КВИТАНЦИЯ СДЕЛКИ {selectedOrderReceipt.id}
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b pb-1 border-current/20">
                <span className="opacity-75">ДАТА И ВРЕМЯ:</span>
                <span className="font-bold">{selectedOrderReceipt.date}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-current/20">
                <span className="opacity-75">ПОЛУЧАТЕЛЬ:</span>
                <span className="font-bold">{selectedOrderReceipt.recipientName}</span>
              </div>
              {selectedOrderReceipt.telegram && (
                <div className="flex justify-between border-b pb-1 border-current/20 text-sky-400">
                  <span className="opacity-75">СВЯЗЬ (TELEGRAM):</span>
                  <span className="font-bold font-mono">{selectedOrderReceipt.telegram}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-1 border-current/20">
                <span className="opacity-75">ТРЕКИНГ КАРАВАНА:</span>
                <span className="font-bold text-amber-400">{selectedOrderReceipt.trackingNumber}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-current/20">
                <span className="opacity-75">КООРДИНАТЫ ПУСТОШИ:</span>
                <span className="font-bold text-right max-w-xs">{selectedOrderReceipt.wastelandLocation}</span>
              </div>
              <div className="flex justify-between border-b pb-1 border-current/20">
                <span className="opacity-75">МЕТОД РАСЧЕТА:</span>
                <span className="font-bold">{selectedOrderReceipt.paymentMethod}</span>
              </div>

              <div className="pt-2">
                <div className="font-bold uppercase text-[11px] mb-1.5 opacity-80">
                  СПИСОК РЕЛИКВИЙ В ПОСЫЛКЕ:
                </div>
                <div className="space-y-1">
                  {selectedOrderReceipt.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="truncate max-w-xs">• {i.product.titleRu} (x{i.quantity})</span>
                      <span className="font-bold shrink-0">{(i.product.priceRub * i.quantity).toLocaleString()} ₽</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 mt-3 flex justify-between items-baseline text-sm font-black border-current/30">
                <span>ИТОГО К ВЫПЛАТЕ:</span>
                <span className="text-lg font-mono">
                  {selectedOrderReceipt.items.reduce((s, it) => s + it.product.priceRub * it.quantity, 0).toLocaleString()} ₽
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-current/30">
              <button
                onClick={() => {
                  soundManager.playClick();
                  window.print();
                }}
                className="pipboy-btn py-1.5 px-3 text-xs uppercase font-bold flex items-center gap-1 border-current"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>ПЕЧАТЬ [PRINT]</span>
              </button>

              <button
                onClick={() => setSelectedOrderReceipt(null)}
                className={`pipboy-btn py-1.5 px-4 text-xs uppercase font-bold ${
                  isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
                }`}
              >
                ЗАКРЫТЬ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
