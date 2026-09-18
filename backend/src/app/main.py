from fastapi import FastAPI

# Import Category trước hoặc song song để SQLAlchemy biết Class này tồn tại
from src.app.modules.categories.model import Category  # noqa: F401
from src.app.modules.products.router import router as product_router

app = FastAPI(title="Shop App API")


app.include_router(product_router)


@app.get("/")
def root():
    return {"message": "Shop App API"}
