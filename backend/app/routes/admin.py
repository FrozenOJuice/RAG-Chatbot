from fastapi import APIRouter, Depends

from app.core.security import require_admin_key
from app.db.vector_store import add_documents
from app.schemas.knowledge_schema import KnowledgeInput
from app.services.rag_service import chunk_text


router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/add", dependencies=[Depends(require_admin_key)])
def add_knowledge(payload: KnowledgeInput) -> dict[str, object]:
    chunks = chunk_text(payload.text)
    add_documents(chunks)
    return {
        "status": "success",
        "chunks_added": len(chunks),
    }
