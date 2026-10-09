import React from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useVaultStore } from '../../store/useVaultStore';
import { soundManager } from '../../utils/sound';
import { ChevronRight, ArrowLeft, Terminal, Home } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { products, theme, categories } = useVaultStore();
  const isPreWar = theme === 'pre-war';

  const pathname = location.pathname;

  // На главной странице хлебные крошки не требуются
  if (pathname === '/') {
    return null;
  }

  // Генерация элементов цепочки навигации
  const breadcrumbItems: Array<{ label: string; url?: string; isCurrent?: boolean }> = [
    { label: 'БАЗА УБЕЖИЩА', url: '/' }
  ];

  // 1. Каталог товаров
  if (pathname === '/catalog') {
    const catParam = searchParams.get('cat');
    const franchiseParam = searchParams.get('franchise');

    if (catParam) {
      const foundCategory = categories.find((c) => c.key === catParam);
      const catLabel = foundCategory ? `${foundCategory.name}` : `РАЗДЕЛ: ${catParam}`;
      breadcrumbItems.push({ label: 'ИНВЕНТАРЬ', url: '/catalog' });
      breadcrumbItems.push({ label: catLabel, isCurrent: true });
    } else if (franchiseParam) {
      breadcrumbItems.push({ label: 'ИНВЕНТАРЬ', url: '/catalog' });
      breadcrumbItems.push({ label: `ФРАНШИЗА: ${franchiseParam.toUpperCase()}`, isCurrent: true });
    } else {
      breadcrumbItems.push({ label: 'ИНВЕНТАРЬ СКЛАДА', isCurrent: true });
    }
  }

  // 2. Страница отдельного товара
  else if (pathname.startsWith('/product/')) {
    const productId = pathname.split('/')[2];
    const product = products.find((p) => p.id === productId);

    breadcrumbItems.push({ label: 'ИНВЕНТАРЬ', url: '/catalog' });

    if (product) {
      const foundCategory = categories.find((c) => c.key === product.category);
      if (foundCategory) {
        breadcrumbItems.push({
          label: foundCategory.name,
          url: `/catalog?cat=${product.category}`
        });
      }
      breadcrumbItems.push({ label: product.titleRu, isCurrent: true });
    } else {
      breadcrumbItems.push({ label: `ПРЕДМЕТ #${productId}`, isCurrent: true });
    }
  }

  // 3. Припасы и ящик лута
  else if (pathname === '/stash') {
    const tabParam = searchParams.get('tab');
    breadcrumbItems.push({ label: 'ПРИПАСЫ', url: '/stash' });
    if (tabParam === 'tracker') {
      breadcrumbItems.push({ label: 'ТРЕКИНГ КАРАВАНА', isCurrent: true });
    } else if (tabParam === 'history') {
      breadcrumbItems.push({ label: 'ИСТОРИЯ СДЕЛОК', isCurrent: true });
    } else {
      breadcrumbItems.push({ label: 'ЯЩИК ХРАНЕНИЯ', isCurrent: true });
    }
  }

  // 4. Оформление заказа
  else if (pathname === '/checkout') {
    breadcrumbItems.push({ label: 'ПРИПАСЫ', url: '/stash' });
    breadcrumbItems.push({ label: 'ОФОРМЛЕНИЕ БАРТЕРА', isCurrent: true });
  }

  // 5. Личный кабинет жителя
  else if (pathname === '/profile') {
    breadcrumbItems.push({ label: 'ЛИЧНЫЙ КАБИНЕТ ЖИТЕЛЯ', isCurrent: true });
  }

  // 6. Терминал Смотрителя (Админка)
  else if (pathname === '/admin') {
    breadcrumbItems.push({ label: 'ТЕРМИНАЛ СМОТРИТЕЛЯ // УПРАВЛЕНИЕ', isCurrent: true });
  }

  // 7. Поиск
  else if (pathname === '/search') {
    const query = searchParams.get('query');
    breadcrumbItems.push({ label: 'СИСТЕМА ПОИСКА ROBCO', url: '/search' });
    if (query) {
      breadcrumbItems.push({ label: `«${query}»`, isCurrent: true });
    }
  }

  // 8. Голозаписи и инфо-страницы
  else if (pathname === '/holotapes' || pathname === '/delivery' || pathname === '/payment' || pathname === '/about') {
    breadcrumbItems.push({ label: 'АРХИВ ГОЛОЗАПИСЕЙ', url: '/holotapes' });
    if (pathname === '/delivery') {
      breadcrumbItems.push({ label: 'ИНСТРУКЦИЯ КАРАВАНОВ', isCurrent: true });
    } else if (pathname === '/payment') {
      breadcrumbItems.push({ label: 'БАРТЕР И РАСЧЕТЫ', isCurrent: true });
    } else if (pathname === '/about') {
      breadcrumbItems.push({ label: 'ОБ УБЕЖИЩЕ 67', isCurrent: true });
    }
  }

  // 9. Авторизация
  else if (pathname === '/login') {
    breadcrumbItems.push({ label: 'АВТОРИЗАЦИЯ ЖИТЕЛЯ', isCurrent: true });
  } else if (pathname === '/register') {
    breadcrumbItems.push({ label: 'РЕГИСТРАЦИЯ ЖИТЕЛЯ', isCurrent: true });
  }

  // Прочие страницы
  else {
    const pathPart = pathname.replace('/', '').toUpperCase();
    breadcrumbItems.push({ label: pathPart, isCurrent: true });
  }

  return (
    <nav
      aria-label="Навигационная цепочка"
      className={`border-b transition-colors font-mono text-xs ${
        isPreWar
          ? 'bg-blue-50/80 border-[#0033A0]/30 text-[#0033A0]'
          : 'bg-[#06090e]/90 border-[#15FF0E]/25 text-[#15FF0E]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        {/* Цепочка крошек */}
        <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto py-0.5">
          <Terminal className="w-3.5 h-3.5 shrink-0 opacity-70" />
          <span className="text-[10px] opacity-60 hidden sm:inline mr-1">[PATH:]</span>

          {breadcrumbItems.map((item, index) => {
            const isLast = index === breadcrumbItems.length - 1;

            return (
              <React.Fragment key={index}>
                {index > 0 && (
                  <ChevronRight className="w-3 h-3 shrink-0 opacity-50" />
                )}

                {item.url && !isLast ? (
                  <Link
                    to={item.url}
                    onClick={() => soundManager.playClick()}
                    className="hover:underline font-bold tracking-tight uppercase truncate max-w-[150px] sm:max-w-[200px] hover:opacity-100 opacity-80 transition-opacity flex items-center gap-1"
                    title={item.label}
                  >
                    {index === 0 && <Home className="w-3 h-3 shrink-0" />}
                    <span>{item.label}</span>
                  </Link>
                ) : (
                  <span
                    className={`font-black tracking-tight uppercase truncate max-w-[160px] sm:max-w-[260px] md:max-w-[360px] ${
                      isPreWar ? 'text-[#0033A0]' : 'text-[#15FF0E]'
                    }`}
                    title={item.label}
                  >
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Кнопка быстрого возврата [ESC // НАЗАД] */}
        <button
          onClick={() => {
            soundManager.playClick();
            navigate(-1);
          }}
          className={`shrink-0 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 px-2 py-0.5 border border-current/40 hover:bg-current hover:text-black transition-colors ${
            isPreWar ? 'hover:text-white' : ''
          }`}
          title="Вернуться на предыдущий экран"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>НАЗАД [ESC]</span>
        </button>
      </div>
    </nav>
  );
};
