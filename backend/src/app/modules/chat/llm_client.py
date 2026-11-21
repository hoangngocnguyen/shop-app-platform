import logging
from typing import Any

import httpx
from fastapi import status

from src.app.core.config import settings
from src.app.core.exceptions import AppException
from src.app.modules.chat.schema import ChatHistoryItem

logger = logging.getLogger(__name__)

GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

_shared_http_client: httpx.AsyncClient | None = None


def _get_shared_http_client(timeout_seconds: float) -> httpx.AsyncClient:
    """Tái sử dụng connection pool HTTPS thay vì mở lại TCP/TLS handshake mỗi request."""
    global _shared_http_client
    if _shared_http_client is None or _shared_http_client.is_closed:
        _shared_http_client = httpx.AsyncClient(
            timeout=timeout_seconds,
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50),
        )
    return _shared_http_client


async def close_shared_http_client() -> None:
    """Đóng connection pool dùng chung khi ứng dụng tắt."""
    global _shared_http_client
    if _shared_http_client is not None and not _shared_http_client.is_closed:
        await _shared_http_client.aclose()
    _shared_http_client = None


class GeminiClient:
    """
    Client giao tiếp với Google Gemini REST API (bên thứ 3).
    Hỗ trợ cả sinh câu trả lời (generate_reply) và tạo vector ngữ nghĩa (embed_text).
    """

    def __init__(
        self,
        api_key: str | None = None,
        model: str | None = None,
        embedding_model: str | None = None,
        timeout_seconds: float | None = None,
    ) -> None:
        self.api_key = (api_key if api_key is not None else settings.GEMINI_API_KEY).strip()
        self.model = (
            (model if model is not None else settings.GEMINI_MODEL).strip()
            or "gemini-3.5-flash-lite"
        )
        self.embedding_model = (
            (embedding_model if embedding_model is not None else settings.GEMINI_EMBEDDING_MODEL).strip()
            or "gemini-embedding-001"
        )
        self.timeout_seconds = (
            timeout_seconds if timeout_seconds is not None else settings.GEMINI_TIMEOUT_SECONDS
        )

    @staticmethod
    def _build_contents(
        message: str,
        history: list[ChatHistoryItem],
    ) -> list[dict[str, Any]]:
        """Chuyển đổi lịch sử chat sang định dạng contents của Gemini API."""
        contents: list[dict[str, Any]] = []
        for item in history:
            gemini_role = "model" if item.role == "assistant" else "user"
            contents.append(
                {
                    "role": gemini_role,
                    "parts": [{"text": item.content}],
                }
            )
        contents.append(
            {
                "role": "user",
                "parts": [{"text": message}],
            }
        )
        return contents

    @staticmethod
    def _extract_reply_text(payload: dict[str, Any]) -> str:
        """Trích xuất văn bản phản hồi từ JSON của Gemini API."""
        candidates = payload.get("candidates") or []
        if not candidates:
            raise AppException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                message="Trợ lý AI không thể tạo phản hồi cho yêu cầu này.",
                error_code="LLM_EMPTY_RESPONSE",
            )

        parts = candidates[0].get("content", {}).get("parts") or []
        text_chunks = [part.get("text", "") for part in parts if part.get("text")]
        reply = "\n".join(text_chunks).strip()
        if not reply:
            raise AppException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                message="Phản hồi từ trợ lý AI bị rỗng.",
                error_code="LLM_EMPTY_RESPONSE",
            )
        return reply

    async def _post_gemini(self, url: str, request_body: dict[str, Any]) -> dict[str, Any]:
        """Hàm dùng chung gửi POST request sang Google Gemini và chuẩn hóa mọi lỗi HTTP."""
        if not self.api_key:
            raise AppException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                message="Dịch vụ AI Chatbot chưa được cấu hình GEMINI_API_KEY.",
                error_code="LLM_NOT_CONFIGURED",
            )

        try:
            client = _get_shared_http_client(self.timeout_seconds)
            response = await client.post(
                url,
                headers={
                    "Content-Type": "application/json",
                    "x-goog-api-key": self.api_key,
                },
                json=request_body,
                timeout=self.timeout_seconds,
            )
        except httpx.TimeoutException as exc:
            logger.warning("Gemini API timeout after %ss", self.timeout_seconds)
            raise AppException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                message="Trợ lý AI phản hồi quá thời gian. Vui lòng thử lại sau.",
                error_code="LLM_TIMEOUT",
            ) from exc
        except httpx.HTTPError as exc:
            logger.error("Gemini API connection error: %s", exc)
            raise AppException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                message="Không thể kết nối đến dịch vụ AI bên thứ 3.",
                error_code="LLM_CONNECTION_ERROR",
            ) from exc

        if response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
            raise AppException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                message="Trợ lý AI đang quá tải yêu cầu. Vui lòng thử lại sau ít phút.",
                error_code="LLM_RATE_LIMITED",
            )

        if response.status_code == status.HTTP_503_SERVICE_UNAVAILABLE:
            raise AppException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                message="Mô hình AI đang quá tải tạm thời. Vui lòng thử lại sau giây lát.",
                error_code="LLM_UNAVAILABLE",
            )

        if response.status_code >= 400:
            upstream_msg = ""
            try:
                upstream_msg = response.json().get("error", {}).get("message", "")
            except ValueError:
                upstream_msg = response.text[:300]

            logger.error(
                "Gemini API returned HTTP %s: %s",
                response.status_code,
                upstream_msg,
            )
            detail_msg = (
                f"Dịch vụ AI bên thứ 3 báo lỗi ({response.status_code}): {upstream_msg}"
                if settings.DEBUG and upstream_msg
                else "Dịch vụ AI bên thứ 3 gặp sự cố khi xử lý yêu cầu."
            )
            raise AppException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                message=detail_msg,
                error_code="LLM_UPSTREAM_ERROR",
            )

        return response.json()

    async def generate_reply(
        self,
        *,
        system_prompt: str,
        message: str,
        history: list[ChatHistoryItem],
    ) -> str:
        """Gửi prompt và hội thoại sang Gemini API để sinh câu trả lời."""
        url = f"{GEMINI_API_BASE_URL}/models/{self.model}:generateContent"
        request_body = {
            "system_instruction": {
                "parts": [{"text": system_prompt}],
            },
            "contents": self._build_contents(message=message, history=history),
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1024,
            },
        }
        payload = await self._post_gemini(url, request_body)
        return self._extract_reply_text(payload)

    async def embed_text(
        self,
        text: str,
        *,
        task_type: str = "RETRIEVAL_DOCUMENT",
    ) -> list[float]:
        """Chuyển đổi đoạn văn bản thành vector số thực qua Gemini Embedding API."""
        url = f"{GEMINI_API_BASE_URL}/models/{self.embedding_model}:embedContent"
        request_body = {
            "model": f"models/{self.embedding_model}",
            "content": {"parts": [{"text": text}]},
            "taskType": task_type,
        }
        payload = await self._post_gemini(url, request_body)
        values = payload.get("embedding", {}).get("values") or []
        if not values:
            raise AppException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                message="Không nhận được dữ liệu vector embedding từ dịch vụ AI.",
                error_code="LLM_EMPTY_EMBEDDING",
            )
        return [float(v) for v in values]
