import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useVaultStore } from '../../store/useVaultStore';
import { soundManager } from '../../utils/sound';
import { 
  Radio, 
  Volume2, 
  VolumeX, 
  Tv, 
  ShieldAlert, 
  Coins, 
  Package, 
  Terminal, 
  FileText, 
  Sparkles,
  Sun,
  Moon,
  Search,
  X,
  Menu,
  ArrowRight,
  Navigation,
  Home,
  User
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    theme, 
    toggleTheme, 
    caps, 
    cart, 
    soundEnabled, 
    toggleSound, 
    scanlines, 
    toggleScanlines,
    user,
    products,
    storeSettings
  } = useVaultStore();

  // Логика поиска в Header
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);

  // Фильтрация результатов поиска в реальном времени
  const liveSearchResults = React.useMemo(() => {
    if (!headerSearchQuery.trim()) return [];
    const q = headerSearchQuery.toLowerCase().trim();
    return products
      .filter((p) => (
        p.title.toLowerCase().includes(q) ||
        p.titleRu.toLowerCase().includes(q) ||
        p.franchise.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      ))
      .slice(0, 5); // Топ-5 для выпадающего списка
  }, [products, headerSearchQuery]);

  // Закрытие выпадающего окна при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Закрытие при смене маршрута
  useEffect(() => {
    setIsSearchOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (headerSearchQuery.trim()) {
      soundManager.playClick();
      setIsSearchOpen(false);
      navigate(`/search?query=${encodeURIComponent(headerSearchQuery.trim())}`);
    }
  };

  // Логика Пасхалки №1: 5 быстрых кликов на логотип Vault 67
  const [logoClicks, setLogoClicks] = useState(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = (e: React.MouseEvent) => {
    soundManager.playClick();
    const newCount = logoClicks + 1;
    setLogoClicks(newCount);

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (newCount >= 5) {
      // 5 быстрых кликов достигнуты!
      toggleTheme();
      setLogoClicks(0);
    } else {
      clickTimerRef.current = setTimeout(() => {
        setLogoClicks(0);
      }, 2500);
    }
  };

  // Расчет RAD-индикатора (заполненность корзины / радиация от лута)
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const radLevel = Math.min(999, user.radLevel + totalCartItems * 45);
  const radPercent = Math.min(100, Math.round((radLevel / 1000) * 100));

  const isPreWar = theme === 'pre-war';

  return (
    <header className={`sticky top-0 z-40 border-b-2 transition-colors duration-200 ${
      isPreWar 
        ? 'bg-[#0033A0] text-[#FFD100] border-[#FFD100] shadow-md' 
        : 'bg-[#0D1117]/95 border-[#15FF0E] backdrop-blur-md text-[#15FF0E]'
    }`}>
      {/* Экстренное радиооповещение Смотрителя (если активно) */}
      {storeSettings?.announcementActive && storeSettings?.announcement && (
        <div className={`px-4 py-1.5 text-xs font-mono font-bold flex items-center justify-center gap-2 border-b text-center ${
          isPreWar ? 'bg-[#FFD100] text-[#0033A0] border-[#0033A0]' : 'bg-amber-400/20 text-amber-300 border-amber-400/40'
        }`}>
          <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span className="truncate">{storeSettings.announcement}</span>
        </div>
      )}

      {/* Верхняя статусная строка RobCo */}
      <div className={`px-4 py-1 text-[11px] font-mono flex items-center justify-between border-b ${
        isPreWar ? 'border-[#FFD100]/30 text-white/90' : 'border-[#15FF0E]/20 text-[#15FF0E]/80'
      }`}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full animate-pulse bg-current" />
            ROBCO TERMLINK ONLINE
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">VAULT PROTOCOL 67-B</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">СЕКТОР: СТОЛИЧНАЯ ПУСТОШЬ</span>
        </div>
        
        <div className="flex items-center gap-4">
          {logoClicks > 0 && (
            <span className="text-amber-400 font-bold animate-pulse text-[10px]">
              [OVERRIDE: {logoClicks}/5 КЛИКОВ ДО 1950s VAULT-TEC]
            </span>
          )}
          <span className="hidden lg:inline text-[10px] tracking-widest">
            {isPreWar ? 'PRE-WAR VAULT-TEC 1950s ARCHIVE' : 'PIP-BOY 3000 POST-WAR CRT'}
          </span>
          {user.role === 'overseer' && (
            <Link
              to="/admin"
              onClick={() => soundManager.playClick()}
              className="text-amber-400 font-bold hover:underline border border-amber-400/80 px-1.5 py-0.5 bg-amber-400/10 text-[10px]"
              title="Панель управления Смотрителя"
            >
              ★ СМОТРИТЕЛЬ
            </Link>
          )}
          <Link
            to="/profile"
            onClick={() => soundManager.playClick()}
            className="hover:underline font-bold flex items-center gap-1"
            title="Личный кабинет жителя"
          >
            <User className="w-3 h-3 text-current" />
            <span>ЖИТЕЛЬ: {user.callsign}</span>
          </Link>
        </div>
      </div>

      {/* Основная панель навигации */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Логотип с отслеживанием 5 кликов */}
        <div className="flex items-center gap-3">
          <div
            onClick={handleLogoClick}
            className={`group cursor-pointer select-none border-2 p-1.5 px-3 flex items-center gap-2 transition-transform active:scale-95 ${
              isPreWar
                ? 'border-[#FFD100] bg-[#FFD100] text-[#0033A0] hover:bg-white'
                : 'border-[#15FF0E] bg-black/60 hover:bg-[#15FF0E] hover:text-[#0D1117]'
            }`}
            title="Кликните 5 раз подряд, чтобы переключить довоенный/послевоенный режим!"
          >
            <img src="/favicon.svg" alt="Vault 67 Logo" className="w-7 h-7 object-contain shrink-0" />
            <div>
              <div className="text-lg font-black tracking-widest leading-none font-mono">
                VAULT 67
              </div>
              <div className="text-[9px] uppercase tracking-tighter opacity-80 leading-tight">
                {isPreWar ? 'Vault-Tec Store' : 'Wasteland Geek Requisitions'}
              </div>
            </div>
          </div>
        </div>

        {/* ПОЛЕ ПОИСКА В HEADER С ФИЛЬТРАЦИЕЙ В РЕАЛЬНОМ ВРЕМЕНИ */}
        <div ref={searchContainerRef} className="relative order-3 md:order-2 w-full md:w-64 lg:w-80">
          <form onSubmit={handleSearchSubmit}>
            <div className={`flex items-center border-2 px-2.5 py-1 text-xs font-mono ${
              isPreWar ? 'border-[#FFD100] bg-white text-[#0033A0]' : 'border-[#15FF0E] bg-black/80 text-[#15FF0E]'
            }`}>
              <Search className="w-3.5 h-3.5 mr-1.5 shrink-0 opacity-70" />
              <input
                type="text"
                value={headerSearchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={(e) => {
                  setHeaderSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                placeholder="ПОИСК ПО СКЛАДУ [ENTER]..."
                className="bg-transparent border-none outline-none w-full text-xs font-mono uppercase placeholder:opacity-50"
              />
              {headerSearchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setHeaderSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="text-xs font-bold px-1 hover:opacity-100"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </form>

          {/* ВЫПАДАЮЩИЙ СПИСОК РЕАЛЬНОГО ВРЕМЕНИ */}
          {isSearchOpen && headerSearchQuery.trim().length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-1 border-2 z-50 font-mono text-xs shadow-2xl animate-in fade-in-50 ${
              isPreWar
                ? 'border-[#0033A0] bg-white text-[#1C2331]'
                : 'border-[#15FF0E] bg-[#0D1117] text-[#15FF0E] shadow-[0_0_25px_rgba(21,255,14,0.35)]'
            }`}>
              <div className={`p-2 border-b text-[10px] uppercase font-bold flex justify-between ${
                isPreWar ? 'border-[#0033A0]/20 bg-blue-50 text-[#0033A0]' : 'border-[#15FF0E]/20 bg-[#15FF0E]/10'
              }`}>
                <span>РЕЗУЛЬТАТЫ СКАНИРОВАНИЯ ({liveSearchResults.length}):</span>
                <span>НАЖМИТЕ ENTER</span>
              </div>

              {liveSearchResults.length > 0 ? (
                <div className="divide-y divide-current/20 max-h-72 overflow-y-auto">
                  {liveSearchResults.map((prod) => (
                    <Link
                      key={prod.id}
                      to={`/product/${prod.id}`}
                      onClick={() => {
                        soundManager.playTab();
                        setIsSearchOpen(false);
                      }}
                      className="p-2.5 flex items-center justify-between gap-3 hover:bg-current/10 transition-colors block"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={prod.image}
                          alt=""
                          className={`w-9 h-9 object-cover border border-current shrink-0 ${
                            isPreWar ? '' : 'pipboy-image-filter'
                          }`}
                        />
                        <div className="truncate">
                          <div className="font-bold text-xs truncate">{prod.titleRu}</div>
                          <div className="text-[10px] opacity-75">{prod.franchise} • [{prod.category}]</div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-xs font-mono">{prod.priceRub.toLocaleString()} ₽</div>
                      </div>
                    </Link>
                  ))}

                  <button
                    onClick={handleSearchSubmit}
                    className={`w-full p-2 text-center text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 ${
                      isPreWar ? 'bg-[#0033A0] text-white hover:bg-black' : 'bg-[#15FF0E] text-[#0D1117] hover:bg-white'
                    }`}
                  >
                    <span>СМОТРЕТЬ ВСЕ РЕЗУЛЬТАТЫ</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center text-xs opacity-80">
                  По запросу «{headerSearchQuery}» ничего не найдено. Нажмите Enter для расширенного поиска.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Навигационные ссылки */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider font-bold order-2 md:order-3">
          <Link
            to="/"
            onClick={() => soundManager.playTab()}
            className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 ${
              location.pathname === '/'
                ? isPreWar 
                  ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' 
                  : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                : isPreWar
                  ? 'border-transparent hover:border-[#FFD100] text-white'
                  : 'border-transparent hover:border-[#15FF0E]'
            }`}
            title="Главная страница Убежища 67"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Главная</span>
          </Link>

          <Link
            to="/catalog"
            onClick={() => soundManager.playTab()}
            className={`px-3 py-1.5 border transition-all ${
              location.pathname === '/catalog'
                ? isPreWar 
                  ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' 
                  : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                : isPreWar
                  ? 'border-transparent hover:border-[#FFD100] text-white'
                  : 'border-transparent hover:border-[#15FF0E]'
            }`}
          >
            Инвентарь
          </Link>

          <Link
            to="/stash"
            onClick={() => soundManager.playTab()}
            className={`relative px-3 py-1.5 border transition-all flex items-center gap-1.5 ${
              location.pathname === '/stash' && !location.search.includes('tab=tracker') && !location.search.includes('tab=history')
                ? isPreWar 
                  ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' 
                  : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                : isPreWar
                  ? 'border-transparent hover:border-[#FFD100] text-white'
                  : 'border-transparent hover:border-[#15FF0E]'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Припасы</span>
            {totalCartItems > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] font-black ${
                isPreWar ? 'bg-[#0033A0] text-[#FFD100]' : 'bg-[#15FF0E] text-[#0D1117]'
              }`}>
                {totalCartItems}
              </span>
            )}
          </Link>

          <Link
            to="/stash?tab=tracker"
            onClick={() => soundManager.playTab()}
            className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 ${
              location.pathname === '/stash' && location.search.includes('tab=tracker')
                ? isPreWar 
                  ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' 
                  : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                : isPreWar
                  ? 'border-transparent hover:border-[#FFD100] text-white'
                  : 'border-transparent hover:border-[#15FF0E]'
            }`}
            title="Отслеживание караванов и заказов в Pip-Boy"
          >
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>Трекинг</span>
          </Link>

          <Link
            to="/holotapes"
            onClick={() => soundManager.playTab()}
            className={`px-3 py-1.5 border transition-all hidden sm:flex items-center gap-1 ${
              location.pathname.startsWith('/holotapes') || location.pathname === '/about' || location.pathname === '/delivery' || location.pathname === '/payment'
                ? isPreWar 
                  ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' 
                  : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                : isPreWar
                  ? 'border-transparent hover:border-[#FFD100] text-white'
                  : 'border-transparent hover:border-[#15FF0E]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Голозаписи</span>
          </Link>

          <Link
            to="/profile"
            onClick={() => soundManager.playTab()}
            className={`px-3 py-1.5 border transition-all flex items-center gap-1.5 ${
              location.pathname === '/profile' || location.pathname === '/account'
                ? isPreWar 
                  ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' 
                  : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                : isPreWar
                  ? 'border-transparent hover:border-[#FFD100] text-white'
                  : 'border-transparent hover:border-[#15FF0E]'
            }`}
            title="Личный кабинет жителя"
          >
            <User className="w-3.5 h-3.5" />
            <span>Кабинет</span>
          </Link>
        </nav>

        {/* Индикаторы RAD, CAPS и системные тумблеры */}
        <div className="flex items-center gap-2 sm:gap-3 order-4">
          {/* Индикатор RAD (Заполненность корзины / уровень радиации) */}
          <div 
            onClick={() => soundManager.playGeiger()}
            className={`cursor-pointer px-2 py-1 border text-xs font-mono flex items-center gap-1.5 select-none ${
              isPreWar ? 'border-[#FFD100]/60 bg-blue-900/60' : 'border-[#15FF0E]/60 bg-black/40'
            }`}
            title="Индикатор радиации корзины (кликните для проверки дозиметра)"
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${radLevel > 400 ? 'text-red-500 animate-pulse' : ''}`} />
            <div className="flex flex-col">
              <span className="text-[9px] leading-none opacity-80">RADS</span>
              <span className="font-bold leading-none">{radLevel} rad</span>
            </div>
            {/* Шкала заполненности */}
            <div className="w-8 h-2 border border-current hidden xl:block p-0.5">
              <div 
                className={`h-full transition-all duration-300 ${radLevel > 400 ? 'bg-red-500' : 'bg-current'}`}
                style={{ width: `${radPercent}%` }}
              />
            </div>
          </div>

          {/* Индикатор CAPS (Баланс крышек) */}
          <div className={`px-2.5 py-1 border text-xs font-mono flex items-center gap-1.5 font-bold ${
            isPreWar ? 'border-[#FFD100] bg-[#FFD100] text-[#0033A0]' : 'border-[#15FF0E] bg-black/60 text-[#15FF0E]'
          }`}>
            <Coins className="w-3.5 h-3.5" />
            <span>{caps.toLocaleString()}</span>
            <span className="text-[10px] opacity-80">CAPS</span>
          </div>

          {/* Переключатели CRT, Звука и Темы */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleSound()}
              className={`p-1.5 border transition-colors ${
                isPreWar
                  ? 'border-[#FFD100]/60 hover:bg-[#FFD100] hover:text-[#0D1117]'
                  : 'border-[#15FF0E]/60 hover:bg-[#15FF0E] hover:text-[#0D1117]'
              }`}
              title={soundEnabled ? 'Выключить звук терминала' : 'Включить звук терминала'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 opacity-50" />}
            </button>

            {!isPreWar && (
              <button
                onClick={() => toggleScanlines()}
                className={`p-1.5 border transition-colors ${
                  scanlines
                    ? 'border-[#15FF0E] bg-[#15FF0E]/20 text-[#15FF0E]'
                    : 'border-[#15FF0E]/40 opacity-50'
                }`}
                title="Переключить CRT-полосы сканирования"
              >
                <Tv className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Быстрый переключатель темы */}
            <button
              onClick={() => toggleTheme()}
              className={`p-1.5 border transition-colors ${
                isPreWar
                  ? 'border-[#FFD100] bg-white text-[#0033A0]'
                  : 'border-[#15FF0E]/60 hover:bg-[#15FF0E] hover:text-[#0D1117]'
              }`}
              title={isPreWar ? 'Вернуться в Post-War (Зеленый CRT)' : 'Переключить в Pre-War (Vault-Tec 1950s)'}
            >
              {isPreWar ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            {/* Мобильная кнопка МЕНЮ */}
            <button
              onClick={() => {
                soundManager.playTab();
                setIsMobileNavOpen(!isMobileNavOpen);
              }}
              className={`md:hidden p-1.5 border transition-colors ${
                isPreWar
                  ? 'border-[#FFD100] text-[#FFD100] hover:bg-[#FFD100] hover:text-[#0033A0]'
                  : 'border-[#15FF0E] text-[#15FF0E] hover:bg-[#15FF0E] hover:text-[#0D1117]'
              }`}
              title="Открыть меню терминала"
            >
              {isMobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* ВЫПАДАЮЩАЯ МОБИЛЬНАЯ ПАНЕЛЬ НАВИГАЦИИ PIP-BOY */}
      {isMobileNavOpen && (
        <div className={`md:hidden border-t-2 font-mono text-xs px-4 py-3 space-y-3 animate-in slide-in-from-top-2 ${
          isPreWar
            ? 'border-[#FFD100] bg-[#0033A0] text-white'
            : 'border-[#15FF0E] bg-[#0D1117] text-[#15FF0E]'
        }`}>
          <div className="text-[10px] uppercase font-bold tracking-widest opacity-80 border-b pb-1 border-current/30 flex justify-between">
            <span>[PIP-BOY 3000 MOBILE MENU]</span>
            <span>{user.callsign}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              onClick={() => {
                soundManager.playTab();
                setIsMobileNavOpen(false);
              }}
              className={`p-2.5 border text-center font-bold uppercase flex items-center justify-center gap-1.5 ${
                location.pathname === '/'
                  ? isPreWar ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                  : 'border-current/40'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>ГЛАВНАЯ</span>
            </Link>

            <Link
              to="/catalog"
              onClick={() => {
                soundManager.playTab();
                setIsMobileNavOpen(false);
              }}
              className={`p-2.5 border text-center font-bold uppercase ${
                location.pathname === '/catalog'
                  ? isPreWar ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                  : 'border-current/40'
              }`}
            >
              ИНВЕНТАРЬ
            </Link>

            <Link
              to="/stash"
              onClick={() => {
                soundManager.playTab();
                setIsMobileNavOpen(false);
              }}
              className={`p-2.5 border text-center font-bold uppercase flex items-center justify-center gap-1.5 ${
                location.pathname === '/stash' && !location.search.includes('tab=tracker') && !location.search.includes('tab=history')
                  ? isPreWar ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                  : 'border-current/40'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>ПРИПАСЫ ({totalCartItems})</span>
            </Link>

            <Link
              to="/stash?tab=tracker"
              onClick={() => {
                soundManager.playTab();
                setIsMobileNavOpen(false);
              }}
              className={`p-2.5 border text-center font-bold uppercase flex items-center justify-center gap-1.5 ${
                location.pathname === '/stash' && location.search.includes('tab=tracker')
                  ? isPreWar ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                  : 'border-current/40'
              }`}
            >
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>ТРЕКИНГ</span>
            </Link>

            <Link
              to="/profile"
              onClick={() => {
                soundManager.playTab();
                setIsMobileNavOpen(false);
              }}
              className={`p-2.5 border text-center font-bold uppercase flex items-center justify-center gap-1.5 ${
                location.pathname === '/profile'
                  ? isPreWar ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                  : 'border-current/40'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>КАБИНЕТ</span>
            </Link>

            <Link
              to="/holotapes"
              onClick={() => {
                soundManager.playTab();
                setIsMobileNavOpen(false);
              }}
              className={`p-2.5 border text-center font-bold uppercase ${
                location.pathname.startsWith('/holotapes')
                  ? isPreWar ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                  : 'border-current/40'
              }`}
            >
              ГОЛОЗАПИСИ
            </Link>

            {user.role === 'overseer' && (
              <Link
                to="/admin"
                onClick={() => {
                  soundManager.playTab();
                  setIsMobileNavOpen(false);
                }}
                className={`p-2.5 border text-center font-bold uppercase col-span-2 ${
                  location.pathname === '/admin'
                    ? isPreWar ? 'bg-[#FFD100] text-[#0033A0] border-[#FFD100]' : 'bg-amber-400 text-black border-amber-400'
                    : 'border-amber-400/60 text-amber-400'
                }`}
              >
                ★ ТЕРМИНАЛ СМОТРИТЕЛЯ
              </Link>
            )}
          </div>

          <div className="border-t pt-2 flex items-center justify-between text-[11px] opacity-80">
            <span>БАЛАНС: {caps} CAPS</span>
            <span>РАДИАЦИЯ: {radLevel} RAD</span>
          </div>
        </div>
      )}
    </header>
  );
};
