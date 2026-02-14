from app.db.vector_store import collection

data = collection.get()

ids = data.get("ids", [])
documents = data.get("documents", [])
metadatas = data.get("metadatas", [])

print("\n=== Knowledge Base Snapshot ===")
print(f"Total records: {len(ids)}")

if not ids:
    print("No stored documents found.\n")
else:
    for index, doc_id in enumerate(ids, start=1):
        document = documents[index - 1] if index - 1 < len(documents) else ""
        metadata = metadatas[index - 1] if index - 1 < len(metadatas) else None

        print(f"\n[{index}] ID: {doc_id}")
        print(f"Document: {document}")
        if metadata:
            print(f"Metadata: {metadata}")

print("\n=== End Snapshot ===\n")
