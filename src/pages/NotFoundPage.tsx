import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { soundManager } from '../utils/sound';
import {
  AlertTriangle,
  Radio,
  ArrowLeft,
  Compass,
  Home,
  RefreshCw,
  Terminal,
  ShieldAlert,
  Search,
  Crosshair,
  Skull
} from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  const [radLevel, setRadLevel] = useState<number>(142);
  const [flickerActive, setFlickerActive] = useState<boolean>(false);
  const [glitchText, setGlitchText] = useState<string>('SECTOR_404_NOT_FOUND');
  const [signalLost, setSignalLost] = useState<boolean>(true);

  useEffect(() => {
    // Звук предупреждения/ошибки терминала при загрузке 404
    soundManager.playError();
    const geigerTimer = setTimeout(() => {
      soundManager.playGeiger();
    }, 400);

    // Случайные колебания радиационного фона и глитч-эффекты
    const radInterval = setInterval(() => {
      setRadLevel((prev) => {
        const delta = Math.floor(Math.random() * 25) - 12;
        const next = Math.max(90, Math.min(380, prev + delta));
        if (next > 200 && Math.random() > 0.6) {
          soundManager.playGeiger();
        }
        return next;
      });
    }, 1800);

    const flickerInterval = setInterval(() => {
      setFlickerActive(true);
      setTimeout(() => setFlickerActive(false), 120);
    }, 4500);

    return () => {
      clearTimeout(geigerTimer);
      clearInterval(radInterval);
      clearInterval(flickerInterval);
    };
  }, []);

  const handleReboot = () => {
    soundManager.playClick();
    setSignalLost(false);
    setTimeout(() => {
      soundManager.playBeep();
      navigate('/');
    }, 500);
  };

  const handleSearchRedirect = () => {
    soundManager.playClick();
    navigate('/search');
  };

  return (
    <div className={`space-y-6 font-mono select-none ${flickerActive ? 'opacity-75 blur-[0.4px]' : ''}`}>
      {/* Верхняя строка статуса навигации */}
      <div className="flex items-center justify-between text-xs">
        <button
          onClick={() => {
            soundManager.playClick();
            navigate(-1);
          }}
          className="flex items-center gap-1.5 hover:underline font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>[BACK] НАЗАД</span>
        </button>

        <span className="opacity-75 uppercase tracking-wider flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
          ROBCO OS v7.14 // EMERGENCY PROTOCOL 404
        </span>
      </div>

      {/* Главный экран ошибки в стиле терминала Pip-Boy */}
      <div
        className={`border-4 relative overflow-hidden transition-colors ${
          isPreWar
            ? 'border-[#0033A0] bg-white text-[#1C2331] shadow-[0_0_20px_rgba(0,51,160,0.15)]'
            : 'border-[#15FF0E] bg-black/95 text-[#15FF0E] shadow-[0_0_30px_rgba(21,255,14,0.25)]'
        }`}
      >
        {/* Заголовок окна терминала */}
        <div
          className={`px-4 py-2 border-b-2 text-xs font-bold tracking-widest flex items-center justify-between uppercase ${
            isPreWar
              ? 'bg-[#0033A0] text-white border-[#0033A0]'
              : 'bg-[#15FF0E]/20 text-[#15FF0E] border-[#15FF0E]/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>CRITICAL FAULT: СЕКТОР НЕ ОБНАРУЖЕН</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>SIGNAL: LOST</span>
            </span>
            <span className="px-1.5 py-0.2 bg-red-600 text-white font-black animate-pulse">
              RAD: {radLevel} RAD/H
            </span>
          </div>
        </div>

        {/* Тело экрана терминала */}
        <div className="p-6 md:p-10 space-y-8">
          {/* Секция гигантского кода 404 с ретро-графикой */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-current/25 pb-8">
            <div className="space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div
                  className={`text-6xl md:text-8xl font-black tracking-tighter drop-shadow-md select-text ${
                    isPreWar ? 'text-[#0033A0]' : 'text-[#15FF0E]'
                  }`}
                >
                  404
                </div>
                <div className="p-3 border-2 border-dashed border-current/60 hidden sm:block">
                  <Skull className="w-10 h-10 animate-pulse text-red-500" />
                </div>
              </div>
              <div className="text-sm md:text-base font-bold uppercase tracking-wider text-amber-500 flex items-center justify-center md:justify-start gap-2">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <span>ОШИБКА АДРЕСАЦИИ СЕКТОРА ПУСТОШИ</span>
              </div>
            </div>

            {/* ASCII-арт радар / Пип-бой индикатор */}
            <div
              className={`p-4 border-2 font-mono text-[11px] leading-tight hidden lg:block ${
                isPreWar ? 'border-[#0033A0] bg-[#F0F5FF]' : 'border-[#15FF0E] bg-black/80'
              }`}
            >
              <pre className="opacity-90 select-none">
{`   +---[ PIP-BOY 3000 Mk IV ]---+
   |   SCANNING FREQUENCY...    |
   |      .  :  *  !  .         |
   |   [X] NO SIGNAL DETECTED   |
   |   COORDINATES: UNKNOWN     |
   +----------------------------+`}
              </pre>
            </div>
          </div>

          {/* Диагностический лог терминала RobCo */}
          <div
            className={`p-4 border-2 space-y-2 text-xs ${
              isPreWar ? 'border-[#0033A0]/40 bg-[#F8FAFC]' : 'border-[#15FF0E]/40 bg-black/60'
            }`}
          >
            <div className="flex items-center gap-2 font-bold uppercase text-[11px] opacity-75 border-b border-current/20 pb-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>ROBCO TERMINAL DIAGNOSTIC DUMP:</span>
            </div>
            <div className="space-y-1 opacity-90 text-[11px] font-mono leading-relaxed">
              <p className="text-red-400 font-bold">
                &gt; ERR_LOCATION_NOT_FOUND: Запрашиваемый отсек убежища заблокирован или разрушен ядерным ударом.
              </p>
              <p>&gt; MEMORY_BANK_0x7F404: Данные повреждены радиацией. Караваны сюда не доходят.</p>
              <p>&gt; COURIER_ADVICE: Развернитесь и возвращайтесь в жилой отсек или на главный склад.</p>
              <p className="text-amber-400">
                &gt; RECOVERY_ACTION: Воспользуйтесь картой убежища или проверьте базу данных инвентаря.
              </p>
            </div>
          </div>

          {/* Быстрые действия и кнопки эвакуации */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase opacity-80 flex items-center gap-2">
              <Crosshair className="w-4 h-4" />
              <span>ПРОТОКОЛЫ ЭВАКУАЦИИ И НАВИГАЦИИ:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                to="/"
                onClick={() => soundManager.playClick()}
                className={`pipboy-btn p-3 text-xs font-bold uppercase flex items-center justify-center gap-2 border-2 ${
                  isPreWar
                    ? 'bg-[#0033A0] text-white border-[#0033A0] hover:bg-[#002277]'
                    : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E] hover:bg-[#15FF0E]/90'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>ГЛАВНЫЙ ШЛЮЗ [HOME]</span>
              </Link>

              <Link
                to="/catalog"
                onClick={() => soundManager.playTab()}
                className={`p-3 text-xs font-bold uppercase flex items-center justify-center gap-2 border-2 transition-colors ${
                  isPreWar
                    ? 'border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0]/10'
                    : 'border-[#15FF0E] text-[#15FF0E] hover:bg-[#15FF0E]/20'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>СКЛАД ПРИПАСОВ</span>
              </Link>

              <button
                type="button"
                onClick={handleSearchRedirect}
                className={`p-3 text-xs font-bold uppercase flex items-center justify-center gap-2 border-2 transition-colors ${
                  isPreWar
                    ? 'border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0]/10'
                    : 'border-[#15FF0E] text-[#15FF0E] hover:bg-[#15FF0E]/20'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>ПОИСК ПО БАЗЕ ROBCO</span>
              </button>
            </div>
          </div>

          {/* Дополнительный интерактивный блок перезагрузки терминала */}
          <div className="pt-4 border-t border-current/25 flex flex-wrap items-center justify-between gap-3 text-xs opacity-80">
            <span className="flex items-center gap-1.5">
              <span>PIP-BOY 3000 Mk IV</span>
              <span>//</span>
              <span className="font-bold">STATUS: ISOLATED</span>
            </span>

            <button
              type="button"
              onClick={handleReboot}
              className="hover:underline flex items-center gap-1.5 font-bold uppercase cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>[ПЕРЕЗАГРУЗИТЬ ТЕРМИНАЛ]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
