from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user_optional, require_admin
from ..schemas import SettingsOut, SettingsUpdate
from ..settings_service import get_settings_dict, update_settings

router = APIRouter(prefix="/settings", tags=["settings"])


@router.get("", response_model=SettingsOut)
def read_settings(db: Session = Depends(get_db), user=Depends(get_current_user_optional)):
    data = get_settings_dict(db)
    is_admin = user is not None and user.role == "overseer"
    return SettingsOut(store=data["store"], pricing=data["pricing"] if is_admin else {})


@router.patch("", response_model=SettingsOut, dependencies=[Depends(require_admin)])
def patch_settings(data: SettingsUpdate, db: Session = Depends(get_db)):
    patch = data.model_dump(exclude_unset=True, exclude_none=True)
    return SettingsOut(**update_settings(db, patch))
