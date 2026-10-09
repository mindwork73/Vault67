import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useVaultStore } from '../store/useVaultStore';
import { soundManager } from '../utils/sound';
import { FileText, Disc, Terminal, Clock, ShieldCheck, ArrowRight } from 'lucide-react';

interface HolotapeLog {
  id: string;
  path: string;
  entryCode: string;
  date: string;
  author: string;
  title: string;
  content: string[];
}

const HOLOTAPES: HolotapeLog[] = [
  {
    id: 'delivery',
    path: '/delivery',
    entryCode: 'LOG_ENTRY_01 // CARAVAN_LOGISTICS',
    date: '2077-10-23 14:15:00',
    author: 'Главный Караванщик Убежища 67 (Маркус)',
    title: 'ПРАВИЛА И МАРШРУТЫ ДОСТАВКИ КАРАВАНАМИ МОХАВЕ И СТОЛИЧНОЙ ПУСТОШИ',
    content: [
      'Все посылки упаковываются в свинцовые контейнеры класса C-4, выдерживающие радиационный фон до 850 rad/hr и прямое попадание из плазменной винтовки.',
      'Торговые караваны отправляются из шлюза Убежища 67 дважды в сутки. Охрану каравана осуществляют наемники отряда "Красный Люгер" и перепрограммированные роботы-охранники Sentry Bot.',
      'Сроки доставки:',
      '• Сектор Столичной Пустоши и Мегатонна: 1-2 дня.',
      '• Стрип Нью-Вегаса, Фрисайд и Мохаве: 3-5 дней караванного пути.',
      '• Содружество и Бостон: 4-6 дней через винтокрылы Братства Стали.',
      'В случае нападения рейдеров или болотников, караванщики активируют тревожный маяк. Страховой фонд Убежища 67 возмещает 100% стоимости лута в крышках.'
    ]
  },
  {
    id: 'payment',
    path: '/payment',
    entryCode: 'LOG_ENTRY_02 // FISCAL_POLICY',
    date: '2077-10-22 08:30:12',
    author: 'Финансовый Комиссар Волт-Тек (Д-р Хэнкок)',
    title: 'ПЛАТЕЖНЫЕ СРЕДСТВА, КРЫШКИ NUKA-COLA И БАРТЕР В ОБРАЩЕНИИ',
    content: [
      'Официальной валютой торговой зоны Убежища 67 признаны металлические крышки от бутылок Nuka-Cola и Sunset Sarsaparilla.',
      'Подлинность крышек проверяется встроенным спектрометром терминала RobCo на наличие тиснения и радиоизотопных микрометок.',
      'Поддерживаемые каналы расчетов:',
      '1. КРЫШКИ ПУСТОШИ (CAPS): Прямое списание с персонального счета Pip-Boy или привязанной карты Пустоши.',
      '2. ДОВОЕННЫЕ ДЕНЬГИ (СБП / МИР): Банковские транзакции через систему быстрых платежей довоенных серверов.',
      '3. ПРЯМОЙ БАРТЕР: Оплата караванщику наличными крышками при передаче лутбокса.',
      'Курс обмена стабилен: 1 Крышка эквивалентна 10-12 довоенным бумажным рублям.'
    ]
  },
  {
    id: 'about',
    path: '/about',
    entryCode: 'LOG_ENTRY_03 // VAULT_DOSSIER',
    date: '2077-09-15 11:00:45',
    author: 'Смотритель Убежища 67 (Барстоу)',
    title: 'СЕКРЕТНЫЙ ПРОТОКОЛ УБЕЖИЩА 67: МИССИЯ СОХРАНЕНИЯ ГИК-КУЛЬТУРЫ',
    content: [
      'Убежище 67 было спроектировано корпорацией Vault-Tec не просто как противорадиационный бункер, а как герметичный архив поп-культуры, аниме, комиксов и мерча XX-XXI веков.',
      'Пока мир на поверхности выгорал в атомном огне, глубоко под землей автоматизированные 3D-принтеры RobCo и мастера-реставраторы бережно сохраняли артефакты Evangelion, Cyberpunk, Warhammer 40k и довоенные реликвии.',
      'Сегодня двери Убежища 67 открыты для всех достойных странников Пустоши. Мы снабжаем исследователей высококлассным снаряжением, одеждой и коллекционными предметами.',
      '«Будущее прекрасно вместе с технологиями Vault-Tec и RobCo Industries!»'
    ]
  }
];

export const HolotapesPage: React.FC = () => {
  const location = useLocation();
  const { theme } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  // Определяем активную голозапись на основе URL
  const activeHolotape = HOLOTAPES.find((h) => location.pathname === h.path) || HOLOTAPES[0];

  return (
    <div className="space-y-6 font-mono">
      {/* Заголовок считывателя голозаписей */}
      <div className={`border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isPreWar ? 'border-[#0033A0]' : 'border-[#15FF0E]'
      }`}>
        <div>
          <div className="text-xs uppercase tracking-widest opacity-80 mb-1 flex items-center gap-2">
            <span>[HOLOTAPE DECK: TAPE_DRIVE_01]</span>
            <span>|</span>
            <span>СЧИТЫВАНИЕ АРХИВОВ СМОТРИТЕЛЯ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider flex items-center gap-2">
            <Disc className="w-7 h-7 animate-spin" />
            <span>ГОЛОЗАПИСИ УБЕЖИЩА 67</span>
          </h1>
        </div>

        <div className="text-xs opacity-75">
          СТАТУС ЛЕНТЫ: СЧИТАНО БЕЗ ОШИБОК
        </div>
      </div>

      {/* Вкладки переключения голозаписей */}
      <div className="flex flex-wrap gap-2">
        {HOLOTAPES.map((h) => {
          const isActive = activeHolotape.id === h.id;
          return (
            <Link
              key={h.id}
              to={h.path}
              onClick={() => soundManager.playTab()}
              className={`px-4 py-2 border-2 text-xs font-bold uppercase transition-all flex items-center gap-2 ${
                isActive
                  ? isPreWar
                    ? 'bg-[#0033A0] text-white border-[#0033A0]'
                    : 'bg-[#15FF0E] text-[#0D1117] border-[#15FF0E]'
                  : isPreWar
                    ? 'border-[#0033A0]/40 text-[#0033A0] hover:border-[#0033A0]'
                    : 'border-[#15FF0E]/40 text-[#15FF0E] hover:border-[#15FF0E]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{h.id.toUpperCase()}</span>
            </Link>
          );
        })}
      </div>

      {/* Текстовый экран терминала со старым монохромным стилем */}
      <div className={`border-4 p-6 sm:p-8 space-y-6 relative transition-all ${
        isPreWar
          ? 'border-[#0033A0] bg-white text-[#1C2331] shadow-xl'
          : 'border-[#15FF0E] bg-black/90 text-[#15FF0E] shadow-[0_0_30px_rgba(21,255,14,0.2)]'
      }`}>
        {/* Декоративные углы */}
        <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-current" />
        <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-current" />
        <div className="absolute bottom-1 left-1 w-2.5 h-2.5 bg-current" />
        <div className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-current" />

        {/* Метаданные записи */}
        <div className="border-b pb-4 border-current/30 space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-amber-400 font-bold">
            <span>&gt; {activeHolotape.entryCode}</span>
            <span className="flex items-center gap-1 opacity-80">
              <Clock className="w-3.5 h-3.5" />
              {activeHolotape.date}
            </span>
          </div>

          <div className="text-sm sm:text-base font-black uppercase tracking-wider text-current">
            {activeHolotape.title}
          </div>

          <div className="text-[11px] opacity-75">
            АВТОР ЗАПИСИ: {activeHolotape.author}
          </div>
        </div>

        {/* Тело голозаписи */}
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed opacity-95">
          {activeHolotape.content.map((paragraph, idx) => (
            <p key={idx} className="font-mono">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Нижняя полоска с завершением записи */}
        <div className="border-t pt-4 border-current/30 flex items-center justify-between text-xs opacity-75">
          <span>[END OF HOLOTAPE ENTRY]</span>
          <span className="terminal-cursor text-current" />
        </div>
      </div>
    </div>
  );
};
