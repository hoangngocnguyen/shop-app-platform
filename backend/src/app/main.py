from fastapi import FastAPI

from src.app.modules.auth.router import router as auth_router

# Import Category trước hoặc song song để SQLAlchemy biết Class này tồn tại
from src.app.modules.categories.model import Category  # noqa: F401
from src.app.modules.products.router import router as product_router

app = FastAPI(title="Shop App API")


app.include_router(product_router)
app.include_router(auth_router)


@app.get("/")
def root():
    return {"message": "Shop App API"}
