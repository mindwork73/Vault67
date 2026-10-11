import asyncio
import logging

from aiogram import Bot, Dispatcher, F, Router
from aiogram.client.default import DefaultBotProperties
from aiogram.filters import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.types import InlineKeyboardMarkup, Message
from aiogram.utils.keyboard import InlineKeyboardBuilder

from .api_client import ApiError, api
from .config import get_bot_settings
from .translate import translate_description

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("vault67.bot")
s = get_bot_settings()

router = Router()


class Add(StatesGroup):
    category = State()
    franchise = State()
    title_ru = State()
    title_original = State()
    description = State()
    description_confirm = State()
    price = State()
    weight = State()
    sizes = State()
    photos = State()
    confirm = State()


def is_admin(user_id: int) -> bool:
    return user_id in s.admin_ids


def parse_number(text: str) -> float | None:
    try:
        return float(text.replace(" ", "").replace(",", ".").replace("₽", ""))
    except (ValueError, AttributeError):
        return None


def main_menu() -> InlineKeyboardMarkup:
    kb = InlineKeyboardBuilder()
    kb.button(text="➕ Добавить товар", callback_data="add")
    kb.button(text="🆔 Мой Telegram ID", callback_data="myid")
    kb.adjust(1)
    return kb.as_markup()


def skip_kb(callback: str, label: str = "⏭ Пропустить") -> InlineKeyboardMarkup:
    kb = InlineKeyboardBuilder()
    kb.button(text=label, callback_data=callback)
    return kb.as_markup()


def categories_kb(categories: list[dict]) -> InlineKeyboardMarkup:
    kb = InlineKeyboardBuilder()
    for cat in categories:
        kb.button(text=cat["name"], callback_data=f"cat:{cat['id']}")
    kb.adjust(2)
    return kb.as_markup()


def franchises_kb(franchises: list[dict]) -> InlineKeyboardMarkup:
    kb = InlineKeyboardBuilder()
    theme_icon = {"anime": "🎌", "games": "🎮", "films": "🎬", "comics": "💥", "other": "📦"}
    for fr in franchises:
        kb.button(text=f"{theme_icon.get(fr['theme'], '📦')} {fr['name']}", callback_data=f"fr:{fr['id']}")
    kb.button(text="➕ Новая франшиза", callback_data="fr:new")
    kb.button(text="⏭ Без франшизы", callback_data="fr:0")
    kb.adjust(2)
    return kb.as_markup()


@router.message(CommandStart())
async def cmd_start(message: Message, state: FSMContext):
    await state.clear()
    if not is_admin(message.from_user.id):
        await message.answer("🔒 Доступ только для Смотрителя Убежища.")
        return
    await message.answer(
        "⚙️ <b>Терминал Vault-Tec · Поставки</b>\n\n"
        "Помогу добавить товар из Goofish: цена в юанях, китайское описание, вес, размеры и фото.\n"
        "Описание переведу и приведу в порядок, цены и рекламу уберу автоматически.",
        reply_markup=main_menu(),
    )


@router.callback_query(F.data == "myid")
async def my_id(cb, state: FSMContext):
    if not is_admin(cb.from_user.id):
        await cb.answer("Нет доступа", show_alert=True)
        return
    await cb.message.answer(f"Ваш Telegram ID: <code>{cb.from_user.id}</code>")
    await cb.answer()


@router.callback_query(F.data == "add")
async def start_add(cb, state: FSMContext):
    if not is_admin(cb.from_user.id):
        await cb.answer("Нет доступа", show_alert=True)
        return
    try:
        categories = api.categories()
    except ApiError as exc:
        await cb.message.answer(f"⚠️ API недоступен: {exc}")
        await cb.answer()
        return
    await state.set_state(Add.category)
    await cb.message.answer("1️⃣ Выбери <b>тип товара</b>:", reply_markup=categories_kb(categories))
    await cb.answer()


@router.callback_query(Add.category, F.data.startswith("cat:"))
async def choose_category(cb, state: FSMContext):
    cat_id = int(cb.data.split(":")[1])
    categories = api.categories()
    cat = next((c for c in categories if c["id"] == cat_id), None)
    if not cat:
        await cb.answer("Раздел не найден", show_alert=True)
        return
    await state.update_data(category_id=cat["id"], category_name=cat["name"],
                            has_sizes=cat["has_sizes"], sizes=[])
    await state.set_state(Add.franchise)
    await cb.message.edit_text(
        f"Тип: <b>{cat['name']}</b>\n\n2️⃣ Выбери <b>франшизу</b>:",
        reply_markup=franchises_kb(api.franchises()),
    )
    await cb.answer()


@router.callback_query(Add.franchise, F.data == "fr:new")
async def new_franchise(cb, state: FSMContext):
    await state.update_data(_awaiting_franchise=True, franchise_id=None, franchise_name=None)
    await cb.message.answer("Отправь название новой франшизы (например <i>One Piece</i>):")
    await cb.answer()


@router.message(Add.franchise, F.text)
async def franchise_text_fallback(message: Message, state: FSMContext):
    data = await state.get_data()
    if data.get("_awaiting_franchise"):
        created = api.create_franchise({"name": message.text.strip(), "theme": "other"})
        await state.update_data(franchise_id=created["id"], franchise_name=created["name"],
                                _awaiting_franchise=False)
        await state.set_state(Add.title_ru)
        await message.answer(f"Франшиза «{created['name']}» добавлена.\n\n3️⃣ Напиши <b>название товара на русском</b>:")


@router.callback_query(Add.franchise, F.data.startswith("fr:"))
async def choose_franchise(cb, state: FSMContext):
    fr_id = int(cb.data.split(":")[1])
    if fr_id == 0:
        await state.update_data(franchise_id=None, franchise_name=None)
    else:
        fr = next((f for f in api.franchises() if f["id"] == fr_id), None)
        await state.update_data(franchise_id=fr_id, franchise_name=fr["name"] if fr else None)
    await state.set_state(Add.title_ru)
    await cb.message.edit_text("3️⃣ Напиши <b>название товара на русском</b>:")
    await cb.answer()


@router.message(Add.title_ru, F.text)
async def set_title(message: Message, state: FSMContext):
    await state.update_data(title_ru=message.text.strip())
    await state.set_state(Add.title_original)
    await message.answer(
        "4️⃣ Оригинальное название (как на Goofish, любой язык).\n"
        "Можно пропустить.", reply_markup=skip_kb("skip:title_original"),
    )


@router.callback_query(Add.title_original, F.data == "skip:title_original")
async def skip_title(cb, state: FSMContext):
    await state.update_data(title_original=None)
    await state.set_state(Add.description)
    await cb.message.edit_text("5️⃣ Вставь <b>описание товара</b> (китайский текст). Переведу и обработаю.")
    await cb.answer()


@router.message(Add.title_original, F.text)
async def set_title_original(message: Message, state: FSMContext):
    await state.update_data(title_original=message.text.strip())
    await state.set_state(Add.description)
    await message.answer("5️⃣ Вставь <b>описание товара</b> (китайский текст). Переведу и обработаю.")


@router.message(Add.description, F.text)
async def set_description(message: Message, state: FSMContext):
    await state.update_data(description_raw=message.text.strip())
    await message.answer("⏳ Обрабатываю описание…")
    translated, ok = await asyncio.to_thread(translate_description, message.text)
    await state.update_data(description_ru=translated)
    await state.set_state(Add.description_confirm)
    kb = InlineKeyboardBuilder()
    kb.button(text="✅ Готово", callback_data="desc:ok")
    kb.button(text="✏️ Ввести вручную", callback_data="desc:manual")
    kb.adjust(2)
    header = "📝 <b>Описание после обработки:</b>\n\n" if ok else "📝 <b>Автоперевод недоступен, черновой текст:</b>\n\n"
    await message.answer(header + translated, reply_markup=kb.as_markup())


@router.callback_query(Add.description_confirm, F.data == "desc:ok")
async def desc_ok(cb, state: FSMContext):
    await state.set_state(Add.price)
    await cb.message.edit_text("6️⃣ Укажи <b>цену в юанях</b> (только число, например 68.5):")
    await cb.answer()


@router.callback_query(Add.description_confirm, F.data == "desc:manual")
async def desc_manual(cb, state: FSMContext):
    await cb.message.edit_text("✏️ Отправь готовое описание на русском:")
    await cb.answer()


@router.message(Add.description_confirm, F.text)
async def desc_manual_text(message: Message, state: FSMContext):
    await state.update_data(description_ru=message.text.strip())
    await state.set_state(Add.price)
    await message.answer("6️⃣ Укажи <b>цену в юанях</b> (только число):")


@router.message(Add.price, F.text)
async def set_price(message: Message, state: FSMContext):
    price = parse_number(message.text)
    if price is None or price <= 0:
        await message.answer("⚠️ Нужно положительное число. Введи цену в юанях:")
        return
    await state.update_data(price_cny=price)
    await state.set_state(Add.weight)
    await message.answer("7️⃣ Укажи <b>вес в граммах</b> (число, например 350):")


@router.message(Add.weight, F.text)
async def set_weight(message: Message, state: FSMContext):
    weight = parse_number(message.text)
    if weight is None or weight <= 0:
        await message.answer("⚠️ Нужно число граммов. Введи вес:")
        return
    weight = int(weight)
    data = await state.get_data()
    await state.update_data(weight_g=weight)
    try:
        preview = api.price_preview(data["price_cny"], weight)
        text = (
            f"💰 <b>Предпросмотр цены</b>\n"
            f"Курс ЦБ USD: {preview['usd_rate']:.2f} ₽\n"
            f"Закупка (себестоимость): <b>{preview['cost_rub']:.0f} ₽</b>\n"
            f"Доставка в цене: {preview['delivery_fee_rub']:.0f} ₽\n"
            f"Цена на сайте: <b>{preview['price_rub']:.0f} ₽</b>"
        )
    except ApiError as exc:
        text = f"⚠️ Не удалось посчитать цену: {exc}"
    if data.get("has_sizes"):
        await state.set_state(Add.sizes)
        await message.answer(text + "\n\n8️⃣ Введи <b>размеры</b> через запятую (S, M, L, XL) "
                                     "или пропусти.", reply_markup=skip_kb("skip:sizes"))
    else:
        await state.set_state(Add.photos)
        await message.answer(text + "\n\n8️⃣ Отправь <b>фото</b> товара (можно несколько). Когда закончишь — нажми «Готово».",
                             reply_markup=skip_kb("photos:done", "✅ Готово"))


@router.callback_query(Add.sizes, F.data == "skip:sizes")
async def skip_sizes(cb, state: FSMContext):
    await state.update_data(sizes=[])
    await state.set_state(Add.photos)
    await cb.message.edit_text("8️⃣ Отправь <b>фото</b> товара. Когда закончишь — «Готово».",
                               reply_markup=skip_kb("photos:done", "✅ Готово"))
    await cb.answer()


@router.message(Add.sizes, F.text)
async def set_sizes(message: Message, state: FSMContext):
    sizes = [x.strip() for x in message.text.replace(";", ",").split(",") if x.strip()]
    await state.update_data(sizes=sizes)
    await state.set_state(Add.photos)
    await message.answer(f"Размеры: {', '.join(sizes)}\n\n8️⃣ Отправь <b>фото</b> товара. Когда закончишь — «Готово».",
                         reply_markup=skip_kb("photos:done", "✅ Готово"))


@router.message(Add.photos, F.photo)
async def add_photo(message: Message, state: FSMContext):
    data = await state.get_data()
    photos = data.get("photos", [])
    file = await message.bot.get_file(message.photo[-1].file_id)
    buf = await message.bot.download_file(file.file_path)
    raw = buf.getvalue() if hasattr(buf, "getvalue") else (buf.read() if hasattr(buf, "read") else bytes(buf))
    try:
        uploaded = api.upload(f"photo_{len(photos)+1}.jpg", raw, "image/jpeg")
    except ApiError as exc:
        await message.answer(f"⚠️ Не удалось загрузить фото: {exc}")
        return
    photos.append(uploaded["path"])
    await state.update_data(photos=photos)
    await message.answer(f"📷 Загружено фото: {len(photos)}. Ещё или «Готово»?",
                         reply_markup=skip_kb("photos:done", "✅ Готово"))


@router.callback_query(Add.photos, F.data == "photos:done")
async def photos_done(cb, state: FSMContext):
    data = await state.get_data()
    photos = data.get("photos", [])
    if not photos:
        await cb.answer("Добавь хотя бы одно фото", show_alert=True)
        return
    await state.set_state(Add.confirm)
    sizes = data.get("sizes") or []
    text = (
        "🧾 <b>Проверь карточку:</b>\n\n"
        f"Тип: {data.get('category_name')}\n"
        f"Франшиза: {data.get('franchise_name') or '—'}\n"
        f"Название: {data.get('title_ru')}\n"
        f"Оригинал: {data.get('title_original') or '—'}\n"
        f"Цена CNY: {data.get('price_cny')}\n"
        f"Вес: {data.get('weight_g')} г\n"
        f"Размеры: {', '.join(sizes) if sizes else '—'}\n"
        f"Фото: {len(photos)}\n\n"
        f"<i>Описание:</i>\n{(data.get('description_ru') or '')[:500]}"
    )
    kb = InlineKeyboardBuilder()
    kb.button(text="🚀 Опубликовать", callback_data="finish:PUBLISHED")
    kb.button(text="💾 Сохранить черновик", callback_data="finish:DRAFT")
    kb.button(text="❌ Отмена", callback_data="finish:CANCEL")
    kb.adjust(1)
    await cb.message.answer(text, reply_markup=kb.as_markup())
    await cb.answer()


@router.callback_query(Add.confirm, F.data.startswith("finish:"))
async def finish(cb, state: FSMContext):
    action = cb.data.split(":")[1]
    if action == "CANCEL":
        await state.clear()
        await cb.message.edit_text("❌ Отменено.")
        await cb.answer()
        return
    data = await state.get_data()
    sizes = data.get("sizes") or []
    payload = {
        "title_ru": data["title_ru"],
        "title_original": data.get("title_original"),
        "description_ru": data.get("description_ru"),
        "category_id": data.get("category_id"),
        "franchise_id": data.get("franchise_id"),
        "price_cny": data.get("price_cny"),
        "weight_g": data.get("weight_g"),
        "stock": max(1, len(sizes) or 1),
        "status": action,
        "images": data.get("photos", []),
        "variants": [{"size": sz, "stock": 1} for sz in sizes],
        "stats": [],
    }
    try:
        product = api.create_product(payload)
    except ApiError as exc:
        await cb.message.answer(f"⚠️ Ошибка создания: {exc}")
        await cb.answer()
        return
    await state.clear()
    label = "опубликован 🚀" if action == "PUBLISHED" else "сохранён как черновик 💾"
    await cb.message.edit_text(
        f"✅ Товар «{product['title_ru']}» {label}.\n"
        f"Цена на сайте: <b>{product['price_rub']:.0f} ₽</b>\n"
        f"slug: <code>{product['slug']}</code>"
    )
    await cb.answer()


async def main():
    bot = Bot(token=s.telegram_bot_token, default=DefaultBotProperties(parse_mode="HTML"))
    dp = Dispatcher(storage=MemoryStorage())
    dp.include_router(router)
    log.info("Vault67 bot starting (admins=%s)", s.admin_ids)
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
