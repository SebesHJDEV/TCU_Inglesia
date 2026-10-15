from pathlib import Path
import psycopg

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


from backend.app.usuarios import registrar_usuario
from backend.app.Test import list_test_records

app = FastAPI()

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"

app.mount(
    "/static",
    StaticFiles(directory=FRONTEND_DIR / "static"),
    name="static",
)

templates = Jinja2Templates(
    directory=FRONTEND_DIR / "templates"
)

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="Registro.html",
        context={},
    )

@app.get("/api/prueba")
def obtener_registros():
    return list_test_records()


@app.get("/login", response_class=HTMLResponse)
def login_page(request: Request):
    return templates.TemplateResponse(request=request, name="Login.html", context={})


@app.get("/registro", response_class=HTMLResponse)
def registration_page(request: Request):
    return RedirectResponse(url="/", status_code=307)


def admin_page(request: Request, template: str, active_page: str):
    return templates.TemplateResponse(
        request=request, name=template, context={"active_page": active_page}
    )


# Maquetas navegables. La autenticación y los permisos se incorporan después.
@app.get("/admin", response_class=HTMLResponse)
def admin_home(request: Request):
    return admin_page(request, "Index.html", "inicio")


@app.get("/admin/personas", response_class=HTMLResponse)
def people_page(request: Request):
    return admin_page(request, "Personas.html", "personas")


@app.get("/admin/personas/nueva", response_class=HTMLResponse)
def new_person_page(request: Request):
    return admin_page(request, "PersonaNueva.html", "personas")


@app.get("/admin/personas/ficha", response_class=HTMLResponse)
def person_preview_page(request: Request):
    return admin_page(request, "PersonaFicha.html", "personas")


@app.get("/admin/reportes", response_class=HTMLResponse)
def reports_page(request: Request):
    return admin_page(request, "Reportes.html", "reportes")


@app.get("/admin/administradores", response_class=HTMLResponse)
def administrators_page(request: Request):
    return admin_page(request, "Administradores.html", "administradores")


@app.post("/api/registro")
def crear_cuenta(datos: dict):
    try:
        registrar_usuario(datos)

    except ValueError as error:
        return JSONResponse(
            status_code=422,
            content={"detail": str(error)},
        )

    except psycopg.errors.UniqueViolation:
        return JSONResponse(
            status_code=409,
            content={
                "detail": "La cédula o el correo ya están registrados."
            },
        )

    except psycopg.errors.InvalidParameterValue:
        return JSONResponse(
            status_code=422,
            content={"detail": "Revisa los datos enviados."},
        )

    except psycopg.Error:
        return JSONResponse(
            status_code=503,
            content={
                "detail": "No se pudo completar el registro. Inténtalo más tarde."
            },
        )

    return JSONResponse(
        status_code=201,
        content={"status": "created"},
    )
