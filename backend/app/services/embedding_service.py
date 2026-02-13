from openai import OpenAI

from app.core.config import settings


client = OpenAI(api_key=settings.OPENAI_API_KEY)


def create_embedding(text: str) -> list[float]:
    cleaned_text = text.strip()
    if not cleaned_text:
        raise ValueError("Text cannot be empty.")

    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=cleaned_text,
    )
    return response.data[0].embedding
