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
    <div className={`w-full space-y-4 sm:space-y-6 font-mono select-none overflow-x-hidden ${flickerActive ? 'opacity-75 blur-[0.4px]' : ''}`}>
      {/* Верхняя строка статуса навигации */}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between text-[11px] sm:text-xs">
        <button
          onClick={() => {
            soundManager.playClick();
            navigate(-1);
          }}
          className="flex items-center gap-1.5 hover:underline font-bold self-start"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>[BACK] НАЗАД</span>
        </button>

        <span className="flex items-center gap-2 opacity-75 uppercase tracking-wider leading-tight">
          <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
          <span>ROBCO OS v7.14 // EMERGENCY PROTOCOL 404</span>
        </span>
      </div>

      {/* Главный экран ошибки в стиле терминала Pip-Boy */}
      <div
        className={`border-2 sm:border-4 relative overflow-hidden transition-colors ${
          isPreWar
            ? 'border-[#0033A0] bg-white text-[#1C2331] shadow-[0_0_20px_rgba(0,51,160,0.15)]'
            : 'border-[#15FF0E] bg-black/95 text-[#15FF0E] shadow-[0_0_30px_rgba(21,255,14,0.25)]'
        }`}
      >
        {/* Заголовок окна терминала */}
        <div
          className={`px-3 sm:px-4 py-2 border-b-2 text-[10px] sm:text-xs font-bold tracking-wider sm:tracking-widest flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3 uppercase ${
            isPreWar
              ? 'bg-[#0033A0] text-white border-[#0033A0]'
              : 'bg-[#15FF0E]/20 text-[#15FF0E] border-[#15FF0E]/50'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="w-4 h-4 animate-bounce shrink-0" />
            <span className="truncate">CRITICAL FAULT: СЕКТОР НЕ ОБНАРУЖЕН</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px]">
            <span className="hidden sm:flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 animate-pulse shrink-0" />
              <span>SIGNAL: LOST</span>
            </span>
            <span className="px-1.5 py-0.5 bg-red-600 text-white font-black animate-pulse whitespace-nowrap">
              RAD: {radLevel} RAD/H
            </span>
          </div>
        </div>

        {/* Тело экрана терминала */}
        <div className="p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8">
          {/* Секция гигантского кода 404 с ретро-графикой */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-current/25 pb-6 sm:pb-8">
            <div className="space-y-2 text-center md:text-left w-full md:w-auto">
              <div className="flex items-center justify-center md:justify-start gap-3 sm:gap-4">
                <div
                  className={`text-5xl sm:text-6xl md:text-8xl font-black tracking-tighter drop-shadow-md select-text ${
                    isPreWar ? 'text-[#0033A0]' : 'text-[#15FF0E]'
                  }`}
                >
                  404
                </div>
                <div className="p-2 sm:p-3 border-2 border-dashed border-current/60 hidden sm:block">
                  <Skull className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse text-red-500" />
                </div>
              </div>
              <div className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-wide sm:tracking-wider text-amber-500 flex items-center justify-center md:justify-start gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span>ОШИБКА АДРЕСАЦИИ СЕКТОРА ПУСТОШИ</span>
              </div>
            </div>

            {/* ASCII-арт радар / Пип-бой индикатор (только на широких экранах) */}
            <div
              className={`p-3 sm:p-4 border-2 font-mono text-[10px] sm:text-[11px] leading-tight hidden lg:block ${
                isPreWar ? 'border-[#0033A0] bg-[#F0F5FF]' : 'border-[#15FF0E] bg-black/80'
              }`}
            >
              <pre className="whitespace-pre m-0">{`   +---[ PIP-BOY 3000 Mk IV ]---+
   |   SCANNING FREQUENCY...    |
   |      .  :  *  !  .         |
   |   [X] NO SIGNAL DETECTED   |
   |   COORDINATES: UNKNOWN     |
   +----------------------------+`}</pre>
            </div>
          </div>

          {/* Диагностический лог терминала RobCo */}
          <div
            className={`p-3 sm:p-4 border-2 ${
              isPreWar ? 'border-[#0033A0]/30 bg-[#F0F5FF]/40' : 'border-[#15FF0E]/30 bg-black/60'
            }`}
          >
            <div
              className={`flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase opacity-80 mb-2 ${
                isPreWar ? 'text-[#0033A0]' : 'text-[#15FF0E]'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 shrink-0" />
              <span>ROBCO TERMINAL DIAGNOSTIC DUMP:</span>
            </div>
            <div className="space-y-1 text-[10px] sm:text-[11px] opacity-90 leading-relaxed break-words">
              <div className="flex gap-1.5">
                <span className="shrink-0 text-red-500">&gt;</span>
                <span>ERR_LOCATION_NOT_FOUND: Запрашиваемый отсек убежища заблокирован или разрушен.</span>
              </div>
              <div className="flex gap-1.5">
                <span className="shrink-0 text-red-400">!</span>
                <span>MEMORY_BANK_0x7F404: Данные повреждены радиацией. Караваны сюда не доходят.</span>
              </div>
              <div className="flex gap-1.5">
                <span className="shrink-0 text-amber-400">?</span>
                <span>COURIER_ADVICE: Развернитесь и возвращайтесь в жилой отсек или на главный склад.</span>
              </div>
              <div className="flex gap-1.5">
                <span className="shrink-0 text-[#15FF0E]">*</span>
                <span>RECOVERY_ACTION: Воспользуйтесь картой убежища или проверьте базу данных инвентаря.</span>
              </div>
            </div>
          </div>

          {/* Быстрые действия и кнопки эвакуации */}
          <div className="space-y-3">
            <div className="text-[11px] sm:text-xs font-bold uppercase opacity-80 flex items-center gap-2">
              <Crosshair className="w-4 h-4 shrink-0" />
              <span>ПРОТОКОЛЫ ЭВАКУАЦИИ И НАВИГАЦИИ:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <Link
                to="/"
                onClick={() => soundManager.playClick()}
                className={`pipboy-btn p-3 text-[11px] sm:text-xs font-bold uppercase flex items-center justify-center gap-2 border-2 ${
                  isPreWar
                    ? 'bg-[#0033A0] text-white border-[#0033A0] hover:bg-[#002277]'
                    : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E] hover:bg-[#15FF0E]/90'
                }`}
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>ГЛАВНЫЙ ШЛЮЗ [HOME]</span>
              </Link>

              <Link
                to="/catalog"
                onClick={() => soundManager.playTab()}
                className={`p-3 text-[11px] sm:text-xs font-bold uppercase flex items-center justify-center gap-2 border-2 transition-colors ${
                  isPreWar
                    ? 'border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0]/10'
                    : 'border-[#15FF0E] text-[#15FF0E] hover:bg-[#15FF0E]/20'
                }`}
              >
                <Compass className="w-4 h-4 shrink-0" />
                <span>СКЛАД ПРИПАСОВ</span>
              </Link>

              <button
                type="button"
                onClick={handleSearchRedirect}
                className={`p-3 text-[11px] sm:text-xs font-bold uppercase flex items-center justify-center gap-2 border-2 transition-colors ${
                  isPreWar
                    ? 'border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0]/10'
                    : 'border-[#15FF0E] text-[#15FF0E] hover:bg-[#15FF0E]/20'
                }`}
              >
                <Search className="w-4 h-4 shrink-0" />
                <span>ПОИСК ПО БАЗЕ ROBCO</span>
              </button>
            </div>
          </div>

          {/* Дополнительный интерактивный блок перезагрузки терминала */}
          <div className="pt-4 border-t border-current/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] sm:text-xs opacity-80">
            <span className="flex items-center gap-1.5 flex-wrap">
              <span>PIP-BOY 3000 Mk IV</span>
              <span>//</span>
              <span className="font-bold">STATUS: {signalLost ? 'ISOLATED' : 'RECONNECTING...'}</span>
            </span>

            <button
              type="button"
              onClick={handleReboot}
              className="hover:underline flex items-center gap-1.5 font-bold uppercase cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5 shrink-0" />
              <span>[ПЕРЕЗАГРУЗИТЬ ТЕРМИНАЛ]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
