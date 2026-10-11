import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import get_settings
from .database import Base, SessionLocal, engine
from .routers import auth, catalog, geo, orders, products, settings as settings_router, uploads
from .seed import run_seed

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
log = logging.getLogger("vault67")
config = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        run_seed(db)
    Path(config.upload_dir).mkdir(parents=True, exist_ok=True)
    log.info("Vault67 API ready (uploads=%s)", config.upload_dir)
    yield


app = FastAPI(title="Vault67 API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        config.public_base_url,
        "https://www.vault67.ru",
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in (auth.router, catalog.router, products.router, orders.router, uploads.router, geo.router, settings_router.router):
    app.include_router(router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "vault67-api"}


Path(config.upload_dir).mkdir(parents=True, exist_ok=True)
app.mount(config.upload_url_prefix, StaticFiles(directory=config.upload_dir, check_dir=False), name="uploads")
