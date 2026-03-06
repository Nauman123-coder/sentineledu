"""
SentinelEdu Backend - FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from routes.predict import router as predict_router
from routes.students import router as students_router
from routes.analytics import router as analytics_router
from utils.model_loader import ModelLoader

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML model on startup."""
    logger.info("🚀 SentinelEdu API starting up...")
    try:
        loader = ModelLoader()
        loader.load()
        app.state.model_loader = loader
        logger.info("✅ ML Model loaded successfully")
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        logger.info("💡 Run: cd engine && python train_model.py")
        app.state.model_loader = None
    yield
    logger.info("🛑 Shutting down SentinelEdu API")


app = FastAPI(
    title="SentinelEdu API",
    description="AI-Powered Student Dropout Prediction System",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predict_router, prefix="/api", tags=["Predictions"])
app.include_router(students_router, prefix="/api", tags=["Students"])
app.include_router(analytics_router, prefix="/api", tags=["Analytics"])


@app.get("/")
async def root():
    return {
        "name": "SentinelEdu API",
        "version": "1.0.0",
        "status": "operational",
        "endpoints": ["/api/predict", "/api/students", "/api/analytics/overview", "/docs"]
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "model_loaded": app.state.model_loader is not None}
