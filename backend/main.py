from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import engine, Base
import models
from routers import auth, products, orders, scheduled, recommendations
from schedular import start_scheduler, stop_scheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    print("Tables ready.")
    start_scheduler()
    yield
    stop_scheduler()

app = FastAPI(
    title="Intellicart API",
    description="Backend API for Intellicart grocery app",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Intellicart API is running!"}

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(scheduled.router)
app.include_router(recommendations.router)

@app.post("/test/run-scheduler")
def test_scheduler():
    from schedular.jobs import process_scheduled_orders
    process_scheduled_orders()
    return {"message": "Scheduler ran — check terminal"}