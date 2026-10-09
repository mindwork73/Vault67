import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { soundManager } from '../utils/sound';
import { Terminal, Lock, User, Key, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthPageProps {
  isRegister?: boolean;
}

export const AuthPage: React.FC<AuthPageProps> = ({ isRegister = false }) => {
  const navigate = useNavigate();
  const { loginAs, user, theme } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  const [callsign, setCallsign] = useState('');
  const [password, setPassword] = useState('');
  const [vaultCode, setVaultCode] = useState('67');
  const [errorNotice, setErrorNotice] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playClick();
    setErrorNotice('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      // Проверка на Смотрителя (пароль 'overseer' или имя 'admin')
      if (callsign.toLowerCase().includes('admin') || callsign.toLowerCase().includes('overseer') || password === 'overseer') {
        loginAs('overseer', 'Смотритель Убежища 67');
      } else {
        loginAs('dweller', callsign || 'Новый Житель');
      }
      navigate('/catalog');
    }, 1200);
  };

  const handleQuickOverseerLogin = () => {
    soundManager.playFanfare();
    loginAs('overseer', 'Смотритель Убежища 67');
    navigate('/admin');
  };

  return (
    <div className="max-w-md mx-auto my-8 font-mono space-y-6">
      {/* Главный терминал авторизации RobCo */}
      <div className={`border-4 p-6 sm:p-8 space-y-6 relative transition-all ${
        isPreWar
          ? 'border-[#0033A0] bg-white text-[#1C2331] shadow-2xl'
          : 'border-[#15FF0E] bg-black/90 text-[#15FF0E] shadow-[0_0_35px_rgba(21,255,14,0.25)]'
      }`}>
        {/* Угловые маркеры */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-current" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-current" />
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-current" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-current" />

        {/* Заголовок терминала */}
        <div className="border-b pb-4 border-current/30 text-center">
          <Terminal className="w-8 h-8 mx-auto mb-2 text-current animate-pulse" />
          <div className="text-[11px] uppercase tracking-widest opacity-80">
            ROBCO INDUSTRIES TERMLINK v4.02
          </div>
          <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider mt-1">
            {isRegister ? 'РЕГИСТРАЦИЯ ЖИТЕЛЯ' : 'ДОСТУП К ТЕРМИНАЛУ'}
          </h1>
          <div className="text-[10px] opacity-70 mt-1">
            УБЕЖИЩЕ 67 // БАЗА ДАННЫХ ПРИПАСОВ
          </div>
        </div>

        {/* Форма авторизации */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Позывной */}
          <div>
            <label className="block text-xs uppercase font-bold mb-1 opacity-90 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>ПОЗЫВНОЙ ЖИТЕЛЯ:</span>
              </span>
              <span className="text-[10px] opacity-60">[ID_DWELLER]</span>
            </label>
            <div className={`flex items-center border-2 px-3 py-2 ${
              isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
            }`}>
              <span className="mr-1 opacity-70">&gt;</span>
              <input
                type="text"
                required
                value={callsign}
                onChange={(e) => setCallsign(e.target.value)}
                placeholder="ВВЕДИТЕ ПОЗЫВНОЙ..."
                className="bg-transparent border-none outline-none w-full text-xs font-mono uppercase"
              />
              <span className="terminal-cursor text-current shrink-0" />
            </div>
          </div>

          {/* Пароль (скрыт звездочками *) */}
          <div>
            <label className="block text-xs uppercase font-bold mb-1 opacity-90 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>ПАРОЛЬ ШЛЮЗА:</span>
              </span>
              <span className="text-[10px] opacity-60">[ENCRYPTED]</span>
            </label>
            <div className={`flex items-center border-2 px-3 py-2 ${
              isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
            }`}>
              <span className="mr-1 opacity-70">&gt;</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none w-full text-xs font-mono"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs uppercase font-bold mb-1 opacity-90 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" />
                <span>НОМЕР УБЕЖИЩА ПРИПИСКИ:</span>
              </label>
              <div className={`flex items-center border-2 px-3 py-2 ${
                isPreWar ? 'border-[#0033A0] bg-white' : 'border-[#15FF0E] bg-black/60'
              }`}>
                <span className="mr-1 opacity-70">&gt;</span>
                <input
                  type="text"
                  value={vaultCode}
                  onChange={(e) => setVaultCode(e.target.value)}
                  className="bg-transparent border-none outline-none w-full text-xs font-mono"
                />
              </div>
            </div>
          )}

          {/* Кнопка отправки ENTER / ИНИЦИАЛИЗАЦИЯ */}
          <button
            type="submit"
            disabled={isVerifying}
            className={`pipboy-btn w-full py-3 px-4 font-mono font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 mt-2 ${
              isPreWar
                ? 'bg-[#0033A0] text-white border-[#0033A0]'
                : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
            }`}
          >
            {isVerifying ? (
              <span>ДЕШИФРОВКА КЛЮЧЕЙ...</span>
            ) : (
              <span>[ENTER / ИНИЦИАЛИЗАЦИЯ]</span>
            )}
          </button>
        </form>

        {/* Переключение Вход / Регистрация */}
        <div className="border-t pt-4 text-center text-xs opacity-80 border-current/30">
          {isRegister ? (
            <div>
              Уже имеете доступ?{' '}
              <Link to="/login" onClick={() => soundManager.playTab()} className="font-bold underline">
                Войти в терминал
              </Link>
            </div>
          ) : (
            <div>
              Новый выживший в Убежище?{' '}
              <Link to="/register" onClick={() => soundManager.playTab()} className="font-bold underline">
                Инициализировать аккаунт
              </Link>
            </div>
          )}
        </div>

        {/* Быстрый доступ для Смотрителя (Демонстрация админки) */}
        <div className={`p-3 border text-xs text-center space-y-1 ${
          isPreWar ? 'border-[#0033A0]/30 bg-blue-50' : 'border-[#15FF0E]/30 bg-black/40'
        }`}>
          <div className="font-bold uppercase text-[10px] opacity-75">
            [РЕЖИМ ПРЕВЬЮ ДЛЯ ТЕСТИРОВАНИЯ]
          </div>
          <button
            onClick={handleQuickOverseerLogin}
            className="text-xs font-bold underline hover:opacity-100 opacity-90 text-amber-400 cursor-pointer"
          >
            ★ БЫСТРЫЙ ВХОД КАК СМОТРИТЕЛЬ (ADMIN) ★
          </button>
        </div>
      </div>
    </div>
  );
};
