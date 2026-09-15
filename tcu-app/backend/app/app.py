from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIR = PROJECT_ROOT / "frontend"

app = FastAPI(title="TCU Dashboard", version="0.1.0")

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR / "static"),
    name="static",
)

templates = Jinja2Templates(directory=FRONTEND_DIR / "templates")


@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="Index.html",
        context={"page_title": "TCU"},
    )


@app.get("/health")
async def health():
    return {"status": "ok"}