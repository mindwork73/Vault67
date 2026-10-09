import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { CrtOverlay } from '../common/CrtOverlay';
import { VaultBoyEasterEgg } from '../common/VaultBoyEasterEgg';
import { useVaultStore } from '../../store/useVaultStore';
import { soundManager } from '../../utils/sound';
import { Sparkles, X } from 'lucide-react';

export const Layout: React.FC = () => {
  const { theme, preWarUnlockedAlert, closePreWarAlert, soundEnabled } = useVaultStore();
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Глобальный слушатель кликов на все кнопки и ссылки для звука механического щелчка терминала
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest('button, a, input[type="checkbox"], input[type="radio"], select');
      if (clickable && soundEnabled) {
        soundManager.playClick();
      }
    };

    // Слушатель наведения (hover) для интерактивных элементов интерфейса Pip-Boy
    const handleGlobalHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const hoverable = target.closest('button, a, select, input, [role="button"], .pipboy-btn');
      if (hoverable && soundEnabled) {
        soundManager.playHover();
      }
    };

    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('mouseover', handleGlobalHover);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('mouseover', handleGlobalHover);
    };
  }, [soundEnabled]);

  // Применяем класс темы к html/body
  useEffect(() => {
    if (theme === 'pre-war') {
      document.body.classList.add('theme-pre-war');
    } else {
      document.body.classList.remove('theme-pre-war');
    }
  }, [theme]);

  const isPreWar = theme === 'pre-war';

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isPreWar ? 'bg-[#F5EFEB] text-[#1C2331]' : 'bg-[#0D1117] text-[#15FF0E] crt-screen'
    }`}>
      {/* CRT эффекты (сканлайны, виньетка, полоса) */}
      <CrtOverlay />

      {/* Навбар */}
      <Navbar />

      {/* Навигационная цепочка (Breadcrumbs) */}
      <Breadcrumbs />

      {/* Уведомление об активации секретного режима 1950-х */}
      {preWarUnlockedAlert && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-[#FFD100] border-4 border-[#0033A0] p-4 text-[#0033A0] shadow-2xl animate-in slide-in-from-bottom">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 font-black text-sm uppercase">
              <Sparkles className="w-5 h-5 text-[#0033A0]" />
              <span>PRE-WAR 1950s VAULT-TEC!</span>
            </div>
            <button
              onClick={closePreWarAlert}
              className="p-1 hover:bg-[#0033A0] hover:text-[#FFD100] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs mt-2 leading-relaxed font-sans font-medium">
            Секретный протокол активирован 5 быстрыми кликами! Добро пожаловать в золотой век технологий корпорации Vault-Tec до Великой Войны.
          </p>
          <div className="mt-3 flex justify-end">
            <button
              onClick={closePreWarAlert}
              className="px-3 py-1 bg-[#0033A0] text-white text-xs font-bold uppercase hover:bg-black transition-colors"
            >
              ПОНЯТНО
            </button>
          </div>
        </div>
      )}

      {/* Основной контент страницы */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <Outlet />
      </main>

      {/* Пасхалка Konami Code с Волт-Боем */}
      <VaultBoyEasterEgg />

      {/* Подвал */}
      <Footer />
    </div>
  );
};
