# Development Setup Guide

Tài liệu hướng dẫn thiết lập môi trường phát triển cho **Shop App Platform** từ source code.

---

## 1. Yêu cầu môi trường

Trước khi bắt đầu, cần cài đặt:

| Công cụ        | Phiên bản khuyến nghị |
| -------------- | --------------------- |
| Git            | Latest                |
| Python         | 3.13+                 |
| uv             | Latest                |
| Docker Desktop | Latest                |
| Docker Compose | V2                    |
| Node.js        | LTS                   |
| pnpm           | Latest                |
| Flutter        | Stable                |

Kiểm tra phiên bản:

```bash
git --version
python --version
uv --version
docker --version
docker compose version
node --version
pnpm --version
flutter --version
```

---

## 2. Clone repository

Clone source code:

```bash
git clone <repository-url>
```

Di chuyển vào thư mục project:

```bash
cd shop-app-platform
```

Cấu trúc project:

```text
shop-app-platform/
├── backend/
├── frontend/
├── mobile/
├── docs/
├── docker-compose.yml
├── .gitignore
├── LICENSE
└── README.md
```

---

## 3. Khởi động PostgreSQL

PostgreSQL được chạy bằng Docker Compose.

Từ thư mục project root:

```bash
docker compose up -d db
```

Kiểm tra container:

```bash
docker compose ps
```

Service `db` phải ở trạng thái `running` hoặc `healthy`.

Xem log nếu cần:

```bash
docker compose logs db
```

---

## 4. Thiết lập Backend

Di chuyển vào thư mục backend:

```bash
cd backend
```

Cài đặt dependency:

```bash
uv sync
```

Lệnh `uv sync` sẽ tạo môi trường ảo `.venv` và cài đặt các dependency được khai báo trong `pyproject.toml`.

---

## 5. Cấu hình Environment Variables

Backend sử dụng file `.env` để cấu hình môi trường.

Không commit file `.env` lên Git.

### 5.1. Tạo `.env`

Từ thư mục `backend`:

**Linux / macOS**

```bash
cp .env.example .env
```

**Windows PowerShell**

```powershell
Copy-Item .env.example .env
```

Sau đó chỉnh sửa `.env` theo môi trường local.

Ví dụ:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/shop_app_platform

SECRET_KEY=change-me

ACCESS_TOKEN_EXPIRE_MINUTES=30

REFRESH_TOKEN_EXPIRE_DAYS=7
```

Các giá trị trong `.env.example` chỉ là giá trị mẫu và có thể cần thay đổi tùy môi trường.

---

## 6. Database Migration

Đảm bảo PostgreSQL đang chạy, sau đó đứng trong thư mục `backend`:

```bash
uv run alembic upgrade head
```

Sau khi chạy thành công, database sẽ được cập nhật theo các migration hiện có.

Migration được lưu tại:

```text
backend/
└── alembic/
    └── versions/
```

---

## 7. Seed dữ liệu mẫu

Sau khi migration hoàn tất, chạy seed:

```bash
uv run python -m scripts.seed
```

Các seed script nằm tại:

```text
backend/
└── scripts/
    ├── seed.py
    ├── seed_users.py
    ├── seed_categories.py
    └── seed_products.py
```

`seed.py` là entry point để chạy toàn bộ seed.

Seed được chạy **sau migration** vì các bảng database phải tồn tại trước khi thêm dữ liệu.

---

## 8. Chạy Backend

Trong thư mục `backend`:

```bash
uv run uvicorn app.main:app --reload
```

Backend mặc định chạy tại:

```text
http://127.0.0.1:8000
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

---

## 9. Thiết lập Frontend

Mở terminal mới và từ thư mục project root:

```bash
cd frontend
```

Cài dependency:

```bash
pnpm install
```

Tạo file:

```text
.env.local
```

Ví dụ:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Chạy development server:

```bash
pnpm dev
```

Frontend mặc định chạy tại:

```text
http://localhost:3000
```

---

## 10. Thiết lập Mobile

Mobile sử dụng Flutter.

Từ thư mục project root:

```bash
cd mobile
```

Kiểm tra môi trường Flutter:

```bash
flutter doctor
```

Cài dependency:

```bash
flutter pub get
```

Chạy ứng dụng:

```bash
flutter run
```

Mobile có thể được phát triển độc lập, nhưng cần Backend đang chạy nếu ứng dụng sử dụng API của hệ thống.

---

## 11. Quy trình thiết lập sau khi clone

Đây là quy trình tối thiểu để chạy Backend + Database sau khi clone project lần đầu.

### 11.1. Clone project

```bash
git clone <repository-url>
cd shop-app-platform
```

### 11.2. Khởi động database

```bash
docker compose up -d db
```

### 11.3. Thiết lập backend

```bash
cd backend
uv sync
```

Tạo `.env`:

```powershell
Copy-Item .env.example .env
```

### 11.4. Migration

```bash
uv run alembic upgrade head
```

### 11.5. Seed

```bash
uv run python -m scripts.seed
```

### 11.6. Chạy backend

```bash
uv run uvicorn app.main:app --reload
```

Sau đó mở terminal mới để chạy frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

---

## 12. Cập nhật source code

Khi có thay đổi từ repository:

```bash
git pull
```

Nếu backend có dependency mới:

```bash
cd backend
uv sync
```

Nếu có migration mới:

```bash
uv run alembic upgrade head
```

Nếu cần cập nhật dữ liệu mẫu:

```bash
uv run python -m scripts.seed
```

Sau đó chạy lại backend nếu cần:

```bash
uv run uvicorn app.main:app --reload
```

---

## 13. Tạo migration mới

Khi thay đổi SQLAlchemy Model, tạo migration mới thay vì chỉnh sửa trực tiếp database.

Ví dụ:

```python
stock: Mapped[int]
```

Tạo migration:

```bash
uv run alembic revision --autogenerate -m "add product stock"
```

Kiểm tra file migration được tạo trong:

```text
backend/alembic/versions/
```

Review migration trước khi áp dụng:

```bash
uv run alembic upgrade head
```

Migration phải được commit vào Git để các thành viên khác có thể cập nhật database của họ.

---

## 14. Dừng môi trường

Dừng PostgreSQL:

```bash
docker compose stop db
```

Dừng và xóa các container:

```bash
docker compose down
```

Không sử dụng:

```bash
docker compose down -v
```

trừ khi muốn xóa Docker volumes và tạo lại database từ đầu.

> `docker compose down -v` chỉ nên sử dụng trên môi trường development khi cần reset database.

---

## 15. Xử lý lỗi thường gặp

### PostgreSQL chưa chạy

Kiểm tra:

```bash
docker compose ps
```

Khởi động:

```bash
docker compose up -d db
```

Xem log:

```bash
docker compose logs db
```

### Migration không kết nối được database

Kiểm tra:

1. PostgreSQL đang chạy.
2. `DATABASE_URL` trong `.env` chính xác.
3. Port PostgreSQL chính xác.
4. Database đã được tạo.

Sau đó thử:

```bash
uv run alembic upgrade head
```

### Dependency Python bị thiếu

```bash
uv sync
```

### Frontend dependency bị thiếu

```bash
pnpm install
```

### Database cần tạo lại từ đầu

**Chỉ thực hiện trên môi trường development.**

```bash
docker compose down -v
docker compose up -d db
```

Sau đó:

```bash
cd backend
uv run alembic upgrade head
uv run python -m scripts.seed
```

Không sử dụng `docker compose down -v` trên database production.

---

## 16. Các lệnh thường dùng

### Backend

```bash
uv sync
```

```bash
uv run uvicorn app.main:app --reload
```

### Migration

```bash
uv run alembic upgrade head
```

```bash
uv run alembic revision --autogenerate -m "description"
```

### Seed

```bash
uv run python -m scripts.seed
```

### Docker

```bash
docker compose up -d
```

```bash
docker compose up -d db
```

```bash
docker compose ps
```

```bash
docker compose logs db
```

```bash
docker compose down
```

### Frontend

```bash
pnpm install
```

```bash
pnpm dev
```

### Mobile

```bash
flutter pub get
```

```bash
flutter run
```

---

## 17. Quick Start

Nếu môi trường đã được cài đặt và đây là lần đầu clone project:

```bash
git clone <repository-url>
cd shop-app-platform

docker compose up -d db

cd backend
uv sync
```

Tạo `.env`:

```powershell
Copy-Item .env.example .env
```

Migration:

```bash
uv run alembic upgrade head
```

Seed:

```bash
uv run python -m scripts.seed
```

Chạy backend:

```bash
uv run uvicorn app.main:app --reload
```

Mở terminal mới để chạy frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

Backend:

```text
http://127.0.0.1:8000
```

API Docs:

```text
http://127.0.0.1:8000/docs
```

Frontend:

```text
http://localhost:3000
```
