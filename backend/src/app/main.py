from fastapi import FastAPI

from src.app.modules.categories.router import router as category_router
from src.app.modules.products.router import router as product_router

app = FastAPI(title="Shop App API")

app.include_router(product_router)
app.include_router(category_router)


@app.get("/")
def root():
    return {"message": "Shop App API"}
