import threading
import time
from collections import defaultdict, deque

from fastapi import Request, status

from src.app.core.exceptions import AppException


class InMemoryRateLimiter:
    """
    Bộ giới hạn tần suất (Sliding Window) nhẹ theo IP trong bộ nhớ.
    Dùng để bảo vệ endpoint AI Chatbot công khai khỏi spam làm cạn quota API bên thứ 3.
    """

    def __init__(self, max_requests: int = 15, window_seconds: int = 60) -> None:
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = threading.Lock()

    def check(self, key: str) -> None:
        now = time.monotonic()
        cutoff = now - self.window_seconds

        with self._lock:
            timestamps = self._hits[key]
            while timestamps and timestamps[0] <= cutoff:
                timestamps.popleft()

            if len(timestamps) >= self.max_requests:
                raise AppException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    message=(
                        f"Bạn gửi tin nhắn quá nhanh (tối đa {self.max_requests} "
                        f"lượt/{self.window_seconds} giây). Vui lòng đợi một lát rồi thử lại."
                    ),
                    error_code="CHAT_RATE_LIMITED",
                )

            timestamps.append(now)

    def reset(self) -> None:
        """Xóa toàn bộ bộ đếm (hữu ích khi chạy unit test)."""
        with self._lock:
            self._hits.clear()


chat_rate_limiter = InMemoryRateLimiter(max_requests=15, window_seconds=60)


def _extract_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def enforce_chat_rate_limit(request: Request) -> None:
    """FastAPI dependency kiểm tra rate limit cho endpoint chat."""
    client_ip = _extract_client_ip(request)
    chat_rate_limiter.check(client_ip)
