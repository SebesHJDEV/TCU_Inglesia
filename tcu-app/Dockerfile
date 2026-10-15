FROM python:3.11-slim-bookworm

# uv instala las versiones registradas en uv.lock.
COPY --from=ghcr.io/astral-sh/uv:0.13.1 /uv /usr/local/bin/uv

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_PYTHON_DOWNLOADS=never \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

# Esta capa se reutiliza mientras no cambien las dependencias.
COPY pyproject.toml uv.lock ./
RUN uv sync --locked --no-dev --no-cache

RUN groupadd --gid 10001 app \
    && useradd --uid 10001 --gid app --no-create-home app

COPY main.py ./
COPY backend/ ./backend/
COPY frontend/ ./frontend/

USER app
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
