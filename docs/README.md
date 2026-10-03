# 📚 TÀI LIỆU DỰ ÁN SHOP APP PLATFORM (DOCUMENTATION HUB)

> Hệ thống thương mại điện tử đa nền tảng với **FastAPI (Backend)** và **Next.js 15 (Frontend)**.

---

## 🗺️ Bản Đồ Điều Hướng Tài Liệu (Sitemap)

```text
docs/
├── backend/                              # 📌 TÀI LIỆU DÀNH CHO BACKEND
│   ├── instruction.md                   # Cheatsheet & các lệnh chạy nhanh (Docker, Alembic, Seed, UV)
│   ├── standards.md                     # Quy chuẩn phát triển Backend (FastAPI, Comment, Pagination, Exceptions)
│   ├── database.md                      # Thiết kế 13 bảng CSDL, Sơ đồ ERD & Quy chuẩn SQLAlchemy 2.0
│   └── logging.md                       # Hệ thống Logging tập trung, Request Tracking & Bắt lỗi 500
│
├── frontend/                             # 📌 TÀI LIỆU DÀNH CHO FRONTEND
│   ├── instruction.md                   # Cheatsheet & các lệnh khởi chạy Next.js (pnpm dev, build)
│   └── standards.md                     # Quy chuẩn phát triển Frontend (Feature-Driven, 4 UI States, Zod)
│
└── README.md                            # Bản đồ điều hướng tài liệu tổng quan (File này)
```

---

## 🚀 Lối Tắt Cho Developers Mới Tham Gia

* 🛠️ **Nếu bạn làm Backend**:
  1. Đọc [Hướng dẫn khởi chạy Backend](backend/instruction.md) để bật Docker DB, migrate và chạy server FastAPI.
  2. Đọc [Quy chuẩn phát triển Backend](backend/standards.md) để nắm rõ cách viết hàm, phân trang và validate DTOs.
  3. Tra cứu [Thiết kế Cơ sở dữ liệu 13 bảng](backend/database.md) khi cần làm việc với Model ORM.
  4. Xem [Hệ thống Logging](backend/logging.md) khi cần log nghiệp vụ hoặc xử lý lỗi.

* 🎨 **Nếu bạn làm Frontend**:
  1. Đọc [Hướng dẫn khởi chạy Frontend](frontend/instruction.md) để cài đặt `pnpm` và bật server Next.js.
  2. Đọc [Quy chuẩn phát triển Frontend](frontend/standards.md) để tuân thủ mô hình Feature-Driven, quản lý 4 trạng thái UI và Form Validation.
