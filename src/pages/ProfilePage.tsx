import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { soundManager } from '../utils/sound';
import { 
  User, 
  ShieldCheck, 
  MapPin, 
  Mail, 
  Phone, 
  Camera, 
  Save, 
  Check, 
  Package, 
  Navigation, 
  LogOut, 
  Award, 
  Zap, 
  Activity, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  FileText
} from 'lucide-react';

const AVATAR_PRESETS = [
  { id: 'vault-boy', name: 'Vault Boy (Классика)', url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=256&q=80' },
  { id: 'ranger', name: 'Рейнджер НКР', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=256&q=80' },
  { id: 'paladin', name: 'Паладин Братства', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=256&q=80' },
  { id: 'scavenger', name: 'Странник Пустоши', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=256&q=80' },
  { id: 'anime-pilot', name: 'Пилот Евангелиона', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=256&q=80' },
  { id: 'cyber-runner', name: 'Кибер-Нетраннер', url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=256&q=80' }
];

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUserProfile, orders, logout, loginAs, theme } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // Локальные состояния редактирования формы
  const [callsign, setCallsign] = useState(user.callsign || '');
  const [realName, setRealName] = useState(user.realName || 'Алексей (Странник)');
  const [email, setEmail] = useState(user.email || 'wanderer67@robco.net');
  const [phone, setPhone] = useState(user.phone || '+7 (999) 777-67-67');
  const [wastelandAddress, setWastelandAddress] = useState(user.wastelandAddress || 'Новый Вегас, Стрип, Лаки 38, Люкс 201');
  const [bio, setBio] = useState(user.bio || 'Житель Убежища 67. Исследователь Пустоши, коллекционер раритетного мерча и реплик RobCo.');
  const [avatar, setAvatar] = useState(user.avatar || AVATAR_PRESETS[0].url);

  const [isSavedBanner, setIsSavedBanner] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Сохранение изменений в профиле
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    updateUserProfile({
      callsign: callsign.trim() || user.callsign,
      realName: realName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      wastelandAddress: wastelandAddress.trim(),
      bio: bio.trim(),
      avatar
    });

    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  // Выход из системы
  const handleLogout = () => {
    soundManager.playClick();
    logout();
    navigate('/');
  };

  // Переключение в режим Смотрителя
  const handleSwitchToOverseer = () => {
    soundManager.playFanfare();
    loginAs('overseer', 'Смотритель Убежища 67');
  };

  const handleSwitchToDweller = () => {
    soundManager.playClick();
    loginAs('dweller', callsign || 'Wanderer_67');
  };

  return (
    <div className="space-y-8 font-mono">
      {/* 1. Верхний терминальный заголовок профиля */}
      <div className={`border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isPreWar ? 'border-[#0033A0]' : 'border-[#15FF0E]'
      }`}>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-80 mb-1 flex items-center gap-2">
            <span>[TERMLINK: DWELLER_DOSSIER_v4.02]</span>
            <span>|</span>
            <span className="text-amber-400 font-bold">СЕКЦИЯ: ЛИЧНЫЙ КАБИНЕТ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider flex items-center gap-2">
            <User className="w-7 h-7" />
            <span>ЛИЧНОЕ ДЕЛО ЖИТЕЛЯ: {user.callsign}</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {user.role === 'overseer' ? (
            <span className="px-3 py-1 border-2 border-amber-400 bg-amber-400/20 text-amber-300 text-xs font-black uppercase">
              ★ ПРАВА СМОТРИТЕЛЯ
            </span>
          ) : (
            <span className="px-3 py-1 border text-xs font-bold uppercase opacity-80">
              ДОСТУП: ЖИТЕЛЬ УБЕЖИЩА
            </span>
          )}

          <button
            onClick={handleLogout}
            className="pipboy-btn px-3 py-1 text-xs font-bold uppercase flex items-center gap-1 border-red-500/80 text-red-400 hover:bg-red-500 hover:text-black transition-colors"
            title="Выйти из терминала"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ВЫЙТИ</span>
          </button>
        </div>
      </div>

      {/* Уведомление об успешном сохранении */}
      {isSavedBanner && (
        <div className={`p-3 border-2 flex items-center justify-between gap-3 text-xs font-bold animate-in fade-in ${
          isPreWar
            ? 'border-[#0033A0] bg-green-100 text-[#0033A0]'
            : 'border-[#15FF0E] bg-[#15FF0E]/20 text-[#15FF0E]'
        }`}>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>ДАННЫЕ ЖИТЕЛЯ УСПЕШНО СИНХРОНИЗИРОВАНЫ В БАЗЕ ROBCO INDUSTRIES!</span>
          </div>
          <span className="text-[10px] opacity-75">STATUS: 200 OK</span>
        </div>
      )}

      {/* 2. Основная сетка: Карточка профиля и Редактирование */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Левая колонка (4/12): Карточка и статистика персонажа */}
        <div className="lg:col-span-4 space-y-6">
          {/* Визитка жителя */}
          <div className={`border-2 sm:border-4 p-5 space-y-4 text-center relative ${
            isPreWar
              ? 'border-[#0033A0] bg-white text-[#1C2331] shadow-xl'
              : 'border-[#15FF0E] bg-black/90 text-[#15FF0E] shadow-[0_0_20px_rgba(21,255,14,0.15)]'
          }`}>
            {/* Аватарка жителя с кнопкой изменения */}
            <div className="relative w-32 h-32 mx-auto">
              <img
                src={avatar}
                alt={user.callsign}
                className={`w-full h-full object-cover border-2 border-current rounded-none ${
                  isPreWar ? '' : 'pipboy-image-filter'
                }`}
              />
              <button
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  setIsAvatarModalOpen(true);
                }}
                className="absolute -bottom-2 -right-2 p-2 bg-current text-black hover:opacity-90 transition-opacity border border-black shadow"
                title="Сменить аватарку жителя"
              >
                <Camera className="w-4 h-4 text-black" />
              </button>
            </div>

            <div>
              <h2 className="text-xl font-black uppercase tracking-wider">
                {user.callsign}
              </h2>
              <div className="text-xs opacity-80 mt-0.5">
                {realName} • ID: {user.id}
              </div>
              <div className="text-[11px] text-amber-400 font-bold uppercase mt-1">
                УБЕЖИЩЕ 67 // {user.vaultId}
              </div>
            </div>

            <p className="text-xs opacity-85 text-left border-t pt-3 border-current/25 leading-relaxed">
              {bio}
            </p>

            {/* Быстрые переключатели роли (для удобного тестирования админки и режима жителя) */}
            <div className="border-t pt-3 border-current/25 space-y-2">
              <div className="text-[10px] uppercase font-bold opacity-75">
                ПРАВА ДОСТУПА В ТЕРМИНАЛЕ:
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold uppercase">
                <button
                  type="button"
                  onClick={handleSwitchToDweller}
                  className={`py-1.5 px-2 border transition-colors ${
                    user.role === 'dweller'
                      ? isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-black font-black'
                      : 'border-current/40 hover:bg-current/10'
                  }`}
                >
                  ЖИТЕЛЬ
                </button>
                <button
                  type="button"
                  onClick={handleSwitchToOverseer}
                  className={`py-1.5 px-2 border transition-colors ${
                    user.role === 'overseer'
                      ? isPreWar ? 'bg-[#0033A0] text-white' : 'bg-amber-400 text-black font-black'
                      : 'border-current/40 hover:bg-current/10'
                  }`}
                >
                  СМОТРИТЕЛЬ ★
                </button>
              </div>
            </div>
          </div>

          {/* Параметры S.P.E.C.I.A.L. персонажа */}
          <div className={`border-2 p-4 space-y-3 ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
          }`}>
            <div className="flex items-center justify-between text-xs font-bold uppercase border-b pb-2 border-current/30">
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>ПАРАМЕТРЫ S.P.E.C.I.A.L.</span>
              </span>
              <span className="text-[10px] opacity-75">УРОВЕНЬ 18</span>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center font-mono">
              {[
                { k: 'S', v: 7, l: 'Сила' },
                { k: 'P', v: 8, l: 'Воспр.' },
                { k: 'E', v: 6, l: 'Вынос.' },
                { k: 'C', v: 9, l: 'Хариз.' },
                { k: 'I', v: 8, l: 'Интел.' },
                { k: 'A', v: 7, l: 'Ловк.' },
                { k: 'L', v: 6, l: 'Удача' }
              ].map((stat) => (
                <div key={stat.k} className="p-1 border border-current/30 bg-current/5">
                  <div className="text-[11px] font-black">{stat.k}</div>
                  <div className="text-sm font-bold text-amber-400">{stat.v}</div>
                </div>
              ))}
            </div>

            <div className="text-[11px] pt-1 flex items-center justify-between opacity-80">
              <span>КАРМА:</span>
              <span className="font-bold text-emerald-400">МЕССИЯ ПУСТОШИ</span>
            </div>

            <div className="text-[11px] flex items-center justify-between opacity-80">
              <span>РАДИАЦИЯ (RAD):</span>
              <span className="font-bold">{user.radLevel} / 1000 RAD</span>
            </div>
          </div>
        </div>

        {/* Правая колонка (8/12): Форма данных и Реестр личных покупок */}
        <div className="lg:col-span-8 space-y-6">
          {/* Форма редактирования личных данных жителя */}
          <div className={`border-2 sm:border-4 p-5 sm:p-6 space-y-6 ${
            isPreWar
              ? 'border-[#0033A0] bg-white text-[#1C2331]'
              : 'border-[#15FF0E] bg-black/90 text-[#15FF0E]'
          }`}>
            <div className="border-b pb-3 border-current/30 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-5 h-5" />
                <span>РЕКВИЗИТЫ ДОСТАВКИ И СВЯЗИ В ПУСТОШИ</span>
              </h2>
              <span className="text-[10px] opacity-75">ROBCO ID: {user.id}</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Позывной */}
                <div>
                  <label className="block uppercase font-bold mb-1 opacity-80">
                    ПОЗЫВНОЙ ЖИТЕЛЯ (CALLSIGN):
                  </label>
                  <input
                    type="text"
                    required
                    value={callsign}
                    onChange={(e) => setCallsign(e.target.value)}
                    className={`w-full p-2 border-2 outline-none font-bold uppercase ${
                      isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                    }`}
                  />
                </div>

                {/* Настоящее имя */}
                <div>
                  <label className="block uppercase font-bold mb-1 opacity-80">
                    ФИО РЕЦИПИЕНТА (ДЛЯ КАРАВАНА):
                  </label>
                  <input
                    type="text"
                    required
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    className={`w-full p-2 border-2 outline-none font-bold ${
                      isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Электронная почта */}
                <div>
                  <label className="block uppercase font-bold mb-1 opacity-80 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>ГОЛОПОЧТА / EMAIL:</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full p-2 border-2 outline-none font-bold ${
                      isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                    }`}
                  />
                </div>

                {/* Телефон / Радиоканал */}
                <div>
                  <label className="block uppercase font-bold mb-1 opacity-80 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" />
                    <span>РАДИОЧАСТОТА / СВЯЗЬ:</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`w-full p-2 border-2 outline-none font-bold ${
                      isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                    }`}
                  />
                </div>
              </div>

              {/* Адрес в Пустоши */}
              <div>
                <label className="block uppercase font-bold mb-1 opacity-80 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span>КООРДИНАТЫ ПУНКТА ВЫДАЧИ ПО УМОЛЧАНИЮ:</span>
                </label>
                <input
                  type="text"
                  required
                  value={wastelandAddress}
                  onChange={(e) => setWastelandAddress(e.target.value)}
                  placeholder="Сектор, город или номер шлюза..."
                  className={`w-full p-2 border-2 outline-none font-bold ${
                    isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                  }`}
                />
              </div>

              {/* Краткая биография */}
              <div>
                <label className="block uppercase font-bold mb-1 opacity-80">
                  ЗАМЕТКА В ЛИЧНОЕ ДЕЛО (BIO):
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className={`w-full p-2 border-2 outline-none ${
                    isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                  }`}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className={`pipboy-btn py-2.5 px-6 text-xs font-black uppercase tracking-wider flex items-center gap-2 ${
                    isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-black'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>СОХРАНИТЬ ДАННЫЕ В ТЕРМИНАЛЕ</span>
                </button>
              </div>
            </form>
          </div>

          {/* Список личных заказов и трекинг */}
          <div className={`border-2 sm:border-4 p-5 sm:p-6 space-y-4 ${
            isPreWar
              ? 'border-[#0033A0] bg-white text-[#1C2331]'
              : 'border-[#15FF0E] bg-black/90 text-[#15FF0E]'
          }`}>
            <div className="border-b pb-3 border-current/30 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                <Package className="w-5 h-5" />
                <span>МОИ ЗАКАЗЫ И ПОСЫЛКИ ({orders.length})</span>
              </h2>
              <Link
                to="/stash?tab=tracker"
                onClick={() => soundManager.playTab()}
                className="text-xs underline font-bold uppercase hover:opacity-80 flex items-center gap-1 text-cyan-400"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>ОТКРЫТЬ PIP-BOY ТРЕКЕР</span>
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center space-y-2 opacity-80 border border-dashed border-current/40">
                <Package className="w-8 h-8 mx-auto opacity-60" />
                <p className="text-xs">У вас пока нет оформленных заказов.</p>
                <Link
                  to="/catalog"
                  onClick={() => soundManager.playTab()}
                  className="inline-block text-xs font-bold underline text-emerald-400"
                >
                  Перейти в инвентарь склада
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => {
                  const orderTotalRub = order.items.reduce(
                    (sum, item) => sum + item.product.priceRub * item.quantity,
                    0
                  );

                  return (
                    <div
                      key={order.id}
                      className={`border-2 p-3 sm:p-4 space-y-3 transition-colors ${
                        isPreWar ? 'border-[#0033A0]/40 bg-blue-50/50' : 'border-[#15FF0E]/40 bg-black/60'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-2 border-current/20 text-xs">
                        <div>
                          <div className="font-bold flex items-center gap-2">
                            <span>ЗАКАЗ {order.id}</span>
                            <span className="text-[10px] opacity-70">({order.date})</span>
                          </div>
                          <div className="text-[11px] opacity-80">
                            КАРАВАН: <span className="font-mono text-amber-400 font-bold">{order.trackingNumber}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border flex items-center gap-1 ${
                            order.status === 'PREPARATION'
                              ? 'border-yellow-500 text-yellow-400'
                              : order.status === 'CARAVAN_DISPATCHED' || order.status === 'IN_TRANSIT'
                                ? 'border-blue-400 text-blue-300 animate-pulse'
                                : order.status === 'OUT_FOR_DELIVERY'
                                  ? 'border-cyan-400 text-cyan-300 animate-pulse'
                                  : 'border-emerald-400 text-emerald-300'
                          }`}>
                            {order.status === 'PREPARATION' && <Clock className="w-3 h-3" />}
                            {(order.status === 'CARAVAN_DISPATCHED' || order.status === 'IN_TRANSIT') && <Truck className="w-3 h-3" />}
                            {order.status === 'OUT_FOR_DELIVERY' && <Navigation className="w-3 h-3" />}
                            {order.status === 'DELIVERED_TO_VAULT' && <CheckCircle2 className="w-3 h-3" />}
                            <span>
                              {order.status === 'PREPARATION' && 'СБОРКА'}
                              {(order.status === 'CARAVAN_DISPATCHED' || order.status === 'IN_TRANSIT') && 'В ПУТИ'}
                              {order.status === 'OUT_FOR_DELIVERY' && 'КУРЬЕР В СЕКТОРЕ'}
                              {order.status === 'DELIVERED_TO_VAULT' && 'ДОСТАВЛЕНО'}
                            </span>
                          </span>

                          <Link
                            to={`/stash?tab=tracker`}
                            onClick={() => soundManager.playPing()}
                            className={`pipboy-btn px-2 py-0.5 text-[10px] font-bold uppercase flex items-center gap-1 ${
                              isPreWar ? 'border-[#0033A0] text-[#0033A0]' : 'border-[#15FF0E] text-[#15FF0E]'
                            }`}
                          >
                            <Navigation className="w-3 h-3 text-cyan-400" />
                            <span>ТРЕКИНГ</span>
                          </Link>
                        </div>
                      </div>

                      {/* Краткий перечень товаров */}
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="opacity-80 text-[11px] truncate max-w-sm">
                          {order.items.map((it) => `${it.product.titleRu} (x${it.quantity})`).join(', ')}
                        </div>
                        <div className="font-black text-sm shrink-0">
                          {(orderTotalRub || order.totalRub || 0).toLocaleString()} ₽
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ВЫБОРА АВАТАРКИ ЖИТЕЛЯ */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in">
          <div className={`border-4 p-6 max-w-lg w-full space-y-5 ${
            isPreWar ? 'border-[#0033A0] bg-white text-[#1C2331]' : 'border-[#15FF0E] bg-[#0D1117] text-[#15FF0E]'
          }`}>
            <div className="border-b pb-3 border-current/30 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>ВЫБОР АВАТАРА ЖИТЕЛЯ УБЕЖИЩА</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="text-xs font-bold px-2 py-0.5 border border-current hover:bg-current hover:text-black"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    soundManager.playClick();
                    setAvatar(preset.url);
                    setIsAvatarModalOpen(false);
                  }}
                  className={`border-2 p-2 text-center transition-all group ${
                    avatar === preset.url
                      ? isPreWar ? 'border-[#0033A0] bg-blue-100 ring-2 ring-[#0033A0]' : 'border-[#15FF0E] bg-[#15FF0E]/20 ring-2 ring-[#15FF0E]'
                      : 'border-current/40 hover:border-current'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-16 h-16 object-cover mx-auto mb-1.5 border border-current"
                  />
                  <div className="text-[10px] font-bold leading-tight uppercase truncate">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>

            {/* Ввод своего URL картинки */}
            <div className="border-t pt-3 border-current/30 space-y-2">
              <label className="block text-[11px] uppercase font-bold opacity-80">
                ИЛИ СВОЯ ССЫЛКА НА ИЗОБРАЖЕНИЕ (URL):
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className={`flex-1 p-1.5 border text-xs outline-none ${
                    isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customAvatarUrl.trim()) {
                      soundManager.playClick();
                      setAvatar(customAvatarUrl.trim());
                      setIsAvatarModalOpen(false);
                    }
                  }}
                  className={`px-3 py-1 text-xs font-bold uppercase border ${
                    isPreWar ? 'bg-[#0033A0] text-white' : 'bg-[#15FF0E] text-black'
                  }`}
                >
                  ПРИМЕНИТЬ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
