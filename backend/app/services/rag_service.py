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
