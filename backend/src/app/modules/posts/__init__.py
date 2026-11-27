from src.app.modules.posts.model import Post, Topic
from src.app.modules.posts.router import router
from src.app.modules.posts.service import AdminPostService, TopicService
from src.app.modules.posts.topic_router import router as topic_router

__all__ = ["router", "topic_router", "AdminPostService", "TopicService", "Post", "Topic"]
