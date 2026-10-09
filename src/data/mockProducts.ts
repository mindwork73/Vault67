import { Product, Order } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'vault-pipboy-3000',
    title: 'Pip-Boy 3000 Mk IV Replica Edition',
    titleRu: 'Реплика Pip-Boy 3000 Mk IV (Рабочий экран)',
    category: 'AGILITY',
    franchise: 'Fallout',
    priceCaps: 1250,
    priceRub: 14990,
    weightWg: 3.5,
    conditionCnd: 100,
    stock: 7,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    description: 'Официальный наручный терминал персонального выживания с креплением на предплечье, подсветкой и встроенным датчиком радиации.',
    lore: 'Стандартный выпуск RobCo Industries для обитателей Убежищ серии 60+. Спас не один десяток жизней от диких гулей и перегрузки хламом.',
    rarity: 'LEGENDARY',
    stats: [
      { label: 'RAD RESIST', value: '+25' },
      { label: 'PERCEPTION', value: '+2' },
      { label: 'DISPLAY', value: 'CRT Phosphor Green' },
      { label: 'OS', value: 'RobCo v7.1.0' }
    ],
    featured: true
  },
  {
    id: 'eva-01-figure-rg',
    title: 'RG Evangelion Unit-01 Test Type Figure',
    titleRu: 'Коллекционная фигурка RG Евангелион Модель-01',
    category: 'STRENGTH',
    franchise: 'Anime / Evangelion',
    priceCaps: 890,
    priceRub: 9800,
    weightWg: 2.2,
    conditionCnd: 98,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    description: 'Высокодетализированная фигурка Евы-01 в масштабе с прогрессивным ножом, позитронной пушкой и аутентичной артикуляцией мышц.',
    lore: 'Биомеханический страж Пустоши Нового Токио. Встроенный режим "Берсерк" снижает потребление крышек при угрозе атаки Ангелов.',
    rarity: 'RARE',
    stats: [
      { label: 'DAMAGE POWER', value: '450 DPS' },
      { label: 'SYNC RATE', value: '89.4%' },
      { label: 'HEIGHT', value: '280 mm' },
      { label: 'BATTERY', value: '5 min limit' }
    ],
    featured: true
  },
  {
    id: 'nuka-cola-quantum-lamp',
    title: 'Nuka-Cola Quantum Glowing LED Holo-Lamp',
    titleRu: 'Светильник Nuka-Cola Quantum (Неоновое свечение)',
    category: 'PERCEPTION',
    franchise: 'Fallout',
    priceCaps: 420,
    priceRub: 4500,
    weightWg: 1.1,
    conditionCnd: 100,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80',
    description: 'Бутылочная реплика легендарной квантовой ядер-колы. Излучает приятный бирюзово-изотопный свет, безопасный для ДНК.',
    lore: 'Секретный ингредиент — стронций-90 с приятным фруктовым послевкусием. Светится даже при отключении главного генератора Убежища.',
    rarity: 'UNCOMMON',
    stats: [
      { label: 'RAD HAZARD', value: '0.001 mSv' },
      { label: 'LUMENS', value: '320 lm' },
      { label: 'AP RESTORE', value: '+100' },
      { label: 'FLAVOR', value: 'Strontium Splash' }
    ],
    featured: true
  },
  {
    id: 'cyberpunk-edgerunners-jacket',
    title: 'Cyberpunk Edgerunners David EMT Jacket',
    titleRu: 'Куртка Дэвида Мартинеса EMT с неоновым воротником',
    category: 'ENDURANCE',
    franchise: 'Cyberpunk',
    priceCaps: 1450,
    priceRub: 16500,
    weightWg: 2.8,
    conditionCnd: 95,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    description: 'Плотная тактическая ветровка скорой помощи Найт-Сити со светящимися салатовыми элементами и принтом Sandevistan.',
    lore: '«Оставайся на острие, чумба». Легендарная куртка, пережившая импланты милитари-грейда и разборки в Санто-Доминго.',
    rarity: 'LEGENDARY',
    stats: [
      { label: 'ARMOR CLASS', value: '+45' },
      { label: 'COOL RATING', value: '+10' },
      { label: 'SANDEVISTAN SYNC', value: '100%' },
      { label: 'THERMAL RESIST', value: '+30' }
    ],
    featured: true
  },
  {
    id: 'vault-boy-bobblehead-luck',
    title: 'Vault-Tec Bobblehead: LUCK Edition',
    titleRu: 'Пупс Волт-Бой: УДАЧА (Vault-Tec Bobblehead)',
    category: 'LUCK',
    franchise: 'Fallout',
    priceCaps: 350,
    priceRub: 3800,
    weightWg: 0.5,
    conditionCnd: 100,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
    description: 'Официальный пупс Vault-Tec с покачивающейся головой. Постоянно увеличивает шанс на критический лут в Пустоши.',
    lore: '«Ваша удача не случайна — это результат тщательного планирования корпорации Волт-Тек!»',
    rarity: 'UNCOMMON',
    stats: [
      { label: 'LUCK STAT', value: '+1 PERMANENT' },
      { label: 'CRIT CHANCE', value: '+5%' },
      { label: 'MATERIAL', value: 'High-Impact Resin' },
      { label: 'HEIGHT', value: '130 mm' }
    ],
    featured: true
  },
  {
    id: 'warhammer-space-marine-helmet',
    title: 'Warhammer 40k Ultramarine Helmet 1:1 Desk Prop',
    titleRu: 'Шлем Ультрамарина Warhammer 40K (Полноразмерный)',
    category: 'STRENGTH',
    franchise: 'Warhammer 40k',
    priceCaps: 2100,
    priceRub: 24000,
    weightWg: 4.8,
    conditionCnd: 100,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    description: 'Тяжелый шлем космодесантника с оптическими аугментациями, боевыми повреждениями и геральдикой Макрагга.',
    lore: 'Во имя Императора! Изготовлен из армированного керамита Пустоши. Выдерживает выстрел из лазгана в упор.',
    rarity: 'LEGENDARY',
    stats: [
      { label: 'ARMOR (DT)', value: '+60' },
      { label: 'FAITH IN EMPEROR', value: 'MAX' },
      { label: 'SCALE', value: '1:1 Life Size' },
      { label: 'WEIGHT', value: 'Heavy Duty' }
    ],
    featured: true
  },
  {
    id: 'cyber-samurai-artbook',
    title: 'Ghost in the Shell / Cyberpunk Archives Artbook',
    titleRu: 'Артбук-архив "Кибер-Пустошь 2077" в кожаном переплете',
    category: 'INTELLIGENCE',
    franchise: 'Cyberpunk',
    priceCaps: 550,
    priceRub: 5900,
    weightWg: 1.8,
    conditionCnd: 100,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    description: '360 страниц концепт-артов, чертежей киберимплантов, дизайна оружия и урбанистических панорам мегаполиса.',
    lore: 'Содержит засекреченные схемы микрочипов довоенной корпорации Арасака и заметки ведущих кибернетиков.',
    rarity: 'RARE',
    stats: [
      { label: 'PAGES', value: '360' },
      { label: 'INTELLIGENCE', value: '+3' },
      { label: 'BINDING', value: 'Hardcover Embossed' },
      { label: 'LANGUAGE', value: 'En / Ru' }
    ]
  },
  {
    id: 'vault-67-dweller-hoodie',
    title: 'Vault 67 Official Techwear Oversized Hoodie',
    titleRu: 'Худи Жителя Убежища 67 (Утепленный футер 480г)',
    category: 'ENDURANCE',
    franchise: 'Fallout',
    priceCaps: 680,
    priceRub: 7400,
    weightWg: 1.2,
    conditionCnd: 100,
    stock: 19,
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    description: 'Плотный синий футер с фирменным желтым номером "67" на спине и шевроном RobCo Industries на рукаве.',
    lore: 'Выдается каждому смотрителю и старшему инженеру реакторного отсека Убежища 67 для защиты от сквозняков в веншахтах.',
    rarity: 'UNCOMMON',
    stats: [
      { label: 'WARMTH', value: '+35%' },
      { label: 'COMFORT', value: 'MAX' },
      { label: 'FABRIC', value: '100% Organic Cotton' },
      { label: 'VAULT NO.', value: '67' }
    ]
  },
  {
    id: 'fallout-bottle-caps-set',
    title: 'Authentic Sunset Sarsaparilla & Nuka Caps (50 pcs)',
    titleRu: 'Набор Крышек Пустоши: Nuka & Sunset (50 шт. в мешочке)',
    category: 'CHARISMA',
    franchise: 'Fallout',
    priceCaps: 290,
    priceRub: 3100,
    weightWg: 0.6,
    conditionCnd: 90,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80'
    ],
    description: 'Настоящие штампованные металлические крышки с патиной Пустоши. В комплекте редкая крышка со звездой Сансет Саспариллы!',
    lore: 'Универсальная валюта пустошей Мохаве и Столичной Пустоши. Звездная крышка дает шанс выиграть легендарное сокровище.',
    rarity: 'COMMON',
    stats: [
      { label: 'QUANTITY', value: '50 CAPS' },
      { label: 'BARTER VALUE', value: '+15%' },
      { label: 'STAR CAPS', value: '1 Guaranteed' },
      { label: 'MATERIAL', value: 'Stamped Steel' }
    ]
  },
  {
    id: 'berserk-dragonslayer-sword-replica',
    title: 'Berserk Dragon Slayer Metal Letter Opener & Stand',
    titleRu: 'Мини-реплика меча "Убийца Драконов" (Гатс / Berserk)',
    category: 'STRENGTH',
    franchise: 'Anime / Evangelion',
    priceCaps: 490,
    priceRub: 5200,
    weightWg: 0.9,
    conditionCnd: 100,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1589241062272-c0a000072dfa?auto=format&fit=crop&w=800&q=80',
    description: 'Массивная стальная копия куска черного железа, превосходящая любые стандарты мечей. Комплектуется каменной подставкой.',
    lore: '«Это было слишком огромно, слишком толсто, слишком тяжело... Это было больше похоже на кусок сырого железа».',
    rarity: 'RARE',
    stats: [
      { label: 'WEIGHT FEEL', value: 'Heavy' },
      { label: 'STEEL GRADE', value: '440C' },
      { label: 'LENGTH', value: '310 mm' },
      { label: 'BADASS LEVEL', value: '999' }
    ]
  },
  {
    id: 'wasteland-mystery-lootbox',
    title: 'Vault 67 Classified Airdrop Mystery Box',
    titleRu: 'Секретный лутбокс Смотрителя "Wasteland Airdrop"',
    category: 'LUCK',
    franchise: 'Classic Geek',
    priceCaps: 999,
    priceRub: 10990,
    weightWg: 4.0,
    conditionCnd: 100,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80',
    description: 'Опечатанный ящик припасов. Гарантированно содержит: 1 предмет категории Legendary, 2 мерч-аксессуара, значки и стикеры RobCo.',
    lore: 'Сброшен винтокрылом Братства Стали над сектором 67. Никто не знает, что внутри, пока не сорвешь пломбу свинцового контейнера.',
    rarity: 'LEGENDARY',
    stats: [
      { label: 'GUARANTEED ITEMS', value: '5-7 pcs' },
      { label: 'MIN VALUE', value: '1500 CAPS' },
      { label: 'LUCK BOOST', value: '+10%' },
      { label: 'SEAL', value: 'Lead Vault Lock' }
    ],
    featured: true
  },
  {
    id: 'cyberpunk-mechanical-keyboard',
    title: 'RobCo Termlink Cyberpunk Mechanical Keyboard',
    titleRu: 'Механическая клавиатура RobCo Terminal Edition (Зеленая подсветка)',
    category: 'AGILITY',
    franchise: 'Cyberpunk',
    priceCaps: 1100,
    priceRub: 12900,
    weightWg: 1.4,
    conditionCnd: 100,
    stock: 11,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    description: 'Тяжелый алюминиевый корпус, громкие кликающие свитчи Green Amber, кейкапы с русско-английской раскладкой шрифтом VT323.',
    lore: 'Точно такие клавиатуры стояли на терминалах управления шахтами межконтинентальных ракет до Великой Войны 2077 года.',
    rarity: 'RARE',
    stats: [
      { label: 'SWITCHES', value: 'Clicky Jade 50g' },
      { label: 'KEYCAPS', value: 'PBT Double-Shot' },
      { label: 'LIGHTING', value: '525nm CRT Green' },
      { label: 'INTERFACE', value: 'USB-C / Wireless' }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-67-8821',
    date: '2077-10-23 09:42',
    recipientName: 'Рейнджер Сектора 4 (Алексей)',
    wastelandLocation: 'Новый Вегас, Стрип, Лаки 38, Секция 12',
    paymentMethod: 'CAPS_CARD',
    totalCaps: 2450,
    totalRub: 23990,
    status: 'CARAVAN_DISPATCHED',
    trackingNumber: 'CRVN-NV-99410',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_PRODUCTS[2], quantity: 2 }
    ]
  },
  {
    id: 'ORD-67-8819',
    date: '2077-10-22 17:15',
    recipientName: 'Смотритель Бункера Альфа (Елена)',
    wastelandLocation: 'Столичная Пустошь, Мегатонна, Верхний Ярус 4',
    paymentMethod: 'PREWAR_SBP',
    totalCaps: 890,
    totalRub: 9800,
    status: 'DELIVERED_TO_VAULT',
    trackingNumber: 'CRVN-DC-33019',
    items: [
      { product: INITIAL_PRODUCTS[1], quantity: 1 }
    ]
  },
  {
    id: 'ORD-67-8825',
    date: '2077-10-24 11:03',
    recipientName: 'Торговец Трэш (Михаил)',
    wastelandLocation: 'Содружество, Даймонд-Сити, Блекаут Маркет',
    paymentMethod: 'BARTER_CASH',
    totalCaps: 999,
    totalRub: 10990,
    status: 'PREPARATION',
    trackingNumber: 'CRVN-BOS-00124',
    items: [
      { product: INITIAL_PRODUCTS[10], quantity: 1 }
    ]
  }
];
