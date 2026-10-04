"""
[REFACTOR & COMPATIBILITY]: Module dep.py của users.
Đã chuyển toàn bộ logic xác thực sang `src.app.core.deps` để dùng chung cho toàn bộ dự án.
File này re-export lại để tương thích ngược 100% với các import cũ.
"""

from src.app.core.deps import get_current_user, get_current_user_id

__all__ = ["get_current_user", "get_current_user_id"]
