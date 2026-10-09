/**
 * Сервис реального геокодирования и автозаполнения адресов для доставки (РФ, СНГ, Мир).
 * Включает:
 * 1. Мгновенную оффлайн-базу всех региональных центров и ключевых городов России с регионами и индексами (0 мс).
 * 2. Живое геокодирование через бесплатный Photon OpenStreetMap API (CORS-friendly, без API-ключей).
 * 3. Проверку и удаление тестовых/фейковых адресов Пустоши (Новый Вегас, Лаки 38 и т.д.).
 */

export interface RealCityInfo {
  name: string;        // Ульяновск
  fullName: string;    // г. Ульяновск
  region: string;      // Ульяновская область
  postalCode: string;  // 432000
  federalDistrict?: string; // Приволжский ФО
  popularStreets?: string[];
}

export interface RealAddressResult {
  id: string;
  displayLabel: string;
  region: string;
  city: string;
  street: string;
  building: string;
  postalCode: string;
  isRealLocation: boolean;
  typeBadge: string;
}

// База ключевых городов РФ с официальными индексами и регионами
export const REAL_RUSSIAN_CITIES: RealCityInfo[] = [
  {
    name: 'Ульяновск',
    fullName: 'г. Ульяновск',
    region: 'Ульяновская область',
    postalCode: '432000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['ул. Гончарова', 'ул. Ленина', 'ул. Минаева', 'ул. Рябикова', 'Московское шоссе', 'пр-т Ленинского Комсомола', 'ул. Карла Маркса', 'пр-т Нариманова']
  },
  {
    name: 'Димитровград',
    fullName: 'г. Димитровград',
    region: 'Ульяновская область',
    postalCode: '433500',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['ул. Ленина', 'ул. Гагарина', 'ул. Королева', 'пр-т Автостроителей']
  },
  {
    name: 'Москва',
    fullName: 'г. Москва',
    region: 'г. Москва',
    postalCode: '101000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['ул. Тверская', 'ул. Арбат', 'Ленинский проспект', 'Кутузовский проспект', 'ул. Профсоюзная', 'Варшавское шоссе']
  },
  {
    name: 'Санкт-Петербург',
    fullName: 'г. Санкт-Петербург',
    region: 'г. Санкт-Петербург',
    postalCode: '190000',
    federalDistrict: 'Северо-Западный ФО',
    popularStreets: ['Невский проспект', 'Лиговский проспект', 'Московский проспект', 'Большой проспект П.С.', 'Садовая улица']
  },
  {
    name: 'Казань',
    fullName: 'г. Казань',
    region: 'Республика Татарстан',
    postalCode: '420000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['ул. Баумана', 'пр-т Победы', 'ул. Кремлевская', 'ул. Чистопольская']
  },
  {
    name: 'Самара',
    fullName: 'г. Самара',
    region: 'Самарская область',
    postalCode: '443000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['ул. Куйбышева', 'Московское шоссе', 'ул. Ново-Садовая', 'ул. Победы']
  },
  {
    name: 'Тольятти',
    fullName: 'г. Тольятти',
    region: 'Самарская область',
    postalCode: '445000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['ул. Революционная', 'Южное шоссе', 'ул. Мира', 'ул. Победы']
  },
  {
    name: 'Нижний Новгород',
    fullName: 'г. Нижний Новгород',
    region: 'Нижегородская область',
    postalCode: '603000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['ул. Большая Покровская', 'пр-т Гагарина', 'пр-т Ленина', 'ул. Родионова']
  },
  {
    name: 'Екатеринбург',
    fullName: 'г. Екатеринбург',
    region: 'Свердловская область',
    postalCode: '620000',
    federalDistrict: 'Уральский ФО',
    popularStreets: ['пр-т Ленина', 'ул. Малышева', 'ул. Вайнера', 'ул. 8 Марта']
  },
  {
    name: 'Новосибирск',
    fullName: 'г. Новосибирск',
    region: 'Новосибирская область',
    postalCode: '630000',
    federalDistrict: 'Сибирский ФО',
    popularStreets: ['Красный проспект', 'ул. Ленина', 'пр-т Карла Маркса', 'ул. Богдана Хмельницкого']
  },
  {
    name: 'Челябинск',
    fullName: 'г. Челябинск',
    region: 'Челябинская область',
    postalCode: '454000',
    federalDistrict: 'Уральский ФО',
    popularStreets: ['пр-т Ленина', 'ул. Кирова', 'Свердловский проспект', 'Комсомольский проспект']
  },
  {
    name: 'Уфа',
    fullName: 'г. Уфа',
    region: 'Республика Башкортостан',
    postalCode: '450000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['пр-т Октября', 'ул. Ленина', 'ул. Первомайская', 'ул. Цюрупы']
  },
  {
    name: 'Ростов-на-Дону',
    fullName: 'г. Ростов-на-Дону',
    region: 'Ростовская область',
    postalCode: '344000',
    federalDistrict: 'Южный ФО',
    popularStreets: ['ул. Большая Садовая', 'пр-т Буденновский', 'пр-т Ворошиловский']
  },
  {
    name: 'Краснодар',
    fullName: 'г. Краснодар',
    region: 'Краснодарский край',
    postalCode: '350000',
    federalDistrict: 'Южный ФО',
    popularStreets: ['ул. Красная', 'ул. Северная', 'ул. Ставропольская', 'ул. Уральская']
  },
  {
    name: 'Воронеж',
    fullName: 'г. Воронеж',
    region: 'Воронежская область',
    postalCode: '394000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['пр-т Революции', 'Московский проспект', 'Ленинский проспект']
  },
  {
    name: 'Пермь',
    fullName: 'г. Пермь',
    region: 'Пермский край',
    postalCode: '614000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['ул. Ленина', 'Комсомольский проспект', 'ул. Мира', 'ул. Сибирская']
  },
  {
    name: 'Волгоград',
    fullName: 'г. Волгоград',
    region: 'Волгоградская область',
    postalCode: '400000',
    federalDistrict: 'Южный ФО',
    popularStreets: ['пр-т Ленина', 'ул. Мира', 'ул. Рабоче-Крестьянская']
  },
  {
    name: 'Саратов',
    fullName: 'г. Саратов',
    region: 'Саратовская область',
    postalCode: '410000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['пр-т Столыпина', 'ул. Московская', 'ул. Чапаева', 'ул. Чернышевского']
  },
  {
    name: 'Тюмень',
    fullName: 'г. Тюмень',
    region: 'Тюменская область',
    postalCode: '625000',
    federalDistrict: 'Уральский ФО',
    popularStreets: ['ул. Республики', 'ул. Ленина', 'ул. Мельникайте']
  },
  {
    name: 'Красноярск',
    fullName: 'г. Красноярск',
    region: 'Красноярский край',
    postalCode: '660000',
    federalDistrict: 'Сибирский ФО',
    popularStreets: ['пр-т Мира', 'ул. Ленина', 'пр-т им. газеты «Красноярский рабочий»']
  },
  {
    name: 'Омск',
    fullName: 'г. Омск',
    region: 'Омская область',
    postalCode: '644000',
    federalDistrict: 'Сибирский ФО',
    popularStreets: ['пр-т Маркса', 'ул. Ленина', 'ул. Красный Путь']
  },
  {
    name: 'Ижевск',
    fullName: 'г. Ижевск',
    region: 'Удмуртская Республика',
    postalCode: '426000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['ул. Пушкинская', 'ул. Удмуртская', 'ул. Ленина']
  },
  {
    name: 'Барнаул',
    fullName: 'г. Барнаул',
    region: 'Алтайский край',
    postalCode: '656000',
    federalDistrict: 'Сибирский ФО',
    popularStreets: ['пр-т Ленина', 'пр-т Красноармейский', 'Павловский тракт']
  },
  {
    name: 'Иркутск',
    fullName: 'г. Иркутск',
    region: 'Иркутская область',
    postalCode: '664000',
    federalDistrict: 'Сибирский ФО',
    popularStreets: ['ул. Ленина', 'ул. Карла Маркса', 'ул. Байкальская']
  },
  {
    name: 'Хабаровск',
    fullName: 'г. Хабаровск',
    region: 'Хабаровский край',
    postalCode: '680000',
    federalDistrict: 'Дальневосточный ФО',
    popularStreets: ['ул. Муравьева-Амурского', 'ул. Ленина', 'ул. Карла Маркса']
  },
  {
    name: 'Владивосток',
    fullName: 'г. Владивосток',
    region: 'Приморский край',
    postalCode: '690000',
    federalDistrict: 'Дальневосточный ФО',
    popularStreets: ['Светланская улица', 'Океанский проспект', 'пр-т 100-летия Владивостока']
  },
  {
    name: 'Ярославль',
    fullName: 'г. Ярославль',
    region: 'Ярославская область',
    postalCode: '150000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['Московский проспект', 'пр-т Ленина', 'ул. Свободы']
  },
  {
    name: 'Пенза',
    fullName: 'г. Пенза',
    region: 'Пензенская область',
    postalCode: '440000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['ул. Московская', 'пр-т Победы', 'пр-т Строителей']
  },
  {
    name: 'Чебоксары',
    fullName: 'г. Чебоксары',
    region: 'Чувашская Республика',
    postalCode: '428000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['пр-т Ленина', 'Московский проспект', 'пр-т Тракторостроителей']
  },
  {
    name: 'Саранск',
    fullName: 'г. Саранск',
    region: 'Республика Мордовия',
    postalCode: '430000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['пр-т Ленина', 'ул. Советская', 'ул. Полежаева']
  },
  {
    name: 'Сочи',
    fullName: 'г. Сочи',
    region: 'Краснодарский край',
    postalCode: '354000',
    federalDistrict: 'Южный ФО',
    popularStreets: ['Курортный проспект', 'ул. Горького', 'ул. Навагинская']
  },
  {
    name: 'Калининград',
    fullName: 'г. Калининград',
    region: 'Калининградская область',
    postalCode: '236000',
    federalDistrict: 'Северо-Западный ФО',
    popularStreets: ['Ленинский проспект', 'пр-т Мира', 'ул. Черняховского']
  },
  {
    name: 'Тула',
    fullName: 'г. Тула',
    region: 'Тульская область',
    postalCode: '300000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['пр-т Ленина', 'ул. Советская', 'Красноармейский проспект']
  },
  {
    name: 'Рязань',
    fullName: 'г. Рязань',
    region: 'Рязанская область',
    postalCode: '390000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['Первомайский проспект', 'ул. Соборная', 'ул. Ленина']
  },
  {
    name: 'Тверь',
    fullName: 'г. Тверь',
    region: 'Тверская область',
    postalCode: '170000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['ул. Советская', 'Тверской проспект', 'пр-т Чайковского']
  },
  {
    name: 'Владимир',
    fullName: 'г. Владимир',
    region: 'Владимирская область',
    postalCode: '600000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['ул. Большая Московская', 'пр-т Ленина', 'ул. Горького']
  },
  {
    name: 'Калуга',
    fullName: 'г. Калуга',
    region: 'Калужская область',
    postalCode: '248000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['ул. Кирова', 'ул. Ленина', 'ул. Московская']
  },
  {
    name: 'Белгород',
    fullName: 'г. Белгород',
    region: 'Белгородская область',
    postalCode: '308000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['пр-т Богдана Хмельницкого', 'пр-т Славы', 'ул. Попова']
  },
  {
    name: 'Курск',
    fullName: 'г. Курск',
    region: 'Курская область',
    postalCode: '305000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['ул. Ленина', 'ул. Радищева', 'пр-т Победы']
  },
  {
    name: 'Орел',
    fullName: 'г. Орел',
    region: 'Орловская область',
    postalCode: '302000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['ул. Ленина', 'ул. Комсомольская', 'Московское шоссе']
  },
  {
    name: 'Брянск',
    fullName: 'г. Брянск',
    region: 'Брянская область',
    postalCode: '241000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['пр-т Ленина', 'пр-т Московский', 'пр-т Станке Димитрова']
  },
  {
    name: 'Смоленск',
    fullName: 'г. Смоленск',
    region: 'Смоленская область',
    postalCode: '214000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['ул. Ленина', 'ул. Большая Советская', 'ул. Кирова']
  },
  {
    name: 'Липецк',
    fullName: 'г. Липецк',
    region: 'Липецкая область',
    postalCode: '398000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['ул. Советская', 'пр-т Победы', 'ул. Плеханова']
  },
  {
    name: 'Тамбов',
    fullName: 'г. Тамбов',
    region: 'Тамбовская область',
    postalCode: '392000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['ул. Советская', 'ул. Интернациональная', 'ул. Карла Маркса']
  },
  {
    name: 'Кострома',
    fullName: 'г. Кострома',
    region: 'Костромская область',
    postalCode: '156000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['ул. Советская', 'ул. Ленина', 'пр-т Мира']
  },
  {
    name: 'Иваново',
    fullName: 'г. Иваново',
    region: 'Ивановская область',
    postalCode: '153000',
    federalDistrict: 'Центральный ФО',
    popularStreets: ['пр-т Ленина', 'пр-т Шереметевский', 'пр-т Строителей']
  },
  {
    name: 'Вологда',
    fullName: 'г. Вологда',
    region: 'Вологодская область',
    postalCode: '160000',
    federalDistrict: 'Северо-Западный ФО',
    popularStreets: ['ул. Ленина', 'ул. Мира', 'ул. Герцена']
  },
  {
    name: 'Череповец',
    fullName: 'г. Череповец',
    region: 'Вологодская область',
    postalCode: '162600',
    federalDistrict: 'Северо-Западный ФО',
    popularStreets: ['пр-т Победы', 'пр-т Луначарского', 'ул. Ленина']
  },
  {
    name: 'Мурманск',
    fullName: 'г. Мурманск',
    region: 'Мурманская область',
    postalCode: '183000',
    federalDistrict: 'Северо-Западный ФО',
    popularStreets: ['пр-т Ленина', 'пр-т Кольский', 'ул. Челюскинцев']
  },
  {
    name: 'Архангельск',
    fullName: 'г. Архангельск',
    region: 'Архангельская область',
    postalCode: '163000',
    federalDistrict: 'Северо-Западный ФО',
    popularStreets: ['Троицкий проспект', 'ул. Воскресенская', 'наб. Северной Двины']
  },
  {
    name: 'Петрозаводск',
    fullName: 'г. Петрозаводск',
    region: 'Республика Карелия',
    postalCode: '185000',
    federalDistrict: 'Северо-Западный ФО',
    popularStreets: ['пр-т Ленина', 'пр-т Карла Маркса', 'ул. Кирова']
  },
  {
    name: 'Сыктывкар',
    fullName: 'г. Сыктывкар',
    region: 'Республика Коми',
    postalCode: '167000',
    federalDistrict: 'Северо-Западный ФО',
    popularStreets: ['ул. Коммунистическая', 'ул. Ленина', 'Октябрьский проспект']
  },
  {
    name: 'Киров',
    fullName: 'г. Киров',
    region: 'Кировская область',
    postalCode: '610000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['Октябрьский проспект', 'ул. Ленина', 'ул. Карла Маркса']
  },
  {
    name: 'Йошкар-Ола',
    fullName: 'г. Йошкар-Ола',
    region: 'Республика Марий Эл',
    postalCode: '424000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['Ленинский проспект', 'ул. Комсомольская', 'ул. Советская']
  },
  {
    name: 'Оренбург',
    fullName: 'г. Оренбург',
    region: 'Оренбургская область',
    postalCode: '460000',
    federalDistrict: 'Приволжский ФО',
    popularStreets: ['ул. Советская', 'пр-т Гагарина', 'пр-т Победы']
  },
  {
    name: 'Астрахань',
    fullName: 'г. Астрахань',
    region: 'Астраханская область',
    postalCode: '414000',
    federalDistrict: 'Южный ФО',
    popularStreets: ['ул. Советская', 'ул. Кирова', 'ул. Адмиралтейская']
  },
  {
    name: 'Ставрополь',
    fullName: 'г. Ставрополь',
    region: 'Ставропольский край',
    postalCode: '355000',
    federalDistrict: 'Северо-Кавказский ФО',
    popularStreets: ['пр-т Карла Маркса', 'ул. Ленина', 'ул. Дзержинского']
  },
  {
    name: 'Пятигорск',
    fullName: 'г. Пятигорск',
    region: 'Ставропольский край',
    postalCode: '357500',
    federalDistrict: 'Северо-Кавказский ФО',
    popularStreets: ['пр-т Кирова', 'пр-т 40 лет Октября', 'пр-т Калинина']
  },
  {
    name: 'Махачкала',
    fullName: 'г. Махачкала',
    region: 'Республика Дагестан',
    postalCode: '367000',
    federalDistrict: 'Северо-Кавказский ФО',
    popularStreets: ['пр-т Расула Гамзатова', 'пр-т Имама Шамиля', 'пр-т Али-Гаджи Акушинского']
  },
  {
    name: 'Грозный',
    fullName: 'г. Грозный',
    region: 'Чеченская Республика',
    postalCode: '364000',
    federalDistrict: 'Северо-Кавказский ФО',
    popularStreets: ['пр-т Путина', 'пр-т Кадырова', 'ул. Лорсанова']
  },
  {
    name: 'Владикавказ',
    fullName: 'г. Владикавказ',
    region: 'Республика Северная Осетия',
    postalCode: '362000',
    federalDistrict: 'Северо-Кавказский ФО',
    popularStreets: ['пр-т Мира', 'пр-т Коста', 'ул. Кирова']
  },
  {
    name: 'Нальчик',
    fullName: 'г. Нальчик',
    region: 'Кабардино-Балкарская Республика',
    postalCode: '360000',
    federalDistrict: 'Северо-Кавказский ФО',
    popularStreets: ['пр-т Ленина', 'ул. Ногмова', 'ул. Пушкина']
  },
  {
    name: 'Симферополь',
    fullName: 'г. Симферополь',
    region: 'Республика Крым',
    postalCode: '295000',
    federalDistrict: 'Южный ФО',
    popularStreets: ['пр-т Кирова', 'ул. Севастопольская', 'ул. Карла Маркса']
  },
  {
    name: 'Севастополь',
    fullName: 'г. Севастополь',
    region: 'г. Севастополь',
    postalCode: '299000',
    federalDistrict: 'Южный ФО',
    popularStreets: ['пр-т Нахимова', 'ул. Ленина', 'пр-т Генерала Острякова']
  },
  {
    name: 'Курган',
    fullName: 'г. Курган',
    region: 'Курганская область',
    postalCode: '640000',
    federalDistrict: 'Уральский ФО',
    popularStreets: ['ул. Ленина', 'ул. Гоголя', 'ул. Куйбышева']
  },
  {
    name: 'Сургут',
    fullName: 'г. Сургут',
    region: 'ХМАО - Югра',
    postalCode: '628400',
    federalDistrict: 'Уральский ФО',
    popularStreets: ['пр-т Ленина', 'пр-т Мира', 'ул. Университетская']
  },
  {
    name: 'Нижневартовск',
    fullName: 'г. Нижневартовск',
    region: 'ХМАО - Югра',
    postalCode: '628600',
    federalDistrict: 'Уральский ФО',
    popularStreets: ['ул. Ленина', 'ул. Чапаева', 'ул. Мира']
  },
  {
    name: 'Новый Уренгой',
    fullName: 'г. Новый Уренгой',
    region: 'ЯНАО',
    postalCode: '629300',
    federalDistrict: 'Уральский ФО',
    popularStreets: ['пр-т Ленинградский', 'ул. Сибирская', 'ул. 26 Съезда КПСС']
  },
  {
    name: 'Томск',
    fullName: 'г. Томск',
    region: 'Томская область',
    postalCode: '634000',
    federalDistrict: 'Сибирский ФО',
    popularStreets: ['пр-т Ленина', 'пр-т Фрунзе', 'пр-т Кирова']
  },
  {
    name: 'Кемерово',
    fullName: 'г. Кемерово',
    region: 'Кемеровская область',
    postalCode: '650000',
    federalDistrict: 'Сибирский ФО',
    popularStreets: ['пр-т Советский', 'пр-т Ленина', 'пр-т Шахтеров']
  },
  {
    name: 'Новокузнецк',
    fullName: 'г. Новокузнецк',
    region: 'Кемеровская область',
    postalCode: '654000',
    federalDistrict: 'Сибирский ФО',
    popularStreets: ['пр-т Металлургов', 'пр-т Бардина', 'пр-т Октябрьский']
  },
  {
    name: 'Абакан',
    fullName: 'г. Абакан',
    region: 'Республика Хакасия',
    postalCode: '655000',
    federalDistrict: 'Сибирский ФО',
    popularStreets: ['пр-т Ленина', 'ул. Щетинкина', 'ул. Пушкина']
  },
  {
    name: 'Кызыл',
    fullName: 'г. Кызыл',
    region: 'Республика Тыва',
    postalCode: '667000',
    federalDistrict: 'Сибирский ФО',
    popularStreets: ['ул. Ленина', 'ул. Кочетова', 'ул. Красных Партизан']
  },
  {
    name: 'Улан-Удэ',
    fullName: 'г. Улан-Удэ',
    region: 'Республика Бурятия',
    postalCode: '670000',
    federalDistrict: 'Дальневосточный ФО',
    popularStreets: ['ул. Ленина', 'пр-т 50-летия Октября', 'ул. Терешковой']
  },
  {
    name: 'Чита',
    fullName: 'г. Чита',
    region: 'Забайкальский край',
    postalCode: '672000',
    federalDistrict: 'Дальневосточный ФО',
    popularStreets: ['ул. Ленина', 'ул. Бутина', 'ул. Богомягкова']
  },
  {
    name: 'Благовещенск',
    fullName: 'г. Благовещенск',
    region: 'Амурская область',
    postalCode: '675000',
    federalDistrict: 'Дальневосточный ФО',
    popularStreets: ['ул. Ленина', 'ул. Амурская', 'ул. 50 лет Октября']
  },
  {
    name: 'Якутск',
    fullName: 'г. Якутск',
    region: 'Республика Саха (Якутия)',
    postalCode: '677000',
    federalDistrict: 'Дальневосточный ФО',
    popularStreets: ['пр-т Ленина', 'ул. Дзержинского', 'ул. Ярославского']
  },
  {
    name: 'Магадан',
    fullName: 'г. Магадан',
    region: 'Магаданская область',
    postalCode: '685000',
    federalDistrict: 'Дальневосточный ФО',
    popularStreets: ['пр-т Ленина', 'ул. Портовая', 'ул. Гагарина']
  },
  {
    name: 'Южно-Сахалинск',
    fullName: 'г. Южно-Сахалинск',
    region: 'Сахалинская область',
    postalCode: '693000',
    federalDistrict: 'Дальневосточный ФО',
    popularStreets: ['ул. Ленина', 'пр-т Мира', 'Коммунистический проспект']
  },
  {
    name: 'Петропавловск-Камчатский',
    fullName: 'г. Петропавловск-Камчатский',
    region: 'Камчатский край',
    postalCode: '683000',
    federalDistrict: 'Дальневосточный ФО',
    popularStreets: ['ул. Ленинская', 'пр-т 50 лет Октября', 'Космический проезд']
  },
  {
    name: 'Минск',
    fullName: 'г. Минск',
    region: 'Минская область, Беларусь',
    postalCode: '220000',
    popularStreets: ['пр-т Независимости', 'пр-т Победителей', 'ул. Немига']
  },
  {
    name: 'Алматы',
    fullName: 'г. Алматы',
    region: 'Алматинская область, Казахстан',
    postalCode: '050000',
    popularStreets: ['пр-т Абая', 'пр-т Достык', 'пр-т Аль-Фараби']
  },
  {
    name: 'Астана',
    fullName: 'г. Астана',
    region: 'г. Астана, Казахстан',
    postalCode: '010000',
    popularStreets: ['пр-т Мангилик Ел', 'пр-т Республики', 'пр-т Туран']
  }
];

/**
 * Проверяет, содержит ли переданный адрес тестовые/фейковые значения Пустоши (Новый Вегас, Лаки 38 и т.п.)
 */
export function isWastelandMockAddress(addr: {
  region?: string;
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  postalCode?: string;
  landmark?: string;
}): boolean {
  const combined = `${addr.region || ''} ${addr.city || ''} ${addr.street || ''} ${addr.building || ''} ${addr.apartment || ''} ${addr.postalCode || ''} ${addr.landmark || ''}`.toLowerCase();
  
  return (
    combined.includes('новый вегас') ||
    combined.includes('вегас') ||
    combined.includes('мохаве') ||
    combined.includes('столичная пустошь') ||
    combined.includes('даймонд-сити') ||
    combined.includes('мегатонна') ||
    combined.includes('ривет-сити') ||
    combined.includes('лаки 38') ||
    combined.includes('лаки-38') ||
    combined.includes('авеню хауса') ||
    combined.includes('мистера хауса') ||
    combined.includes('пентхаус') ||
    combined.includes('люкс 201') ||
    combined.includes('стрип') ||
    combined.includes('убежище 67') ||
    combined.includes('убежище 101') ||
    combined.includes('nv-89109') ||
    combined.includes('robco zip') ||
    combined.includes('vault')
  );
}

/**
 * Поиск по локальной базе городов РФ и СНГ (мгновенный отклик 0 мс)
 */
export function searchLocalCities(query: string): RealCityInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return REAL_RUSSIAN_CITIES.filter(city => 
    city.name.toLowerCase().includes(q) ||
    city.region.toLowerCase().includes(q) ||
    city.postalCode.startsWith(q)
  ).slice(0, 8);
}

/**
 * Поиск улиц в конкретном городе по локальной базе
 */
export function searchLocalStreetsInCity(cityName: string, streetQuery: string): string[] {
  const cName = cityName.trim().toLowerCase();
  const sQ = streetQuery.trim().toLowerCase();

  const city = REAL_RUSSIAN_CITIES.find(c => 
    c.name.toLowerCase() === cName || 
    c.fullName.toLowerCase() === cName ||
    cName.includes(c.name.toLowerCase())
  );

  if (!city || !city.popularStreets) return [];
  if (!sQ) return city.popularStreets.slice(0, 6);

  return city.popularStreets
    .filter(street => street.toLowerCase().includes(sQ))
    .slice(0, 6);
}

/**
 * Запрос к свободному международному OpenStreetMap Geocoding API (Photon)
 * Возвращает реальные географические локации, включая улицы, дома и индексы.
 */
export async function queryPhotonGeocoder(query: string): Promise<RealAddressResult[]> {
  const cleanQ = query.trim();
  if (!cleanQ || cleanQ.length < 2) return [];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5 сек таймаут

    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(cleanQ)}&limit=6&lang=default`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) return [];

    const data = await response.json();
    if (!data.features || !Array.isArray(data.features)) return [];

    const results: RealAddressResult[] = [];

    for (const f of data.features) {
      const p = f.properties;
      if (!p) continue;

      const cityName = p.city || p.town || p.village || (p.type === 'city' ? p.name : '');
      const stateName = p.state || p.county || '';
      const streetName = p.street || (p.osm_value === 'street' ? p.name : '');
      const houseNumber = p.housenumber || '';
      const postcode = p.postcode || '';

      // Формируем читабельную метку
      const parts: string[] = [];
      if (cityName) parts.push(`г. ${cityName}`);
      if (streetName) parts.push(streetName);
      if (houseNumber) parts.push(`д. ${houseNumber}`);
      if (stateName && stateName !== cityName) parts.push(stateName);
      if (postcode) parts.push(`[${postcode}]`);

      const label = parts.length > 0 ? parts.join(', ') : (p.name || 'Точка на карте');

      results.push({
        id: `photon-${p.osm_id || Math.random()}`,
        displayLabel: label,
        region: stateName || (cityName ? `${cityName} и прилегающие районы` : ''),
        city: cityName ? `г. ${cityName}` : (p.name || ''),
        street: streetName,
        building: houseNumber ? `д. ${houseNumber}` : '',
        postalCode: postcode,
        isRealLocation: true,
        typeBadge: houseNumber ? 'ДОМ / ЗДАНИЕ' : (streetName ? 'УЛИЦА' : 'ГОРОД / РЕГИОН')
      });
    }

    return results;
  } catch (err) {
    // В случае оффлайна или сетевой ошибки тихо возвращаем пустой список
    return [];
  }
}

/**
 * Комплексный умный поиск адреса: объединяет локальную мгновенную базу + онлайн геокодер
 */
export async function searchRealAddress(query: string, currentCity?: string): Promise<RealAddressResult[]> {
  const cleanQ = query.trim();
  if (!cleanQ) return [];

  const combinedResults: RealAddressResult[] = [];
  const seenIds = new Set<string>();

  // 1. Сначала ищем по локальной базе городов РФ (мгновенно)
  const localCities = searchLocalCities(cleanQ);
  for (const c of localCities) {
    const id = `local-city-${c.name.toLowerCase()}`;
    if (!seenIds.has(id)) {
      seenIds.add(id);
      combinedResults.push({
        id,
        displayLabel: `${c.fullName}, ${c.region} [${c.postalCode}]`,
        region: c.region,
        city: c.fullName,
        street: '',
        building: '',
        postalCode: c.postalCode,
        isRealLocation: true,
        typeBadge: 'РЕАЛЬНЫЙ ГОРОД РФ'
      });
    }
  }

  // 1.1 Если передан текущий город, ищем по улицам этого города
  if (currentCity) {
    const localStreets = searchLocalStreetsInCity(currentCity, cleanQ);
    const cityInfo = REAL_RUSSIAN_CITIES.find(c => 
      c.name.toLowerCase() === currentCity.trim().toLowerCase() ||
      c.fullName.toLowerCase() === currentCity.trim().toLowerCase() ||
      currentCity.toLowerCase().includes(c.name.toLowerCase())
    );

    for (const street of localStreets) {
      const id = `local-street-${street.toLowerCase()}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        combinedResults.push({
          id,
          displayLabel: `${cityInfo?.fullName || currentCity}, ${street} [${cityInfo?.postalCode || ''}]`,
          region: cityInfo?.region || '',
          city: cityInfo?.fullName || currentCity,
          street: street,
          building: '',
          postalCode: cityInfo?.postalCode || '',
          isRealLocation: true,
          typeBadge: 'УЛИЦА ГОРОДА'
        });
      }
    }
  }

  // 2. Если запрос длиннее 2 символов, параллельно запрашиваем живой геокодер Photon OSM
  if (cleanQ.length >= 2) {
    const fullSearchQuery = currentCity && !cleanQ.toLowerCase().includes(currentCity.toLowerCase())
      ? `${currentCity} ${cleanQ}`
      : cleanQ;

    const photonResults = await queryPhotonGeocoder(fullSearchQuery);
    for (const res of photonResults) {
      if (!seenIds.has(res.displayLabel.toLowerCase())) {
        seenIds.add(res.displayLabel.toLowerCase());
        combinedResults.push(res);
      }
    }
  }

  return combinedResults.slice(0, 10);
}
