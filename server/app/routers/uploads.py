import io
import logging
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from PIL import Image

from ..config import get_settings
from ..deps import require_admin

router = APIRouter(prefix="/uploads", tags=["uploads"])
log = logging.getLogger("vault67.uploads")

ALLOWED = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}
MAX_BYTES = 15 * 1024 * 1024
MAX_SIDE = 2000


@router.post("", dependencies=[Depends(require_admin)])
async def upload_image(file: UploadFile = File(...)):
    s = get_settings()
    if file.content_type not in ALLOWED:
        raise HTTPException(400, "Только JPG/PNG/WebP/GIF")
    raw = await file.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(400, "Файл больше 15 МБ")
    try:
        img = Image.open(io.BytesIO(raw))
        img.verify()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(400, "Не удалось прочитать изображение") from exc

    ext = ALLOWED[file.content_type]
    subdir = datetime.now().strftime("products/%Y%m")
    dest_dir = Path(s.upload_dir) / subdir
    dest_dir.mkdir(parents=True, exist_ok=True)
    fname = f"{uuid.uuid4().hex}{ext}"
    dest = dest_dir / fname

    img = Image.open(io.BytesIO(raw))
    if max(img.size) > MAX_SIDE:
        img.thumbnail((MAX_SIDE, MAX_SIDE))
    if ext in (".jpg",) and img.mode in ("RGBA", "P"):
        img = img.convert("RGB")
    img.save(dest)

    rel = f"{subdir}/{fname}"
    return {"path": rel, "url": f"{s.upload_url_prefix}/{rel}"}
