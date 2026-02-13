from app.db.vector_store import add_documents, query_similar, CHROMA_DIR, collection

print(CHROMA_DIR)          # should point to backend/chroma
print(collection.name)     # should be "knowledge_base"

add_documents(["FastAPI is a modern Python web framework."])
results = query_similar("What is FastAPI?", top_k=3)
print(results)
