import re
import unicodedata


def slugify_vietnamese(text: str) -> str:
    """
    [TIỆN ÍCH CHUẨN HÓA]: Chuyển đổi chuỗi tiếng Việt có dấu thành Slug thân thiện SEO.
    Ví dụ: 'Điện thoại thông minh' -> 'dien-thoai-thong-minh'
    # Bước 1: Chuyển về chữ thường và xóa khoảng trắng 2 đầu
    # Bước 2: Thay thế chữ đ/Đ thành d
    # Bước 3: Chuẩn hóa NFD và loại bỏ các dấu thanh tiếng Việt
    # Bước 4: Thay thế ký tự đặc biệt bằng dấu gạch ngang và loại bỏ trùng lặp
    """
    if not text:
        return ""

    text = text.lower().strip()
    text = text.replace("đ", "d").replace("Đ", "d")
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text).strip("-")
    return text
