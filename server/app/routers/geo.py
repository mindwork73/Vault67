from fastapi import APIRouter, Query

from ..geocoder import geocode
from ..schemas import GeoResult

router = APIRouter(prefix="/geo", tags=["geo"])


@router.get("/search", response_model=list[GeoResult])
def search(q: str = Query(..., min_length=2), limit: int = Query(6, le=10)):
    return [GeoResult(**r) for r in geocode(q, limit)]
