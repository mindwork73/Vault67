import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { soundManager } from '../utils/sound';
import { 
  WASTELAND_ADDRESS_PRESETS, 
  WastelandAddressPreset, 
  formatFullAddressString 
} from '../data/wastelandLocations';
import { 
  REAL_RUSSIAN_CITIES, 
  searchRealAddress, 
  isWastelandMockAddress, 
  searchLocalStreetsInCity,
  RealAddressResult 
} from '../utils/realGeoService';
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
  FileText,
  Search,
  ExternalLink,
  Copy,
  Radio,
  Sparkles,
  Building2,
  Compass,
  LocateFixed,
  Home,
  Sliders,
  CheckCheck,
  Send,
  Trash2,
  CheckCheck as CheckedIcon
} from 'lucide-react';

const TelegramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.37.74-.56 2.92-1.27 4.86-2.11 5.83-2.52 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
  </svg>
);

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
  const { user, updateUserProfile, orders, logout, loginAs, theme, isAuthed } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // Локальные состояния контактов и пользователя
  const [callsign, setCallsign] = useState(user.callsign || '');
  const [realName, setRealName] = useState(user.realName || 'Алексей (Странник)');
  const [email, setEmail] = useState(user.email || 'wanderer67@robco.net');
  const [phone, setPhone] = useState(user.phone || '+7 (999) 777-67-67');
  const [telegram, setTelegram] = useState(user.telegram || '@wanderer_vault67');

  // Детальные поля адреса доставки
  const [region, setRegion] = useState(user.addressDetails?.region || '');
  const [city, setCity] = useState(user.addressDetails?.city || '');
  const [street, setStreet] = useState(user.addressDetails?.street || '');
  const [building, setBuilding] = useState(user.addressDetails?.building || '');
  const [apartment, setApartment] = useState(user.addressDetails?.apartment || '');
  const [postalCode, setPostalCode] = useState(user.addressDetails?.postalCode || '');
  const [landmark, setLandmark] = useState(user.addressDetails?.landmark || '');

  // Состояния реального автозаполнения и подсказок
  const [realAddressSuggestions, setRealAddressSuggestions] = useState<RealAddressResult[]>([]);
  const [isSearchingRealAddress, setIsSearchingRealAddress] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<RealAddressResult[]>([]);
  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [streetSuggestions, setStreetSuggestions] = useState<string[]>([]);
  const [isStreetDropdownOpen, setIsStreetDropdownOpen] = useState(false);
  const [geoResults, setGeoResults] = useState<any[]>([]);

  const [bio, setBio] = useState(user.bio || 'Житель Убежища 67. Исследователь Пустоши, коллекционер раритетного мерча и реплик RobCo.');
  const [avatar, setAvatar] = useState(user.avatar || AVATAR_PRESETS[0].url);

  // Состояния автозаполнения и UI
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [isAddressDropdownOpen, setIsAddressDropdownOpen] = useState(false);
  const [isScanningGps, setIsScanningGps] = useState(false);
  const [autoFilledNotice, setAutoFilledNotice] = useState<string | null>(null);
  const [copiedTelegram, setCopiedTelegram] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const [isSavedBanner, setIsSavedBanner] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Очистка тестовых / фейковых полей адреса Пустоши при фокусе или клике на любое поле
  const clearMockAddressIfPresent = () => {
    if (isWastelandMockAddress({ region, city, street, building, apartment, postalCode, landmark })) {
      setRegion('');
      setCity('');
      setStreet('');
      setBuilding('');
      setApartment('');
      setPostalCode('');
      setLandmark('');
      soundManager.playClick();
      setAutoFilledNotice('⚡ Фейковые тестовые данные Пустоши стёрты. Введите ваш реальный адрес доставки!');
      setTimeout(() => setAutoFilledNotice(null), 4000);
      return true;
    }
    return false;
  };

  // Ручная очистка всех полей
  const handleManualClearAll = () => {
    soundManager.playClick();
    setRegion('');
    setCity('');
    setStreet('');
    setBuilding('');
    setApartment('');
    setPostalCode('');
    setLandmark('');
    setAddressSearchQuery('');
    setCitySuggestions([]);
    setStreetSuggestions([]);
    setAutoFilledNotice('Все поля адреса очищены. Начните ввод города (напр. Ульяновск)');
    setTimeout(() => setAutoFilledNotice(null), 3500);
  };

  // Обработка ввода в поле поиска (RobCo Auto-Nav)
  const handleSearchQueryChange = async (val: string) => {
    setAddressSearchQuery(val);
    setIsAddressDropdownOpen(true);
    if (!val.trim()) {
      setRealAddressSuggestions([]);
      return;
    }
    setIsSearchingRealAddress(true);
    try {
      const results = await searchRealAddress(val, city);
      setRealAddressSuggestions(results);
    } catch {
      setRealAddressSuggestions([]);
    } finally {
      setIsSearchingRealAddress(false);
    }
  };

  // Обработка ввода в прямое поле ГОРОД (с автодополнением региона и индекса, напр. для Ульяновска)
  const handleCityInputChange = async (val: string) => {
    setCity(val);
    setIsCityDropdownOpen(true);

    // Если введен город (например Ульяновск), сразу дописываем регион и индекс
    const matched = REAL_RUSSIAN_CITIES.find(
      c => c.name.toLowerCase() === val.trim().toLowerCase() ||
           c.fullName.toLowerCase() === val.trim().toLowerCase()
    );
    if (matched) {
      setRegion(matched.region);
      setPostalCode(matched.postalCode);
      if (isWastelandMockAddress({ street, building, apartment })) {
        setStreet('');
        setBuilding('');
        setApartment('');
      }
      setAutoFilledNotice(`✓ Автодополнение для ${matched.name}: ${matched.region} [Индекс: ${matched.postalCode}]`);
      setTimeout(() => setAutoFilledNotice(null), 4000);
    }

    if (val.trim().length >= 1) {
      const results = await searchRealAddress(val);
      setCitySuggestions(results.filter(r => r.city));
    } else {
      setCitySuggestions([]);
    }
  };

  // Выбор города из выпадающего списка подсказок
  const handleSelectCitySuggestion = (res: RealAddressResult) => {
    soundManager.playBeep();
    setCity(res.city);
    if (res.region) setRegion(res.region);
    if (res.postalCode) setPostalCode(res.postalCode);
    if (isWastelandMockAddress({ street, building, apartment })) {
      setStreet('');
      setBuilding('');
      setApartment('');
    }
    setIsCityDropdownOpen(false);
    setAutoFilledNotice(`✓ Выбран город: ${res.city}, ${res.region} [${res.postalCode}]`);
    setTimeout(() => setAutoFilledNotice(null), 3500);
  };

  // Выбор результата из главного поиска Auto-Nav
  const handleSelectRealAddressResult = (res: RealAddressResult) => {
    soundManager.playBeep();
    if (res.city) setCity(res.city);
    if (res.region) setRegion(res.region);
    if (res.street) setStreet(res.street);
    if (res.building) setBuilding(res.building);
    if (res.postalCode) setPostalCode(res.postalCode);
    if (isWastelandMockAddress({ apartment, landmark })) {
      setApartment('');
      setLandmark('');
    }
    setAddressSearchQuery(res.displayLabel);
    setIsAddressDropdownOpen(false);
    setAutoFilledNotice(`✓ Адрес выбран: ${res.displayLabel}`);
    setTimeout(() => setAutoFilledNotice(null), 3500);
  };

  // Обработка ввода в поле УЛИЦА
  const handleStreetInputChange = (val: string) => {
    setStreet(val);
    if (city) {
      const suggestions = searchLocalStreetsInCity(city, val);
      setStreetSuggestions(suggestions);
      setIsStreetDropdownOpen(suggestions.length > 0);
    }
  };

  const handleSelectStreetSuggestion = (streetName: string) => {
    soundManager.playBeep();
    setStreet(streetName);
    setIsStreetDropdownOpen(false);
  };

  // Быстрый выбор реального города по кнопке-чипу (например Ульяновск)
  const handleQuickSelectRealCity = (cityName: string) => {
    const target = REAL_RUSSIAN_CITIES.find(c => c.name.toLowerCase() === cityName.toLowerCase());
    if (!target) return;
    soundManager.playBeep();
    setCity(target.fullName);
    setRegion(target.region);
    setPostalCode(target.postalCode);
    if (isWastelandMockAddress({ street, building, apartment })) {
      setStreet('');
      setBuilding('');
      setApartment('');
    }
    setAutoFilledNotice(`✓ Выбран город: ${target.fullName}, ${target.region} [Индекс: ${target.postalCode}]`);
    setTimeout(() => setAutoFilledNotice(null), 3500);
  };

  // Форматированный сводный адрес для накладной
  const formattedAddress = useMemo(() => {
    return formatFullAddressString({
      region,
      city,
      street,
      building,
      apartment,
      postalCode,
      landmark
    });
  }, [region, city, street, building, apartment, postalCode, landmark]);

  // Фильтрация вариантов автозаполнения
  const filteredPresets = useMemo(() => {
    const q = addressSearchQuery.trim().toLowerCase();
    if (!q) return WASTELAND_ADDRESS_PRESETS.slice(0, 8);
    return WASTELAND_ADDRESS_PRESETS.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.region.toLowerCase().includes(q) ||
      p.street.toLowerCase().includes(q) ||
      p.searchKeywords.some(kw => kw.includes(q))
    );
  }, [addressSearchQuery]);

  // Применение пресета автозаполнения
  const applyAddressPreset = (preset: WastelandAddressPreset) => {
    soundManager.playBeep();
    setRegion(preset.region);
    setCity(preset.city);
    setStreet(preset.street);
    setBuilding(preset.building);
    setApartment(preset.apartment || '');
    setPostalCode(preset.postalCode);
    setLandmark(preset.landmark);
    setAddressSearchQuery(preset.name);
    setIsAddressDropdownOpen(false);

    setAutoFilledNotice(`✓ ДАННЫЕ АВТОЗАПОЛНЕНЫ: ${preset.name}`);
    setTimeout(() => setAutoFilledNotice(null), 3500);
  };

  // Применение результата реального геокодера (/api/geo/search)
  const applyGeo = (r: any) => {
    soundManager.playBeep();
    setRegion(r.region || '');
    setCity(r.city || '');
    setStreet(r.street || '');
    setBuilding(r.building || '');
    setApartment(r.apartment || '');
    setPostalCode(r.postal_code || '');
    setLandmark(r.label || '');
    setAddressSearchQuery(r.label || r.city || '');
    setGeoResults([]);
    setIsAddressDropdownOpen(false);
    setAutoFilledNotice(`✓ АДРЕС ОПРЕДЕЛЁН: ${r.label || r.city || ''}`);
    setTimeout(() => setAutoFilledNotice(null), 3500);
  };

  // Живой поиск через серверный геокодер (debounce 400мс)
  useEffect(() => {
    const q = addressSearchQuery.trim();
    if (q.length < 3) {
      setGeoResults([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const { api } = await import('../services/api');
        const res: any = await api.geoSearch(q);
        if (!cancelled) setGeoResults(Array.isArray(res) ? res : []);
      } catch {
        if (!cancelled) setGeoResults([]);
      }
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [addressSearchQuery]);

  // Сканирование GPS/радиомаяка RobCo
  const handleScanGpsBeacon = () => {
    soundManager.playGeiger();
    setIsScanningGps(true);
    setAutoFilledNotice('📡 СКАНИРОВАНИЕ СПУТНИКОВОГО СИГНАЛА ROBCO GPS...');

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * WASTELAND_ADDRESS_PRESETS.length);
      const chosen = WASTELAND_ADDRESS_PRESETS[randomIndex];
      applyAddressPreset(chosen);
      soundManager.playFanfare();
      setIsScanningGps(false);
    }, 1200);
  };

  // Копирование Telegram тега
  const handleCopyTelegram = () => {
    soundManager.playClick();
    const clean = telegram.trim().startsWith('@') ? telegram.trim() : `@${telegram.trim()}`;
    navigator.clipboard.writeText(clean);
    setCopiedTelegram(true);
    setTimeout(() => setCopiedTelegram(false), 2000);
  };

  // Копирование сводного адреса
  const handleCopyAddress = () => {
    soundManager.playClick();
    navigator.clipboard.writeText(formattedAddress);
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Сохранение изменений в профиле
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();

    const addressDetails = {
      region: region.trim(),
      city: city.trim(),
      street: street.trim(),
      building: building.trim(),
      apartment: apartment.trim(),
      postalCode: postalCode.trim(),
      landmark: landmark.trim()
    };

    // Оптимистичное обновление локального состояния (поля, которых нет в API, тоже)
    updateUserProfile({
      callsign: callsign.trim() || user.callsign,
      realName: realName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      telegram: telegram.trim(),
      wastelandAddress: formattedAddress,
      addressDetails,
      bio: bio.trim(),
      avatar
    });

    // Синхронизация с бэкендом (если пользователь авторизован)
    if (isAuthed) {
      (async () => {
        try {
          const { api } = await import('../services/api');
          const { mapUser } = await import('../services/adapters');
          const res = await api.updateMe({
            callsign: callsign.trim() || undefined,
            phone: phone.trim() || undefined,
            avatar: avatar || undefined,
            bio: bio.trim() || undefined,
            region: region.trim() || undefined,
            city: city.trim() || undefined,
            street: street.trim() || undefined,
            building: building.trim() || undefined,
            apartment: apartment.trim() || undefined,
            postal_code: postalCode.trim() || undefined,
            landmark: landmark.trim() || undefined,
          });
          updateUserProfile(mapUser(res));
        } catch {
          /* локальные изменения сохранены; ошибку синка игнорируем */
        }
      })();
    }

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

  // Форматирование ссылки в Telegram
  const cleanTelegramUsername = telegram.replace('@', '').replace('https://t.me/', '').trim();

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

              {/* Telegram контакт жителя */}
              {telegram && (
                <div className="mt-2.5 pt-2 border-t border-current/20 flex items-center justify-center gap-1.5 text-xs text-sky-400 font-bold">
                  <TelegramIcon className="w-3.5 h-3.5 shrink-0" />
                  <a
                    href={`https://t.me/${cleanTelegramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline flex items-center gap-1 truncate"
                    title="Связаться в Telegram"
                  >
                    <span>{telegram.startsWith('@') ? telegram : `@${telegram}`}</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                </div>
              )}

              {/* Отображение локации жителя */}
              <div className="text-[11px] opacity-75 flex items-center justify-center gap-1 mt-1 truncate">
                <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                <span className="truncate">{city || 'Новый Вегас'}, {region || 'Пустошь'}</span>
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
            <div className="border-b pb-3 border-current/30 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <span>РЕКВИЗИТЫ ДОСТАВКИ И СВЯЗИ В ПУСТОШИ</span>
              </h2>
              <span className="text-[10px] opacity-75 font-mono">ROBCO ID: {user.id}</span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6 text-xs">
              {/* СЕКЦИЯ 1: КАНАЛЫ СВЯЗИ И ИДЕНТИФИКАЦИЯ */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-current/20 pb-1.5 text-xs font-bold uppercase tracking-wider opacity-90">
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>1. ИДЕНТИФИКАЦИЯ И КАНАЛЫ СВЯЗИ ДЛЯ КАРАВАНА</span>
                </div>

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
                      placeholder="Wanderer_67"
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
                      placeholder="Иванов Алексей Петрович"
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
                      placeholder="wanderer67@robco.net"
                      className={`w-full p-2 border-2 outline-none font-bold ${
                        isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                      }`}
                    />
                  </div>

                  {/* Телефон / Радиоканал */}
                  <div>
                    <label className="block uppercase font-bold mb-1 opacity-80 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      <span>РАДИОЧАСТОТА / ТЕЛЕФОН:</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+7 (999) 777-67-67"
                      className={`w-full p-2 border-2 outline-none font-bold ${
                        isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                      }`}
                    />
                  </div>
                </div>

                {/* TELEGRAM ДЛЯ СВЯЗИ */}
                <div className={`p-3.5 border-2 space-y-2.5 ${
                  isPreWar ? 'border-[#0033A0]/60 bg-blue-50/50' : 'border-sky-400/60 bg-sky-950/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <label className="block uppercase font-bold text-sky-400 flex items-center gap-2">
                      <TelegramIcon className="w-4 h-4 text-sky-400" />
                      <span>TELEGRAM ДЛЯ ОПЕРАТИВНОЙ СВЯЗИ В ПУСТОШИ:</span>
                    </label>
                    <span className="text-[10px] px-2 py-0.5 border border-sky-400/40 text-sky-300 font-bold uppercase">
                      ПРЯМОЙ КАНАЛ С КАРАВАНОМ
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-sky-400 font-black">
                        @
                      </div>
                      <input
                        type="text"
                        value={telegram.startsWith('@') ? telegram.slice(1) : telegram}
                        onChange={(e) => setTelegram(e.target.value ? `@${e.target.value.replace(/^@/, '')}` : '')}
                        placeholder="username_wanderer"
                        className={`w-full pl-8 pr-3 py-2 border-2 outline-none font-bold text-sm ${
                          isPreWar 
                            ? 'border-[#0033A0] bg-white text-[#1C2331]' 
                            : 'border-sky-400 bg-black text-sky-300 placeholder:text-sky-700'
                        }`}
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {cleanTelegramUsername && (
                        <a
                          href={`https://t.me/${cleanTelegramUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pipboy-btn px-3 py-2 text-xs font-bold uppercase flex items-center gap-1.5 bg-sky-500 text-black border border-sky-300 hover:bg-sky-400 transition-colors"
                          title="Открыть чат в Telegram"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>ОТКРЫТЬ В TG</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={handleCopyTelegram}
                        className={`pipboy-btn px-3 py-2 text-xs font-bold uppercase flex items-center gap-1.5 border transition-colors ${
                          copiedTelegram
                            ? 'border-emerald-400 text-emerald-400 bg-emerald-950/30'
                            : 'border-current/40 hover:bg-current/10'
                        }`}
                        title="Скопировать ник Telegram"
                      >
                        {copiedTelegram ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedTelegram ? 'СКОПИРОВАНО' : 'КОПИРОВАТЬ'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] opacity-75 leading-relaxed">
                    Курьеры каравана «Красная Ракета» и дежурные терминала отправляют в Telegram код подтверждения выдачи, статус прохождения блокпостов и трек-ссылку каравана.
                  </p>
                </div>
              </div>

              {/* СЕКЦИЯ 2: ПОЛНОЦЕННАЯ ФОРМА АДРЕСА С АВТОЗАПОЛНЕНИЕМ */}
              <div className="space-y-4 pt-2 border-t border-current/20">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-current/20 pb-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-90">
                    <MapPin className="w-4 h-4 text-red-400" />
                    <span>2. ПОЛНОЦЕННЫЙ АДРЕС ДОСТАВКИ И ПУНКТ ВЫДАЧИ</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 border border-current/30 text-amber-400 font-bold uppercase">
                    ROBCO AUTO-NAV v2.4
                  </span>
                </div>

                {/* БЛОК УМНОГО АВТОЗАПОЛНЕНИЯ АДРЕСА */}
                <div className={`p-4 border-2 space-y-3 relative ${
                  isPreWar ? 'border-amber-600 bg-amber-50/60' : 'border-amber-500/80 bg-amber-950/15'
                }`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase flex items-center gap-1.5 text-amber-400">
                      <Sparkles className="w-4 h-4" />
                      <span>УМНОЕ АВТОЗАПОЛНЕНИЕ АДРЕСА В 1 КЛИК:</span>
                    </span>

                    <button
                      type="button"
                      onClick={handleScanGpsBeacon}
                      disabled={isScanningGps}
                      className={`pipboy-btn px-2.5 py-1 text-[11px] font-bold uppercase flex items-center gap-1.5 border border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-black transition-all ${
                        isScanningGps ? 'animate-pulse opacity-80' : ''
                      }`}
                      title="Определить координаты по радиомаяку"
                    >
                      <LocateFixed className="w-3.5 h-3.5" />
                      <span>{isScanningGps ? 'СКАНИРОВАНИЕ GPS...' : 'СКАНИРОВАТЬ РАДИОМАЯК'}</span>
                    </button>
                  </div>

                  {/* Поле поиска локации с живым автокомплитом */}
                  <div className="relative">
                    <div className="relative flex items-center">
                      <Search className="w-4 h-4 absolute left-3 text-current/60 pointer-events-none" />
                      <input
                        type="text"
                        value={addressSearchQuery}
                        onFocus={() => setIsAddressDropdownOpen(true)}
                        onChange={(e) => {
                          setAddressSearchQuery(e.target.value);
                          setIsAddressDropdownOpen(true);
                        }}
                        placeholder="Начните вводить город, сектор или бункер (напр. Вегас, Даймонд, Мегатонна, Москва, Питер)..."
                        className={`w-full pl-9 pr-8 py-2 border-2 outline-none font-bold text-xs ${
                          isPreWar ? 'border-amber-600 bg-white' : 'border-amber-500/80 bg-black text-[#15FF0E]'
                        }`}
                      />
                      {addressSearchQuery && (
                        <button
                          type="button"
                          onClick={() => {
                            setAddressSearchQuery('');
                            setIsAddressDropdownOpen(false);
                          }}
                          className="absolute right-2.5 text-current/50 hover:text-current font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Выпадающее терминальное меню подсказок */}
                    {isAddressDropdownOpen && (
                      <div className={`absolute z-30 left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto border-2 shadow-2xl ${
                        isPreWar 
                          ? 'border-[#0033A0] bg-white text-[#1C2331]' 
                          : 'border-[#15FF0E] bg-black text-[#15FF0E] shadow-[0_10px_25px_rgba(21,255,14,0.2)]'
                      }`}>
                        <div className="p-2 border-b border-current/20 flex items-center justify-between text-[10px] uppercase font-bold opacity-75">
                          <span>НАЙДЕНО ЛОКАЦИЙ В КАРТЕ ПУСТОШИ ({filteredPresets.length})</span>
                          <span>ВЫБЕРИТЕ ДЛЯ АВТОЗАПОЛНЕНИЯ</span>
                        </div>

                        {/* Реальные результаты геокодера (адреса РФ) */}
                        {geoResults.length > 0 && (
                          <div className="border-b border-current/20">
                            <div className="px-2 py-1 text-[10px] uppercase font-bold text-amber-400 bg-current/5 flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              <span>РЕАЛЬНЫЕ АДРЕСА ({geoResults.length})</span>
                            </div>
                            <div className="divide-y divide-current/15">
                              {geoResults.map((r, i) => (
                                <div
                                  key={`geo-${i}`}
                                  onClick={() => applyGeo(r)}
                                  className={`p-2.5 cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                                    isPreWar ? 'hover:bg-blue-50' : 'hover:bg-emerald-500/15'
                                  }`}
                                >
                                  <div className="space-y-0.5">
                                    <div className="font-bold flex items-center gap-1.5">
                                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                      <span>{r.label || r.city}</span>
                                    </div>
                                    <div className="text-[11px] opacity-75">
                                      {[r.region, r.city, r.street, r.building].filter(Boolean).join(', ')}
                                      {r.postal_code ? ` [${r.postal_code}]` : ''}
                                    </div>
                                  </div>
                                  <span className="text-[10px] font-bold text-emerald-400 shrink-0 self-center">
                                    [ВЫБРАТЬ]
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {filteredPresets.length === 0 ? (
                          <div className="p-4 text-center text-xs opacity-70">
                            Локация не найдена в базе RobCo. Вы можете заполнить поля вручную ниже.
                          </div>
                        ) : (
                          <div className="divide-y divide-current/15">
                            {filteredPresets.map((preset) => (
                              <div
                                key={preset.id}
                                onClick={() => applyAddressPreset(preset)}
                                className={`p-2.5 cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                                  isPreWar ? 'hover:bg-blue-50' : 'hover:bg-[#15FF0E]/15'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="font-bold flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                    <span>{preset.name}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 border border-current/30 text-amber-400 font-mono">
                                      {preset.badge}
                                    </span>
                                  </div>
                                  <div className="text-[11px] opacity-75">
                                    {preset.region} • {preset.street}, {preset.building}
                                  </div>
                                  <div className="text-[10px] opacity-60">
                                    Ориентир: {preset.landmark}
                                  </div>
                                </div>

                                <span className="text-[10px] font-bold text-emerald-400 shrink-0 self-center">
                                  [ВЫБРАТЬ]
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ряд быстрых кнопок топовых пресетов в 1 клик */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase font-bold opacity-75 flex items-center gap-1">
                      <Compass className="w-3 h-3 text-amber-400" />
                      <span>ПОПУЛЯРНЫЕ ОПОРНЫЕ ПУНКТЫ КАРАВАНА:</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px]">
                      {[
                        { label: '★ Стрип (Новый Вегас)', id: 'vegas-lucky38' },
                        { label: '★ Даймонд-Сити', id: 'diamond-city' },
                        { label: '★ Мегатонна', id: 'megaton' },
                        { label: '★ Убежище 67', id: 'vault-67-central' },
                        { label: '★ Ривет-Сити', id: 'rivet-city' },
                        { label: '★ Москва (Центр)', id: 'moscow-center' },
                        { label: '★ Санкт-Петербург', id: 'spb-nevsky' }
                      ].map((item) => {
                        const targetPreset = WASTELAND_ADDRESS_PRESETS.find(p => p.id === item.id);
                        if (!targetPreset) return null;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => applyAddressPreset(targetPreset)}
                            className={`px-2.5 py-1 border transition-all font-bold ${
                              city === targetPreset.city
                                ? isPreWar
                                  ? 'bg-[#0033A0] text-white border-[#0033A0]'
                                  : 'bg-[#15FF0E] text-black border-[#15FF0E]'
                                : 'border-current/40 hover:bg-current/15'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Плашка подтверждения автозаполнения */}
                  {autoFilledNotice && (
                    <div className="p-2 border border-emerald-400 bg-emerald-950/25 text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{autoFilledNotice}</span>
                    </div>
                  )}
                </div>

                {/* СТРУКТУРИРОВАННЫЕ ДЕТАЛЬНЫЕ ПОЛЯ АДРЕСА */}
                <div className="space-y-4">
                  {/* Строка 1: Регион и Город */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase font-bold mb-1 opacity-85">
                        РЕГИОН / СЕКТОР ПУСТОШИ / ОБЛАСТЬ:
                      </label>
                      <input
                        type="text"
                        required
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        placeholder="Напр. Пустошь Мохаве, Столичная Пустошь, Московская обл."
                        className={`w-full p-2 border-2 outline-none font-bold ${
                          isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block uppercase font-bold mb-1 opacity-85">
                        ГОРОД / ПОСЕЛЕНИЕ / СЕКЦИЯ:
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Напр. Новый Вегас, Даймонд-Сити, Мегатонна, Москва"
                        className={`w-full p-2 border-2 outline-none font-bold ${
                          isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Строка 2: Улица и Дом/Бункер */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase font-bold mb-1 opacity-85">
                        УЛИЦА / БУЛЬВАР / ЯРУС:
                      </label>
                      <input
                        type="text"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Напр. Стрип, Верхний Ярус, ул. Тверская"
                        className={`w-full p-2 border-2 outline-none font-bold ${
                          isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block uppercase font-bold mb-1 opacity-85">
                        ДОМ / БУНКЕР / КОРПУС / ЗДАНИЕ:
                      </label>
                      <input
                        type="text"
                        required
                        value={building}
                        onChange={(e) => setBuilding(e.target.value)}
                        placeholder="Напр. Казино Лаки 38 Башня А, д. 7, Бункер 12"
                        className={`w-full p-2 border-2 outline-none font-bold ${
                          isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Строка 3: Квартира/Отсек и Индекс */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block uppercase font-bold mb-1 opacity-85">
                        КВАРТИРА / КАЮТА / ОТСЕК / ОФИС:
                      </label>
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        placeholder="Напр. Люкс 201, Отсек 42, Офис 101"
                        className={`w-full p-2 border-2 outline-none font-bold ${
                          isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block uppercase font-bold mb-1 opacity-85">
                        ПОЧТОВЫЙ ИНДЕКС / ROBCO ZIP:
                      </label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Напр. NV-89109-ROBCO, 125009, 67-VAULT-2077"
                        className={`w-full p-2 border-2 outline-none font-bold font-mono ${
                          isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Строка 4: Ориентир для каравана */}
                  <div>
                    <label className="block uppercase font-bold mb-1 opacity-85 flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>ОРИЕНТИР ДЛЯ КАРАВАНА И ИНСТРУКЦИЯ КУРЬЕРУ:</span>
                    </label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      placeholder="Напр. У турели на КПП-1, постучать 3 раза в шлюз, оставить часовому"
                      className={`w-full p-2 border-2 outline-none font-bold ${
                        isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black text-[#15FF0E]'
                      }`}
                    />
                  </div>

                  {/* СВОДНЫЙ НАКЛАДНОЙ АДРЕС ДЛЯ ПЕЧАТИ */}
                  <div className={`p-3 border-2 space-y-1.5 ${
                    isPreWar ? 'border-[#0033A0]/60 bg-blue-50/40' : 'border-[#15FF0E]/60 bg-[#15FF0E]/10'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold opacity-80 flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>НАКЛАДНАЯ КАРАВАНА «КРАСНАЯ РАКЕТА» (ИТОГОВЫЙ АДРЕС):</span>
                      </span>

                      <button
                        type="button"
                        onClick={handleCopyAddress}
                        className="text-[10px] underline font-bold uppercase hover:opacity-80 flex items-center gap-1 text-emerald-400"
                        title="Скопировать полный адрес"
                      >
                        {copiedAddress ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAddress ? 'АДРЕС СКОПИРОВАН' : 'СКОПИРОВАТЬ'}</span>
                      </button>
                    </div>

                    <div className="font-bold text-xs leading-relaxed text-amber-400 select-all font-mono">
                      {formattedAddress}
                    </div>
                  </div>
                </div>
              </div>

              {/* СЕКЦИЯ 3: КРАТКАЯ БИОГРАФИЯ ЖИТЕЛЯ */}
              <div className="space-y-2 pt-2 border-t border-current/20">
                <label className="block uppercase font-bold opacity-80">
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

              {/* Кнопка сохранения */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className={`pipboy-btn py-3 px-8 text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-lg transition-transform active:scale-95 ${
                    isPreWar ? 'bg-[#0033A0] text-white hover:bg-blue-800' : 'bg-[#15FF0E] text-black hover:bg-emerald-400'
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>СОХРАНИТЬ РЕКВИЗИТЫ В ТЕРМИНАЛЕ</span>
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
