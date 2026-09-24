FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim

WORKDIR /app

# Bật tối ưu bytecode cho Python
ENV UV_COMPILE_BYTECODE=1
ENV PYTHONUNBUFFERED=1

# Sao chép file cấu hình dependency
COPY pyproject.toml uv.lock ./

# Cài đặt toàn bộ dependencies vào môi trường ảo
RUN uv sync --frozen --no-install-project

# Sao chép mã nguồn, alembic migration và scripts
COPY src ./src
COPY alembic ./alembic
COPY alembic.ini ./
COPY scripts ./scripts
COPY README.md ./

# Đồng bộ dự án
RUN uv sync --frozen

# Mở cổng API
EXPOSE 8000

# Lệnh khởi chạy FastAPI với Uvicorn
CMD ["uv", "run", "uvicorn", "src.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
