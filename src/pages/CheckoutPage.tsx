import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { soundManager } from '../utils/sound';
import { Order } from '../types';
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
  Navigation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PipBoyOrderTracker } from '../components/common/PipBoyOrderTracker';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, placeOrder, caps, theme, user } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // Поля формы
  const [recipientName, setRecipientName] = useState(user.callsign || 'Житель Убежища 67');
  const [citySector, setCitySector] = useState('Столичная Пустошь, Сектор 4');
  const [streetVault, setStreetVault] = useState('Улица Ржавых Винтокрылов, Бункер 12');
  const [vaultZip, setVaultZip] = useState('67-VAULT-2077');
  const [paymentMethod, setPaymentMethod] = useState<'CAPS_CARD' | 'PREWAR_SBP' | 'BARTER_CASH'>('CAPS_CARD');

  // Состояние платежного шлюза
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [gatewayStep, setGatewayStep] = useState<string>('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setIsProcessing(true);

    // Имитация процесса через платежный шлюз RobCo
    setGatewayStep('УСТАНОВЛЕНИЕ КВАНТОВОЙ СВЯЗИ С БУНКЕРОМ...');

    setTimeout(() => {
      setGatewayStep('ПРОВЕРКА ПОДЛИННОСТИ КРЫШЕК И СЕРТИФИКАТОВ...');
    }, 900);

    setTimeout(() => {
      setGatewayStep('РЕГИСТРАЦИЯ КАРАВАНА В РЕЕСТРЕ СМОТРИТЕЛЯ...');
    }, 1800);

    setTimeout(() => {
      const order = placeOrder({
        recipientName,
        wastelandLocation: `${citySector}, ${streetVault} [Индекс: ${vaultZip}]`,
        paymentMethod
      });

      setIsProcessing(false);
      setCompletedOrder(order);

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#15FF0E', '#FFD100', '#0033A0']
        });
      } catch {
        // ignore
      }
    }, 2800);
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
            <div className="border-b pb-3 border-current/30">
              <div className="text-xs uppercase opacity-75 mb-1">[TRADE & BARTER PROTOCOL]</div>
              <h1 className="text-2xl font-black uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-6 h-6" />
                <span>КООРДИНАТЫ ДОСТАВКИ В ПУСТОШИ</span>
              </h1>
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
                  УЛИЦА / НОМЕР БУНКЕРА:
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
