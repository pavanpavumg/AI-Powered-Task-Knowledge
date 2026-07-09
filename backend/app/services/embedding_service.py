from app.ai.embedder import embed_text, chunk_text
from app.ai.vector_store import vector_store
from typing import List, Dict, Any

class EmbeddingService:
    @staticmethod
    def index_document(document_id: int, title: str, full_text: str):
        # Chunk the text into overlapping 150-word blocks
        chunks = chunk_text(full_text, max_words=150)
        if not chunks:
            chunks = [""]
            
        for chunk in chunks:
            vector = embed_text(chunk)
            metadata = {
                "document_id": document_id,
                "document_title": title,
                "chunk_text": chunk
            }
            vector_store.add(vector, metadata)
            
        # Save FAISS index
        vector_store.persist()

    @staticmethod
    def search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        query_vector = embed_text(query)
        raw_results = vector_store.search(query_vector, top_k=top_k)
        
        results = []
        for meta, score in raw_results:
            results.append({
                "document_id": meta["document_id"],
                "title": meta["document_title"],
                "snippet": meta["chunk_text"],
                "score": score
            })
        return results

# Single global instance
embedding_service = EmbeddingService()
