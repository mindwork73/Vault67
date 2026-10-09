export interface WastelandAddressPreset {
  id: string;
  name: string;
  region: string;
  city: string;
  street: string;
  building: string;
  apartment?: string;
  postalCode: string;
  landmark: string;
  type: 'vault' | 'wasteland' | 'metro';
  badge: string;
  searchKeywords: string[];
}

export const WASTELAND_ADDRESS_PRESETS: WastelandAddressPreset[] = [
  // --- ЛОКАЦИИ УБЕЖИЩ & ROBCO ---
  {
    id: 'vault-67-central',
    name: 'Убежище 67 (Центральный бункер RobCo)',
    region: 'Сектор 67 (Зона Экспериментов)',
    city: 'Убежище 67',
    street: 'Жилой сектор B, Магистраль 3',
    building: 'Бункерный блок 12',
    apartment: 'Каюта 42 (Комната жителя)',
    postalCode: '67-VAULT-2077',
    landmark: 'Возле главного терминала Смотрителя и генератора',
    type: 'vault',
    badge: 'РОДНОЙ БУНКЕР',
    searchKeywords: ['убежище 67', 'бункер', 'vault 67', 'житель', 'дом', 'robco']
  },
  {
    id: 'red-rocket-67',
    name: 'Станция «Красная Ракета» №67',
    region: 'Транзитная зона Пустоши',
    city: 'Заправочный узел Конкорд-Юг',
    street: 'Шоссе 111, Развязка 4',
    building: 'Технический ангар Red Rocket',
    apartment: 'Служебный бокс 01',
    postalCode: 'RR-67-FUEL',
    landmark: 'Рядом с верстаком силовой брони и неоновой ракетой',
    type: 'vault',
    badge: 'БАЗА КАРАВАНОВ',
    searchKeywords: ['красная ракета', 'red rocket', 'заправка', 'ангар', 'караван']
  },
  {
    id: 'vault-101',
    name: 'Убежище 101 (Столичная Пустошь)',
    region: 'Столичная Пустошь (Вашингтон)',
    city: 'Убежище 101',
    street: 'Атриум, Уровень 3',
    building: 'Шлюзовой сектор А',
    apartment: 'Отсек 14',
    postalCode: 'CW-20005-V101',
    landmark: 'Гермодверь с гигантской шестерней №101',
    type: 'vault',
    badge: 'УБЕЖИЩЕ 101',
    searchKeywords: ['101', 'убежище 101', 'вашингтон', 'столичная', 'vault 101']
  },

  // --- ЛОКАЦИИ ПУСТОШИ МОХАВЕ & НОВЫЙ ВЕГАС ---
  {
    id: 'vegas-lucky38',
    name: 'Новый Вегас, Стрип (Казино «Лаки 38»)',
    region: 'Пустошь Мохаве (Невада)',
    city: 'Новый Вегас',
    street: 'Бульвар Стрип, Авеню Хауса',
    building: 'Казино Лаки 38, Башня А',
    apartment: 'Люкс 201 (Пентхаус Курьера)',
    postalCode: 'NV-89109-ROBCO',
    landmark: 'Главный вход со стороны Секьюритронов Мистера Хауса',
    type: 'wasteland',
    badge: 'МОХАВЕ ХИТ',
    searchKeywords: ['новый вегас', 'вегас', 'стрип', 'лаки 38', 'мохаве', 'курьер', 'new vegas']
  },
  {
    id: 'vegas-freeside',
    name: 'Фрисайд (Клуб «Атомный Ковбой»)',
    region: 'Пустошь Мохаве',
    city: 'Фрисайд (Свободный Сектор)',
    street: 'Улица Королей, Ворота 2',
    building: 'Казино Атомный Ковбой',
    apartment: 'Комната отдыха 3',
    postalCode: 'NV-89104-FREE',
    landmark: 'Напротив школы Королей и башни Мормонского форта',
    type: 'wasteland',
    badge: 'ФРИСАЙД',
    searchKeywords: ['фрисайд', 'короли', 'атомный ковбой', 'мохаве', 'freeside']
  },
  {
    id: 'goodsprings',
    name: 'Гудспрингс (Салун Старателя)',
    region: 'Южная Мохаве',
    city: 'Поселок Гудспрингс',
    street: 'Трасса 160, Родник',
    building: 'Салун Старателя (Prospector)',
    apartment: 'Жилой трейлер 01',
    postalCode: 'NV-89018-GOOD',
    landmark: 'У поилки для браминов за салуном Труди',
    type: 'wasteland',
    badge: 'ГУДСПРИНГС',
    searchKeywords: ['гудспрингс', 'старатель', 'труди', 'мохаве', 'goodsprings']
  },
  {
    id: 'novac',
    name: 'Новак (Мотель с Динозавром Динклом)',
    region: 'Пустошь Мохаве',
    city: 'Городок Новак',
    street: 'Шоссе 95, Свалка 2',
    building: 'Мотель Динозавра Динкл',
    apartment: 'Номер 01 (Первый этаж)',
    postalCode: 'NV-89020-DINO',
    landmark: 'Под пастью гигантского тираннозавра со снайпером',
    type: 'wasteland',
    badge: 'НОВАК',
    searchKeywords: ['новак', 'динозавр', 'динкл', 'снайпер', 'мохаве', 'novac']
  },

  // --- ЛОКАЦИИ СОДРУЖЕСТВА (БОСТОН) ---
  {
    id: 'diamond-city',
    name: 'Даймонд-Сити (Зеленый Алмаз Содружества)',
    region: 'Содружество (Бостон)',
    city: 'Даймонд-Сити',
    street: 'Трибуны Стадиона Фенуэй, Сектор 4',
    building: 'Дом на домашней базе (Home Plate)',
    apartment: 'Секция B',
    postalCode: 'MA-02115-FENWAY',
    landmark: 'У лавки Артуро и бара «Клевер» на рынке',
    type: 'wasteland',
    badge: 'СОДРУЖЕСТВО',
    searchKeywords: ['даймонд сити', 'бостон', 'содружество', 'алмаз', 'стадион', 'diamond city']
  },
  {
    id: 'goodneighbor',
    name: 'Добрососедство (Отель «Третий Рельс»)',
    region: 'Содружество (Центр Бостона)',
    city: 'Добрососедство (Goodneighbor)',
    street: 'Площадь Старого Капитолия',
    building: 'Отель «Третий Рельс» (Метро)',
    apartment: 'Комната Чарли 04',
    postalCode: 'MA-02111-NEIGHBOR',
    landmark: 'Возле офиса мэра Хэнкока в тупике аллеи',
    type: 'wasteland',
    badge: 'ХЭНКОК',
    searchKeywords: ['добрососедство', 'хэнкок', 'третий рельс', 'бостон', 'гуль', 'goodneighbor']
  },
  {
    id: 'sanctuary-hills',
    name: 'Сэнкчуари-Хиллз (Поселение Минитменов)',
    region: 'Содружество',
    city: 'Сэнкчуари-Хиллз',
    street: 'Главная кольцевая улица',
    building: 'Желтый дом Единственного Выжившего',
    apartment: 'Мастерская на верстаке',
    postalCode: 'MA-01742-SANCT',
    landmark: 'Сразу за деревянным мостом у старого дуба',
    type: 'wasteland',
    badge: 'СЭНКЧУАРИ',
    searchKeywords: ['сэнкчуари', 'минитмены', 'гарви', 'бостон', 'sanctuary']
  },

  // --- СТОЛИЧНАЯ ПУСТОШЬ (ВАШИНГТОН) ---
  {
    id: 'megaton',
    name: 'Мегатонна (Город вокруг Атомной Бомбы)',
    region: 'Столичная Пустошь',
    city: 'Город Мегатонна',
    street: 'Верхний жилой ярус, Секция 3',
    building: 'Дом Игрока над воротами',
    apartment: 'Двухэтажный блок Мойры',
    postalCode: 'CW-20001-BOMB',
    landmark: 'Прямо над кратером неразорвавшейся бомбы у лавки Мойры',
    type: 'wasteland',
    badge: 'МЕГАТОННА',
    searchKeywords: ['мегатонна', 'бомба', 'мойра', 'столичная', 'вашингтон', 'megaton']
  },
  {
    id: 'rivet-city',
    name: 'Ривет-Сити (Авианосец ВМС США)',
    region: 'Столичная Пустошь',
    city: 'Ривет-Сити',
    street: 'Палуба авианосца, Носовой рынок',
    building: 'Авианосец CVN, Трюм 2',
    apartment: 'Каюта Доктора Ли 108',
    postalCode: 'CW-20003-CARRIER',
    landmark: 'У поворотного подвесного трапа охраны корабля',
    type: 'wasteland',
    badge: 'АВИАНОСЕЦ',
    searchKeywords: ['ривет сити', 'авианосец', 'корабль', 'ли', 'rivet city']
  },

  // --- ГОРОДСКИЕ СДЭК/ПОЧТОВЫЕ ХАБЫ (РЕАЛ / СНГ) ---
  {
    id: 'moscow-center',
    name: 'Москва (Центральный Бункер Связи)',
    region: 'Московская область (ЦАО)',
    city: 'Москва',
    street: 'ул. Тверская',
    building: 'д. 7, Строение 1',
    apartment: 'Офис выдачи заказов 101',
    postalCode: '125009',
    landmark: 'Рядом со зданием Центрального телеграфа, шлюз во двор',
    type: 'metro',
    badge: 'МОСКВА ЦЕНТР',
    searchKeywords: ['москва', 'тверская', 'цао', 'центр', 'столица', 'moscow']
  },
  {
    id: 'spb-nevsky',
    name: 'Санкт-Петербург (Северный Аванпост Нева)',
    region: 'Ленинградская область',
    city: 'Санкт-Петербург',
    street: 'Невский проспект',
    building: 'д. 28, Литера А',
    apartment: 'Секция выдачи 4',
    postalCode: '191186',
    landmark: 'Дом компании Зингер, парадный вход с канала Грибоедова',
    type: 'metro',
    badge: 'СПБ НЕВСКИЙ',
    searchKeywords: ['питер', 'спб', 'петербург', 'невский', 'санкт-петербург', 'saint petersburg']
  },
  {
    id: 'novosibirsk-center',
    name: 'Новосибирск (Сибирский Бункер Академ)',
    region: 'Новосибирская область',
    city: 'Новосибирск',
    street: 'Красный проспект',
    building: 'д. 65',
    apartment: 'Бокс 12',
    postalCode: '630091',
    landmark: 'У входа в метро Красный Проспект, арка со стороны парка',
    type: 'metro',
    badge: 'НОВОСИБИРСК',
    searchKeywords: ['новосибирск', 'нск', 'сибирь', 'красный проспект']
  },
  {
    id: 'ekaterinburg-center',
    name: 'Екатеринбург (Уральский Арсенал)',
    region: 'Свердловская область',
    city: 'Екатеринбург',
    street: 'ул. Вайнера',
    building: 'д. 9, Корпус 2',
    apartment: 'Пункт выдачи 3',
    postalCode: '620014',
    landmark: 'Пешеходная зона Вайнера, цокольный терминальный этаж',
    type: 'metro',
    badge: 'ЕКАТЕРИНБУРГ',
    searchKeywords: ['екатеринбург', 'екб', 'урал', 'вайнера']
  },
  {
    id: 'kazan-center',
    name: 'Казань (Аванпост Волга)',
    region: 'Республика Татарстан',
    city: 'Казань',
    street: 'ул. Баумана',
    building: 'д. 58',
    apartment: 'Помещение 6',
    postalCode: '420111',
    landmark: 'У часов на Баумана, вход через кованую арку',
    type: 'metro',
    badge: 'КАЗАНЬ',
    searchKeywords: ['казань', 'татарстан', 'баумана']
  },
  {
    id: 'vladivostok-port',
    name: 'Владивосток (Тихоокеанский Бастион)',
    region: 'Приморский край',
    city: 'Владивосток',
    street: 'ул. Светланская',
    building: 'д. 45',
    apartment: 'Офис 18',
    postalCode: '690091',
    landmark: 'Рядом со штабом флота и набережной',
    type: 'metro',
    badge: 'ВЛАДИВОСТОК',
    searchKeywords: ['владивосток', 'приморье', 'дв', 'светланская']
  }
];

export function formatFullAddressString(addr: {
  region?: string;
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  postalCode?: string;
  landmark?: string;
}): string {
  const parts: string[] = [];
  if (addr.region) parts.push(addr.region);
  if (addr.city) parts.push(addr.city);
  if (addr.street) parts.push(addr.street);
  if (addr.building) parts.push(addr.building);
  if (addr.apartment) parts.push(addr.apartment);
  let res = parts.filter(Boolean).join(', ');
  if (addr.postalCode) res += ` [Индекс: ${addr.postalCode}]`;
  if (addr.landmark) res += ` • Ориентир: ${addr.landmark}`;
  return res || 'Адрес не заполнен';
}
