from app.db.vector_store import query_similar
from app.services.embedding_service import client as openai_client
from app.services.embedding_service import create_embedding


SYSTEM_MESSAGE = (
    "You are a helpful assistant. "
    "Answer ONLY using the provided context. "
    "If the answer is not in the context, say you do not know."
)


def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 100) -> list[str]:
    cleaned_text = text.strip()
    if not cleaned_text:
        return []
    if chunk_size <= 0:
        raise ValueError("chunk_size must be greater than 0.")
    if overlap < 0 or overlap >= chunk_size:
        raise ValueError("overlap must be >= 0 and less than chunk_size.")

    chunks: list[str] = []
    start = 0
    text_length = len(cleaned_text)

    while start < text_length:
        end = min(start + chunk_size, text_length)
        chunks.append(cleaned_text[start:end])
        if end == text_length:
            break
        start = end - overlap

    return chunks


def answer_question(question: str) -> str:
    cleaned_question = question.strip()
    if not cleaned_question:
        raise ValueError("question cannot be empty.")

    # Step A: embed question
    _ = create_embedding(cleaned_question)

    # Step B: retrieve context
    context_chunks = query_similar(cleaned_question, top_k=3)
    context_block = "\n".join(context_chunks) if context_chunks else "No context available."

    # Step C: build prompt
    user_prompt = (
        "Context:\n"
        f"{context_block}\n\n"
        "Question:\n"
        f"{cleaned_question}"
    )

    # Step D: call chat model
    response = openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_MESSAGE},
            {"role": "user", "content": user_prompt},
        ],
    )
    return (response.choices[0].message.content or "").strip()
