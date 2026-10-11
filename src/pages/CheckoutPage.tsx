import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { soundManager } from '../utils/sound';
import { Order } from '../types';
import { WASTELAND_ADDRESS_PRESETS, WastelandAddressPreset } from '../data/wastelandLocations';
import { 
  ArrowLeft, 
  CreditCard, 
  QrCode, 
  HandCoins, 
  MapPin, 
  User, 
  CheckCircle, 
  Terminal, 
  Loader2,
  PackageCheck,
  Navigation,
  Sparkles,
  ExternalLink,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PipBoyOrderTracker } from '../components/common/PipBoyOrderTracker';

const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.56 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, submitOrder, theme, user } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // Поля формы с автоматической подстановкой из профиля жителя
  const [recipientName, setRecipientName] = useState(user.realName || user.callsign || 'Житель Убежища 67');
  const [citySector, setCitySector] = useState(
    user.addressDetails?.city 
      ? `${user.addressDetails.city}, ${user.addressDetails.region}` 
      : 'Новый Вегас, Пустошь Мохаве'
  );
  const [streetVault, setStreetVault] = useState(
    user.addressDetails?.street 
      ? `${user.addressDetails.street}, ${user.addressDetails.building}${user.addressDetails.apartment ? `, ${user.addressDetails.apartment}` : ''}` 
      : 'Стрип, Авеню Хауса, Казино Лаки 38'
  );
  const [vaultZip, setVaultZip] = useState(user.addressDetails?.postalCode || 'NV-89109-ROBCO');
  const [telegram, setTelegram] = useState(user.telegram || '@wanderer_vault67');
  const [landmarkNote, setLandmarkNote] = useState(user.addressDetails?.landmark || 'Шлюз безопасности сектора');

  // Быстрое автозаполнение из профиля
  const handleLoadFromProfile = () => {
    soundManager.playBeep();
    setRecipientName(user.realName || user.callsign || 'Житель Убежища 67');
    if (user.addressDetails) {
      setCitySector(`${user.addressDetails.city}, ${user.addressDetails.region}`);
      setStreetVault(`${user.addressDetails.street}, ${user.addressDetails.building}${user.addressDetails.apartment ? `, ${user.addressDetails.apartment}` : ''}`);
      setVaultZip(user.addressDetails.postalCode || '67-VAULT-2077');
      setLandmarkNote(user.addressDetails.landmark || '');
    }
    if (user.telegram) {
      setTelegram(user.telegram);
    }
  };

  // Быстрое применение пресета
  const handleApplyPreset = (preset: WastelandAddressPreset) => {
    soundManager.playBeep();
    setCitySector(`${preset.city}, ${preset.region}`);
    setStreetVault(`${preset.street}, ${preset.building}${preset.apartment ? `, ${preset.apartment}` : ''}`);
    setVaultZip(preset.postalCode);
    setLandmarkNote(preset.landmark);
  };

  const [paymentMethod, setPaymentMethod] = useState<'CAPS_CARD' | 'PREWAR_SBP' | 'BARTER_CASH'>('CAPS_CARD');

  // Состояние платежного шлюза
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [gatewayStep, setGatewayStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const totalCaps = cart.reduce((sum, item) => sum + item.product.priceCaps * item.quantity, 0);
  const totalRub = cart.reduce((sum, item) => sum + item.product.priceRub * item.quantity, 0);

  if (cart.length === 0 && !completedOrder) {
    return (
      <div className={`border-2 p-12 text-center font-mono space-y-4 ${
        isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/80'
      }`}>
        <h2 className="text-xl font-bold uppercase">НЕТ ПРИПАСОВ ДЛЯ СДЕЛКИ</h2>
        <p className="text-xs opacity-75">Ваша корзина пуста. Нечего отправлять караваном.</p>
        <Link
          to="/catalog"
          className={`pipboy-btn py-2 px-6 text-xs font-bold inline-block ${
            isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
          }`}
        >
          В КАТАЛОГ
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setIsProcessing(true);
    setError(null);

    setGatewayStep('УСТАНОВЛЕНИЕ КВАНТОВОЙ СВЯЗИ С БУНКЕРОМ...');
    const timer = setTimeout(() => {
      setGatewayStep('РЕГИСТРАЦИЯ КАРАВАНА В РЕЕСТРЕ СМОТРИТЕЛЯ...');
    }, 900);

    try {
      const order = await submitOrder({
        recipientName,
        city: citySector,
        postalCode: vaultZip,
        landmark: landmarkNote,
        paymentMethod,
        telegram,
        phone: user.phone,
      });

      setCompletedOrder(order);

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#15FF0E', '#FFD100', '#0033A0']
        });
      } catch {
        /* noop */
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось оформить заказ. Попробуйте позже.');
    } finally {
      clearTimeout(timer);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 font-mono max-w-4xl mx-auto">
      {/* Кнопка назад */}
      <Link
        to="/stash"
        onClick={() => soundManager.playClick()}
        className="inline-flex items-center gap-1.5 text-xs hover:underline font-bold"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>[ESC] ВЕРНУТЬСЯ В ЯЩИК ДЛЯ ПРИПАСОВ</span>
      </Link>

      {/* Экран успешного заказа */}
      {completedOrder ? (
        <div className={`border-4 p-8 text-center space-y-6 animate-in zoom-in-95 ${
          isPreWar
            ? 'border-[#0033A0] bg-white text-[#1C2331] shadow-2xl'
            : 'border-[#15FF0E] bg-black/90 text-[#15FF0E] shadow-[0_0_40px_rgba(21,255,14,0.3)]'
        }`}>
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 animate-bounce text-emerald-400" />
          </div>

          <div className="space-y-2">
            <div className="text-xs uppercase tracking-widest opacity-80">
              СДЕЛКА ЗАРЕГИСТРИРОВАНА // ТРАНЗАКЦИЯ УСПЕШНА
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider">
              КАРАВАН ОТПРАВЛЕН В УБЕЖИЩЕ!
            </h1>
            <p className="text-xs max-w-lg mx-auto opacity-90 leading-relaxed">
              Ваш заказ снаряжен и передан торговой экспедиции. Скоро брамин с вашим ценным лутом прибудет к шлюзу Убежища.
            </p>
          </div>

          {/* Карточка квитанции */}
          <div className={`border-2 p-4 text-left max-w-md mx-auto space-y-2 text-xs ${
            isPreWar ? 'border-[#0033A0] bg-blue-50' : 'border-[#15FF0E] bg-black/60'
          }`}>
            <div className="flex justify-between border-b pb-1 border-current/30">
              <span className="opacity-75">НОМЕР ЗАКАЗА:</span>
              <span className="font-bold">{completedOrder.id}</span>
            </div>
            <div className="flex justify-between border-b pb-1 border-current/30">
              <span className="opacity-75">ТРЕКИНГ КАРАВАНА:</span>
              <span className="font-bold text-amber-400">{completedOrder.trackingNumber}</span>
            </div>
            <div className="flex justify-between border-b pb-1 border-current/30">
              <span className="opacity-75">ПОЛУЧАТЕЛЬ:</span>
              <span className="font-bold">{completedOrder.recipientName}</span>
            </div>
            {completedOrder.telegram && (
              <div className="flex justify-between border-b pb-1 border-current/30 text-sky-400">
                <span className="opacity-75">СВЯЗЬ (TELEGRAM):</span>
                <span className="font-bold font-mono">{completedOrder.telegram}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-1 border-current/30">
              <span className="opacity-75">ПУНКТ ВЫДАЧИ:</span>
              <span className="font-bold text-right max-w-xs truncate">{completedOrder.wastelandLocation}</span>
            </div>
            <div className="flex justify-between border-b pb-1 border-current/30">
              <span className="opacity-75">МЕТОД ОПЛАТЫ:</span>
              <span className="font-bold">{completedOrder.paymentMethod}</span>
            </div>
            <div className="flex justify-between pt-1 font-black text-sm">
              <span>ИТОГО ОПЛАЧЕНО:</span>
              <div className="text-right">
                <div className="font-mono text-base">{(completedOrder.totalRub || 0).toLocaleString()} ₽</div>
              </div>
            </div>
          </div>

          {/* Интерактивный Pip-Boy трекер доставки */}
          <div className="pt-2 text-left max-w-3xl mx-auto">
            <PipBoyOrderTracker order={completedOrder} />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
            <Link
              to="/stash?tab=tracker"
              onClick={() => soundManager.playTab()}
              className={`pipboy-btn py-2.5 px-6 text-xs font-bold uppercase w-full sm:w-auto flex items-center justify-center gap-1.5 ${
                isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
              }`}
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>ОТСЛЕЖИВАНИЕ В ЖУРНАЛЕ ПРИПАСОВ</span>
            </Link>

            <Link
              to="/catalog"
              onClick={() => soundManager.playTab()}
              className={`pipboy-btn py-2.5 px-6 text-xs font-bold uppercase w-full sm:w-auto ${
                isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-[#0D1117]'
              }`}
            >
              ПРОДОЛЖИТЬ ВЫЛАЗКУ В ИНВЕНТАРЬ
            </Link>
          </div>
        </div>
      ) : (
        /* Форма оформления заказа */
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`border-2 p-5 space-y-6 ${
            isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/80'
          }`}>
            <div className="border-b pb-3 border-current/30 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs uppercase opacity-75 mb-1">[TRADE & BARTER PROTOCOL]</div>
                <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-red-400" />
                  <span>КООРДИНАТЫ ДОСТАВКИ В ПУСТОШИ</span>
                </h1>
              </div>

              <button
                type="button"
                onClick={handleLoadFromProfile}
                className="pipboy-btn px-3 py-1.5 text-xs font-bold uppercase flex items-center gap-1.5 border border-current/40 hover:bg-current/10 transition-colors"
                title="Заполнить сохраненные данные из личного кабинета"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>ЗАПОЛНИТЬ ИЗ ПРОФИЛЯ ROBCO</span>
              </button>
            </div>

            {/* Быстрые пресеты для оформления */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pb-2 border-b border-current/15">
              <span className="opacity-70 uppercase font-bold text-[10px]">БЫСТРЫЙ ВЫБОР СЕКТОРА:</span>
              {[
                { label: 'Новый Вегас', id: 'vegas-lucky38' },
                { label: 'Даймонд-Сити', id: 'diamond-city' },
                { label: 'Мегатонна', id: 'megaton' },
                { label: 'Убежище 67', id: 'vault-67-central' },
                { label: 'Москва (Центр)', id: 'moscow-center' },
                { label: 'СПб (Невский)', id: 'spb-nevsky' }
              ].map((item) => {
                const p = WASTELAND_ADDRESS_PRESETS.find(x => x.id === item.id);
                if (!p) return null;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="px-2 py-0.5 border border-current/30 hover:bg-current/15 text-[10px] font-bold"
                  >
                    ★ {item.label}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block uppercase font-bold mb-1 opacity-90">
                  ПОЗЫВНОЙ ЖИТЕЛЯ / ПОЛУЧАТЕЛЬ:
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className={`w-full p-2 border-2 outline-none font-mono text-xs ${
                    isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
                  }`}
                  placeholder="Напр. Курьер Шестой или Алексей"
                />
              </div>

              <div>
                <label className="block uppercase font-bold mb-1 opacity-90 text-sky-400 flex items-center gap-1.5">
                  <TelegramIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>TELEGRAM ДЛЯ СВЯЗИ С КАРАВАНОМ:</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-sky-400 font-bold">
                    @
                  </div>
                  <input
                    type="text"
                    required
                    value={telegram.startsWith('@') ? telegram.slice(1) : telegram}
                    onChange={(e) => setTelegram(e.target.value ? `@${e.target.value.replace(/^@/, '')}` : '')}
                    className={`w-full pl-7 p-2 border-2 outline-none font-mono text-xs ${
                      isPreWar ? 'border-[#0033A0] bg-white' : 'border-sky-400 bg-black/60 text-sky-300'
                    }`}
                    placeholder="username_wanderer"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase font-bold mb-1 opacity-90">
                  ГОРОД / СЕКТОР ПУСТОШИ:
                </label>
                <input
                  type="text"
                  required
                  value={citySector}
                  onChange={(e) => setCitySector(e.target.value)}
                  className={`w-full p-2 border-2 outline-none font-mono text-xs ${
                    isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
                  }`}
                  placeholder="Напр. Новый Вегас, Стрип или Москва, Бункер 4"
                />
              </div>

              <div>
                <label className="block uppercase font-bold mb-1 opacity-90">
                  УЛИЦА / НОМЕР БУНКЕРА / СТРОЕНИЕ:
                </label>
                <input
                  type="text"
                  required
                  value={streetVault}
                  onChange={(e) => setStreetVault(e.target.value)}
                  className={`w-full p-2 border-2 outline-none font-mono text-xs ${
                    isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
                  }`}
                  placeholder="Напр. Секция 14, Отсек Б-2"
                />
              </div>

              <div>
                <label className="block uppercase font-bold mb-1 opacity-90">
                  ИНДЕКС УБЕЖИЩА (ZIP):
                </label>
                <input
                  type="text"
                  required
                  value={vaultZip}
                  onChange={(e) => setVaultZip(e.target.value)}
                  className={`w-full p-2 border-2 outline-none font-mono text-xs ${
                    isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
                  }`}
                  placeholder="67-VAULT-2077"
                />
              </div>

              <div>
                <label className="block uppercase font-bold mb-1 opacity-90">
                  ОРИЕНТИР ДЛЯ СБРОСА ГРУЗА:
                </label>
                <input
                  type="text"
                  value={landmarkNote}
                  onChange={(e) => setLandmarkNote(e.target.value)}
                  className={`w-full p-2 border-2 outline-none font-mono text-xs ${
                    isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
                  }`}
                  placeholder="У турели у главных ворот..."
                />
              </div>
            </div>

            {/* ВЫБОР МЕТОДА ОПЛАТЫ */}
            <div className="pt-4 border-t border-current/30 space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider">
                ВЫБЕРИТЕ МЕТОД ОПЛАТЫ БАРТЕРА:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. Банковская карта */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    setPaymentMethod('CAPS_CARD');
                  }}
                  className={`p-3.5 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'CAPS_CARD'
                      ? isPreWar
                        ? 'border-[#0033A0] bg-[#FFD100]/20 font-bold'
                        : 'border-[#15FF0E] bg-[#15FF0E]/15 font-bold shadow-[0_0_15px_rgba(21,255,14,0.2)]'
                      : 'border-current/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="w-5 h-5 shrink-0" />
                    <span className="text-xs uppercase">БАНКОВСКАЯ КАРТА</span>
                  </div>
                  <p className="text-[10px] opacity-80 leading-tight">
                    Оплата картой любого банка (МИР / Visa / Mastercard) без комиссии.
                  </p>
                </div>

                {/* 2. СБП */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    setPaymentMethod('PREWAR_SBP');
                  }}
                  className={`p-3.5 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'PREWAR_SBP'
                      ? isPreWar
                        ? 'border-[#0033A0] bg-[#FFD100]/20 font-bold'
                        : 'border-[#15FF0E] bg-[#15FF0E]/15 font-bold shadow-[0_0_15px_rgba(21,255,14,0.2)]'
                      : 'border-current/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <QrCode className="w-5 h-5 shrink-0" />
                    <span className="text-xs uppercase">СБП (БЫСТРЫЙ ПЛАТЕЖ)</span>
                  </div>
                  <p className="text-[10px] opacity-80 leading-tight">
                    Мгновенный перевод по QR-коду терминала без комиссии через банковское приложение.
                  </p>
                </div>

                {/* 3. Оплата при получении */}
                <div
                  onClick={() => {
                    soundManager.playClick();
                    setPaymentMethod('BARTER_CASH');
                  }}
                  className={`p-3.5 border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    paymentMethod === 'BARTER_CASH'
                      ? isPreWar
                        ? 'border-[#0033A0] bg-[#FFD100]/20 font-bold'
                        : 'border-[#15FF0E] bg-[#15FF0E]/15 font-bold shadow-[0_0_15px_rgba(21,255,14,0.2)]'
                      : 'border-current/40 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <HandCoins className="w-5 h-5 shrink-0" />
                    <span className="text-xs uppercase">ПРИ ПОЛУЧЕНИИ</span>
                  </div>
                  <p className="text-[10px] opacity-80 leading-tight">
                    Оплата наличными или картой курьеру каравана при осмотре заказа.
                  </p>
                </div>
              </div>
            </div>

            {/* Итоговая строка и кнопка отправки */}
            <div className="pt-4 border-t border-current/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase opacity-80 block">ИТОГ К ОПЛАТЕ:</span>
                <span className="text-2xl sm:text-3xl font-black tracking-tight font-mono">
                  {totalRub.toLocaleString()} ₽
                </span>
                {error && (
                  <p className="text-xs text-red-400 font-bold mt-2 max-w-xs">
                    ⚠ {error}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className={`pipboy-btn py-3.5 px-8 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg ${
                  isPreWar
                    ? 'bg-[#0033A0] text-white border-[#0033A0]'
                    : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>СВЯЗЬ С ТЕРМИНАЛОМ...</span>
                  </>
                ) : (
                  <>
                    <PackageCheck className="w-4 h-4" />
                    <span>ПОДТВЕРДИТЬ СДЕЛКУ [CONFIRM]</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Модальное окно заглушки платежного шлюза RobCo */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="max-w-md w-full border-4 border-[#15FF0E] bg-[#0D1117] p-6 text-center space-y-4 shadow-[0_0_50px_rgba(21,255,14,0.5)]">
            <Terminal className="w-10 h-10 mx-auto text-[#15FF0E] animate-pulse" />
            <h3 className="text-lg font-black tracking-wider text-[#15FF0E] pipboy-glow">
              ROBCO SECURE HOLO-GATEWAY
            </h3>
            <div className="text-xs font-mono text-[#15FF0E]/90 bg-black/80 border border-[#15FF0E] p-3 text-left">
              &gt; PROTOCOL: QUANTUM_ENCRYPTED_CAPS_TRANSFER<br />
              &gt; STATUS: {gatewayStep}
            </div>
            <div className="w-full h-2 border border-[#15FF0E] p-0.5">
              <div className="h-full bg-[#15FF0E] animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
