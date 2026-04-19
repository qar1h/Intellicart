from fastapi import FastAPI
from database import engine, Base
import models
from routers import auth,products,orders,scheduled,recommendations
from fastapi.middleware.cors import CORSMiddleware
from schedular import start_scheduler,stop_scheduler
from contextlib import asynccontextmanager

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
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://intellicart-ijt39dwey-qar1hs-projects.vercel.app,"
    "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(scheduled.router)
app.include_router(recommendations.router)

@app.get("/")
def root():
    return {"message": "Intellicart API is running!"}