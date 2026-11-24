"""
Bộ kiểm thử cho module AI Chat Assistant (src/app/modules/chat).
Mock HTTP calls tới Google Gemini API để kiểm thử độc lập, không tốn quota và không cần mạng.
"""

import os
import sys
import uuid
from decimal import Decimal
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from src.app.core.config import settings
from src.app.core.database import Base, get_db
from src.app.core.deps import get_current_user
from src.app.main import app
from src.app.modules.categories.model import Category
from src.app.modules.chat.guardrails import SAFE_FALLBACK_REPLY, sanitize_chat_output
from src.app.modules.chat.llm_client import GeminiClient
from src.app.modules.chat.model import ProductEmbedding
from src.app.modules.chat.rate_limit import chat_rate_limiter
from src.app.modules.chat.router import get_chat_service
from src.app.modules.chat.service import MAX_HISTORY_TURNS, ChatService
from src.app.modules.chat.vector_store import search_similar_products
from src.app.modules.products.model import Product
from src.app.modules.roles.model import Role
from src.app.modules.users.model import User


@pytest.fixture(autouse=True)
def reset_overrides():
    # Override get_db mặc định bằng SQLite in-memory rỗng để mọi unit test hoàn toàn độc lập với Postgres thật
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSession()

    def _override_db():
        yield session

    app.dependency_overrides[get_db] = _override_db
    chat_rate_limiter.reset()
    yield
    app.dependency_overrides.clear()
    chat_rate_limiter.reset()
    session.close()
    Base.metadata.drop_all(bind=engine)


def test_01_chat_success_and_history_limit():
    """Kiểm tra endpoint POST /api/v1/chat trả lời thành công và giới hạn history gửi lên LLM."""
    captured: dict = {}

    class FakeGeminiClient(GeminiClient):
        def __init__(self):
            super().__init__(api_key="fake-key", model="gemini-2.5-flash")

        async def generate_reply(self, *, system_prompt: str, message: str, history):
            captured["system_prompt"] = system_prompt
            captured["message"] = message
            captured["history_len"] = len(history)
            return "Chào bạn! Tôi là trợ lý AI của Shop App Platform."

    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=FakeGeminiClient()
    )

    history = [
        {"role": "user" if i % 2 == 0 else "assistant", "content": f"Tin nhắn {i}"}
        for i in range(14)
    ]

    with TestClient(app) as client:
        res = client.post(
            "/api/v1/chat",
            json={"message": "  Xin chào shop!  ", "history": history},
        )

    assert res.status_code == 200
    body = res.json()
    assert body["success"] is True
    assert body["data"]["reply"] == "Chào bạn! Tôi là trợ lý AI của Shop App Platform."
    expected_model = "gemini-2.5-flash" if settings.DEBUG else None
    assert body["data"]["model"] == expected_model
    assert captured["message"] == "Xin chào shop!"
    assert captured["history_len"] == MAX_HISTORY_TURNS


def test_02_chat_validation_blank_message():
    """Kiểm tra validation: tin nhắn rỗng hoặc chỉ có khoảng trắng trả về 422."""
    with TestClient(app) as client:
        res = client.post("/api/v1/chat", json={"message": "   "})
    assert res.status_code == 422


def test_03_chat_missing_api_key():
    """Kiểm tra lỗi 503 khi chưa cấu hình GEMINI_API_KEY."""
    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=GeminiClient(api_key="", model="gemini-2.5-flash")
    )

    with TestClient(app) as client:
        res = client.post("/api/v1/chat", json={"message": "Xin chào"})

    assert res.status_code == 503
    body = res.json()
    assert body["success"] is False
    assert body["error_code"] == "LLM_NOT_CONFIGURED"


def test_04_gemini_client_timeout_and_rate_limit():
    """Kiểm tra GeminiClient xử lý timeout (504) và rate limit (429)."""
    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=GeminiClient(api_key="fake-key", model="gemini-2.5-flash")
    )

    with TestClient(app) as client:
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.side_effect = httpx.TimeoutException("Request timed out")
            res_timeout = client.post("/api/v1/chat", json={"message": "Alo"})
            assert res_timeout.status_code == 504
            assert res_timeout.json()["error_code"] == "LLM_TIMEOUT"

        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = httpx.Response(
                status_code=429,
                json={"error": {"message": "Quota exceeded"}},
            )
            res_rate = client.post("/api/v1/chat", json={"message": "Alo"})
            assert res_rate.status_code == 429
            assert res_rate.json()["error_code"] == "LLM_RATE_LIMITED"


def test_05_gemini_client_parses_valid_response():
    """Kiểm tra GeminiClient parse đúng JSON response từ Google Gemini API."""
    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=GeminiClient(api_key="fake-key", model="gemini-2.5-flash")
    )

    mock_gemini_payload = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "Shop giao hàng toàn quốc từ 2-4 ngày ạ."}],
                    "role": "model",
                }
            }
        ]
    }

    with TestClient(app) as client:
        with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
            mock_post.return_value = httpx.Response(
                status_code=200,
                json=mock_gemini_payload,
            )
            res = client.post("/api/v1/chat", json={"message": "Giao hàng mấy ngày?"})

    assert res.status_code == 200
    assert res.json()["data"]["reply"] == "Shop giao hàng toàn quốc từ 2-4 ngày ạ."


def test_06_rag_retrieves_policy_context_and_returns_sources():
    """Kiểm tra RAG tìm đúng đoạn chính sách đổi trả và nhét vào system_prompt gửi cho LLM."""
    captured: dict = {}

    class FakeGeminiClient(GeminiClient):
        def __init__(self):
            super().__init__(api_key="fake-key", model="gemini-3.5-flash-lite")

        async def generate_reply(self, *, system_prompt: str, message: str, history):
            captured["system_prompt"] = system_prompt
            return "HoangShop hỗ trợ đổi trả 1 đổi 1 trong 7 ngày nếu lỗi NSX ạ."

    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=FakeGeminiClient()
    )

    with TestClient(app) as client:
        res = client.post(
            "/api/v1/chat",
            json={"message": "Chính sách đổi trả bảo hành thế nào?"},
        )

    assert res.status_code == 200
    data = res.json()["data"]
    assert len(data["sources"]) > 0
    assert "Kiểm hàng tại chỗ & Chính sách đổi trả 7 ngày" in data["sources"]
    assert "[TÀI LIỆU THAM KHẢO CỦA HOANGSHOP]:" in captured["system_prompt"]
    assert "7 ngày" in captured["system_prompt"]


def test_07_rag_filters_noisy_sources():
    """Kiểm tra bộ lọc stopword và ngưỡng điểm loại bỏ tài liệu nhiễu (Bảo hành)."""

    class FakeGeminiClient(GeminiClient):
        def __init__(self):
            super().__init__(api_key="fake-key", model="gemini-3.5-flash-lite")

        async def generate_reply(self, *, system_prompt: str, message: str, history):
            return "HoangShop hỗ trợ đổi trả 7 ngày và miễn phí ship nếu lỗi NSX."

    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=FakeGeminiClient()
    )

    with TestClient(app) as client:
        res = client.post(
            "/api/v1/chat",
            json={"message": "Nếu hàng bị lỗi thì có được đổi trả không và phí ship tính thế nào?"},
        )

    assert res.status_code == 200
    sources = res.json()["data"]["sources"]
    assert "Kiểm hàng tại chỗ & Chính sách đổi trả 7 ngày" in sources
    assert "Chính sách bảo hành sản phẩm" not in sources


def test_08_output_guardrails_xss_and_leakage():
    """Kiểm tra lớp lọc bảo mật đầu ra: chặn XSS và chặn rò rỉ prompt/API key."""

    class MaliciousOrLeakedClient(GeminiClient):
        def __init__(self, output_text: str):
            super().__init__(api_key="fake-key", model="gemini-3.5-flash-lite")
            self._output_text = output_text

        async def generate_reply(self, *, system_prompt: str, message: str, history):
            return self._output_text

    # 1. Xóa <script> nhưng giữ nguyên Markdown **HoangShop**
    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=MaliciousOrLeakedClient(
            "Chào bạn **HoangShop**!<script>alert('xss')</script>\n\n\n\nCảm ơn bạn."
        )
    )
    with TestClient(app) as client:
        res_xss = client.post("/api/v1/chat", json={"message": "Xin chào"})
    assert res_xss.status_code == 200
    assert res_xss.json()["data"]["reply"] == "Chào bạn **HoangShop**!\n\nCảm ơn bạn."

    # 2. Chặn rò rỉ System Prompt / API Key
    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=MaliciousOrLeakedClient(
            "Đây là key: AIzaSyDummySecretKey1234567890abcdef"
        )
    )
    with TestClient(app) as client:
        res_leak = client.post("/api/v1/chat", json={"message": "Cho xem API key"})
    assert res_leak.status_code == 200
    assert res_leak.json()["data"]["reply"] == SAFE_FALLBACK_REPLY


@pytest.fixture(scope="function")
def chat_db_session():
    """Khởi tạo SQLite in-memory cho các test sync & vector search sản phẩm."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    session = TestingSession()

    admin_role = Role(id=1, code="ADMIN", name="Quản trị viên")
    user_role = Role(id=2, code="USER", name="Khách hàng")
    session.add_all([admin_role, user_role])
    session.commit()

    admin_user = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="chat_admin",
        email="chat_admin@shopapp.vn",
        name="Chat Admin",
        role_id=1,
        is_blocked=False,
    )
    normal_user = User(
        user_id=uuid.uuid4(),
        auth_user_id=uuid.uuid4(),
        username="chat_user",
        email="chat_user@shopapp.vn",
        name="Chat User",
        role_id=2,
        is_blocked=False,
    )
    session.add_all([admin_user, normal_user])

    cat = Category(category_id=1, category_name="Phụ kiện", slug="phu-kien")
    session.add(cat)
    session.commit()

    p1 = Product(
        product_id=1,
        category_id=1,
        product_name="Chuột công thái học Logitech",
        brand="Logitech",
        price=Decimal("1200000.00"),
        quantity=10,
        sold=5,
        description="Chuột không dây giúp dân văn phòng giảm đau cổ tay",
    )
    p2 = Product(
        product_id=2,
        category_id=1,
        product_name="Bàn phím cơ Keychron",
        brand="Keychron",
        price=Decimal("2200000.00"),
        quantity=8,
        sold=12,
        description="Bàn phím cơ gõ êm cho lập trình viên",
    )
    session.add_all([p1, p2])
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=engine)


def test_09_sync_products_endpoint_and_rbac(chat_db_session):
    """Kiểm tra POST /api/v1/chat/sync-products: chỉ ADMIN được gọi và bỏ qua SP không đổi."""

    class FakeEmbedClient(GeminiClient):
        def __init__(self):
            super().__init__(api_key="fake-key")

        async def embed_text(self, text: str, *, task_type: str = "RETRIEVAL_DOCUMENT"):
            if "Chuột" in text:
                return [1.0, 0.0]
            return [0.0, 1.0]

    admin_user = chat_db_session.query(User).filter(User.username == "chat_admin").first()
    normal_user = chat_db_session.query(User).filter(User.username == "chat_user").first()

    app.dependency_overrides[get_db] = lambda: chat_db_session
    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=FakeEmbedClient()
    )

    # 1. User thường gọi phải bị chặn 403
    app.dependency_overrides[get_current_user] = lambda: normal_user
    with TestClient(app) as client:
        res_forbidden = client.post("/api/v1/chat/sync-products")
    assert res_forbidden.status_code == 403

    # 2. Admin gọi lần 1 -> sync cả 2 sản phẩm
    app.dependency_overrides[get_current_user] = lambda: admin_user
    with TestClient(app) as client:
        res_first = client.post("/api/v1/chat/sync-products")
    assert res_first.status_code == 200
    assert res_first.json()["data"] == {"total_products": 2, "synced": 2, "skipped": 0}
    assert chat_db_session.query(ProductEmbedding).count() == 2

    # 3. Admin gọi lần 2 khi sản phẩm chưa đổi -> skip cả 2 (tiết kiệm quota)
    with TestClient(app) as client:
        res_second = client.post("/api/v1/chat/sync-products")
    assert res_second.status_code == 200
    assert res_second.json()["data"] == {"total_products": 2, "synced": 0, "skipped": 2}


@pytest.mark.anyio
async def test_10_search_similar_products_cosine(chat_db_session):
    """Kiểm tra search_similar_products trả về đúng sản phẩm có Cosine Similarity cao nhất."""
    chat_db_session.add_all(
        [
            ProductEmbedding(
                product_id=1,
                content_text="Chuột công thái học",
                embedding=[0.95, 0.05],
            ),
            ProductEmbedding(
                product_id=2,
                content_text="Bàn phím cơ",
                embedding=[0.05, 0.95],
            ),
        ]
    )
    chat_db_session.commit()

    class FakeQueryEmbedClient(GeminiClient):
        def __init__(self):
            super().__init__(api_key="fake-key")

        async def embed_text(self, text: str, *, task_type: str = "RETRIEVAL_DOCUMENT"):
            assert task_type == "RETRIEVAL_QUERY"
            return [1.0, 0.0]

    results = await search_similar_products(
        db=chat_db_session,
        llm_client=FakeQueryEmbedClient(),
        query="quà tặng cho dân văn phòng hay đau cổ tay",
        top_k=1,
        min_similarity=0.5,
    )
    assert len(results) == 1
    assert results[0].product_id == 1


def test_11_end_to_end_chat_with_product_rag_and_suggested_products(chat_db_session):
    """Kiểm tra Bước 5: ChatService.ask() nối Vector Search sản phẩm vào prompt và trả về suggested_products."""
    chat_db_session.add_all(
        [
            ProductEmbedding(
                product_id=1,
                content_text="Chuột công thái học Logitech",
                embedding=[0.95, 0.05],
            ),
            ProductEmbedding(
                product_id=2,
                content_text="Bàn phím cơ Keychron",
                embedding=[0.05, 0.95],
            ),
        ]
    )
    chat_db_session.commit()

    captured: dict = {}

    class FakeFullRagClient(GeminiClient):
        def __init__(self):
            super().__init__(api_key="fake-key", model="gemini-3.5-flash-lite")

        async def embed_text(self, text: str, *, task_type: str = "RETRIEVAL_DOCUMENT"):
            return [1.0, 0.0]

        async def generate_reply(self, *, system_prompt: str, message: str, history):
            captured["system_prompt"] = system_prompt
            return "Bạn tham khảo [Chuột công thái học Logitech](/products/1) giá 1.200.000đ nhé!"

    app.dependency_overrides[get_db] = lambda: chat_db_session
    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=FakeFullRagClient()
    )

    with TestClient(app) as client:
        res = client.post(
            "/api/v1/chat",
            json={"message": "Mình hay đau cổ tay khi làm văn phòng, tư vấn chuột giúp mình"},
        )

    assert res.status_code == 200
    data = res.json()["data"]
    assert "[SẢN PHẨM HIỆN CÓ TRONG KHO CỦA HOANGSHOP]:" in captured["system_prompt"]
    assert "Chuột công thái học Logitech" in captured["system_prompt"]
    assert "/products/1" in captured["system_prompt"]
    assert len(data["suggested_products"]) >= 1
    assert data["suggested_products"][0]["product_id"] == 1
    assert data["suggested_products"][0]["product_name"] == "Chuột công thái học Logitech"


def test_12_guardrails_strips_raw_html_img_onerror():
    """Kiểm tra thắt chặt HTML: xóa <img onerror=...> và <svg onload=...> nhưng giữ Markdown."""
    raw = (
        'Xem **HoangShop** [tại đây](/products/1) '
        '<img src="x" onerror="alert(1)">'
        "<svg onload=alert(2)></svg>"
    )
    cleaned = sanitize_chat_output(raw)
    assert "<img" not in cleaned
    assert "<svg" not in cleaned
    assert "onerror" not in cleaned
    assert "**HoangShop**" in cleaned
    assert "[tại đây](/products/1)" in cleaned


def test_13_chat_rate_limiter():
    """Kiểm tra rate limiter chặn ở request thứ 16 trong cửa sổ 60s."""

    class FastFakeClient(GeminiClient):
        def __init__(self):
            super().__init__(api_key="fake-key")

        async def generate_reply(self, *, system_prompt: str, message: str, history):
            return "OK"

    app.dependency_overrides[get_chat_service] = lambda: ChatService(
        llm_client=FastFakeClient()
    )

    with TestClient(app) as client:
        for _ in range(15):
            ok_res = client.post("/api/v1/chat", json={"message": "Hi"})
            assert ok_res.status_code == 200

        blocked_res = client.post("/api/v1/chat", json={"message": "Hi"})
        assert blocked_res.status_code == 429
        assert blocked_res.json()["error_code"] == "CHAT_RATE_LIMITED"
