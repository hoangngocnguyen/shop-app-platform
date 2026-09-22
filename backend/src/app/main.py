from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.app.core.exceptions import global_exception_handler
from src.app.modules.auth.router import router as auth_router

# Import Category trước hoặc song song để SQLAlchemy biết Class này tồn tại
from src.app.modules.categories.model import Category  # noqa: F401
from src.app.modules.products.router import router as product_router

app = FastAPI(title="Shop App API")


app.include_router(product_router)
app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)


app.add_exception_handler(Exception, global_exception_handler)


@app.get("/")
def root():
    return {"message": "Shop App API"}
