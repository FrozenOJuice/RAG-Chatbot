from fastapi import APIRouter, Depends

from app.core.security import require_admin_key
from app.db.vector_store import add_documents, delete_all_documents, delete_document_by_id
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


@router.delete("/delete/{doc_id}", dependencies=[Depends(require_admin_key)])
def delete_knowledge_by_id(doc_id: str) -> dict[str, object]:
    deleted = delete_document_by_id(doc_id)
    return {
        "status": "success",
        "deleted": deleted,
        "id": doc_id,
    }


@router.delete("/delete-all", dependencies=[Depends(require_admin_key)])
def delete_knowledge_all() -> dict[str, object]:
    deleted_count = delete_all_documents()
    return {
        "status": "success",
        "deleted_count": deleted_count,
    }
