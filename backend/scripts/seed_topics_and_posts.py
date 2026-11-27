from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from src.app.modules.posts.model import Post, Topic
from src.app.modules.posts.schema import PostStatus
from src.app.modules.users.model import User


def seed_topics_and_posts(db: Session) -> None:
    """Khởi tạo chủ đề và bài viết mẫu cho hệ thống."""
    print("Seeding topics and posts...")

    # 1. Đảm bảo user tác giả
    user = db.scalar(select(User).limit(1))
    if not user:
        user = User(
            username="admin",
            name="Ban Biên Tập ShopApp",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # 2. Khởi tạo các chủ đề mẫu
    topics_data = [
        ("Hướng dẫn", "huong-dan", "CATEGORY"),
        ("Tin công nghệ", "tin-cong-nghe", "CATEGORY"),
        ("Đánh giá sản phẩm", "danh-gia-san-pham", "CATEGORY"),
        ("Mẹo & Thủ thuật", "meo-va-thu-thuat", "CATEGORY"),
        ("Khuyến mãi & Tin tức", "khuyen-mai-tin-tuc", "CATEGORY"),
    ]
    topic_map: dict[str, Topic] = {}
    for name, slug, t_type in topics_data:
        topic = db.scalar(select(Topic).where(Topic.slug == slug))
        if not topic:
            topic = Topic(name=name, slug=slug, type=t_type)
            db.add(topic)
            db.commit()
            db.refresh(topic)
        topic_map[slug] = topic

    # 3. Khởi tạo bài viết mẫu
    posts_data = [
        (
            "Top 5 bàn phím cơ gõ sướng nhất dành cho lập trình viên 2026",
            "top-5-ban-phim-co-go-suong-nhat-2026",
            "Đánh giá chi tiết top 5 bàn phím cơ có switch êm ái, hành trình sâu và layout tối ưu cho anh em coder.",
            "danh-gia-san-pham",
            "<p>Bàn phím cơ không chỉ là công cụ nhập liệu mà còn là người bạn đồng hành truyền cảm hứng mỗi ngày cho các lập trình viên...</p><h3>Keychron Q1 Pro</h3><p>Thiết kế nhôm nguyên khối, mạch xuôi, hỗ trợ custom switch linh hoạt.</p>",
            "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60",
        ),
        (
            "Hướng dẫn vệ sinh màn hình laptop đúng cách không lo xước",
            "huong-dan-ve-sinh-man-hinh-laptop-dung-cach",
            "Quy trình lau chùi màn hình máy tính an toàn bằng dung dịch chuyên dụng, tránh gây ố và bong tróc lớp phủ chống chói.",
            "huong-dan",
            "<p>Màn hình là bộ phận nhạy cảm nhất trên laptop. Dùng khăn thô ráp hay dung dịch cồn mạnh sẽ làm hỏng lớp chống lóa...</p>",
            "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=60",
        ),
        (
            "Xu hướng công nghệ AI và thiết bị thông minh nổi bật năm nay",
            "xu-huong-cong-nghe-ai-va-thiet-bi-thong-minh",
            "Khám phá các dòng sản phẩm tích hợp trí tuệ nhân tạo giúp tối ưu hóa hiệu suất làm việc và giải trí.",
            "tin-cong-nghe",
            "<p>Trí tuệ nhân tạo đang thay đổi cách chúng ta tương tác với các thiết bị phần cứng từ laptop đến điện thoại thông minh...</p>",
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60",
        ),
        (
            "Đánh giá chi tiết MacBook Air M3: Sức mạnh đột phá và thời lượng pin cực đỉnh",
            "danh-gia-chi-ti-t-macbook-air-m3",
            "Đánh giá chi tiết hiệu năng Apple M3 trên MacBook Air mới, khả năng đa nhiệm và thời lượng pin thực tế cho người dùng văn phòng.",
            "danh-gia-san-pham",
            "<p>MacBook Air M3 mang lại những cải tiến mạnh mẽ về hiệu suất đồ họa nhờ kiến trúc GPU mới...</p>",
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60",
        ),
        (
            "Mẹo tối ưu hóa tốc độ khởi động Windows 11 cho máy cấu hình yếu",
            "meo-toi-uu-hoa-toc-do-khoi-dong-windows-11",
            "Tổng hợp các bước tắt ứng dụng chạy ngầm, tinh chỉnh dịch vụ hệ thống giúp Windows 11 khởi động nhanh và mượt mà hơn.",
            "meo-va-thu-thuat",
            "<p>Windows 11 cung cấp nhiều tính năng hiện đại nhưng đôi khi gây nặng nề cho các dòng máy cũ...</p>",
            "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
        ),
        (
            "Săn sale công nghệ cuối năm: Kinh nghiệm mua sắm không sợ hở giá",
            "san-sale-cong-nghe-cuoi-nam-kinh-nghiem",
            "Bí kíp săn deal giảm giá sâu vào dịp cuối năm, kiểm tra lịch sử giá và chọn thời điểm vàng để chốt đơn thiết bị điện tử.",
            "khuyen-mai-tin-tuc",
            "<p>Các đợt sale cuối năm luôn là cơ hội tuyệt vời để sở hữu những món đồ công nghệ yêu thích với mức giá hời...</p>",
            "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=60",
        ),
    ]

    for p_title, p_slug, p_summary, p_topic_slug, p_content, p_thumb in posts_data:
        if not db.scalar(select(Post.id).where(Post.slug == p_slug)):
            t = topic_map.get(p_topic_slug)
            p = Post(
                title=p_title,
                slug=p_slug,
                summary=p_summary,
                content=p_content,
                thumbnail_url=p_thumb,
                topic_id=t.id if t else None,
                author_id=user.user_id,
                status=PostStatus.PUBLISHED.value,
                published_at=datetime.now(UTC),
            )
            db.add(p)

    db.commit()
    print("Topics and posts seeded successfully.")
