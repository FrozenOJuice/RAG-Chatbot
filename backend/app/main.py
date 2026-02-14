import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.admin import router as admin_router
from app.routes.chat import router as chat_router

logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME or "RAG-Chatbot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)
app.include_router(chat_router)



@app.on_event("startup")
async def on_startup() -> None:
    logger.info(
        "Starting %s in %s mode",
        settings.APP_NAME or "RAG-Chatbot API",
        settings.ENV or "unknown",
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "app": settings.APP_NAME or "RAG-Chatbot API",
        "env": settings.ENV or "unknown",
    }
