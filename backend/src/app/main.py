from fastapi import FastAPI

from app.routers.product import router as product_router

app = FastAPI(title="Shop App API")


app.include_router(product_router)


@app.get("/")
def root():
    return {"message": "Shop App API"}
