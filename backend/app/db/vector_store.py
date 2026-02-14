from pathlib import Path
from uuid import uuid4

import chromadb

from app.services.embedding_service import create_embedding


CHROMA_DIR = Path(__file__).resolve().parents[2] / "chroma"
client = chromadb.PersistentClient(path=str(CHROMA_DIR))
collection = client.get_or_create_collection(name="knowledge_base")


def add_documents(chunks: list[str]) -> None:
    cleaned_chunks = [chunk.strip() for chunk in chunks if chunk and chunk.strip()]
    if not cleaned_chunks:
        raise ValueError("chunks must include at least one non-empty string.")

    ids = [str(uuid4()) for _ in cleaned_chunks]
    embeddings = [create_embedding(chunk) for chunk in cleaned_chunks]

    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=cleaned_chunks,
    )


def query_similar(question: str, top_k: int = 3) -> list[str]:
    cleaned_question = question.strip()
    if not cleaned_question:
        raise ValueError("question cannot be empty.")

    question_embedding = create_embedding(cleaned_question)
    results = collection.query(
        query_embeddings=[question_embedding],
        n_results=top_k,
    )
    documents = results.get("documents", [])
    if not documents:
        return []
    return documents[0]


def delete_document_by_id(doc_id: str) -> bool:
    cleaned_id = doc_id.strip()
    if not cleaned_id:
        raise ValueError("doc_id cannot be empty.")

    existing = collection.get(ids=[cleaned_id])
    existing_ids = existing.get("ids", [])
    if not existing_ids:
        return False

    collection.delete(ids=[cleaned_id])
    return True


def delete_all_documents() -> int:
    data = collection.get()
    all_ids = data.get("ids", [])
    if not all_ids:
        return 0

    collection.delete(ids=all_ids)
    return len(all_ids)
