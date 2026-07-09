import numpy as np
from sentence_transformers import SentenceTransformer

# Load the sentence-transformers model globally on module load
print("INFO: Loading sentence-transformers 'all-MiniLM-L6-v2' model once...")
model = SentenceTransformer("all-MiniLM-L6-v2")
print("INFO: sentence-transformers model loaded successfully.")

def embed_text(text: str) -> np.ndarray:
    if not text.strip():
        return np.zeros(384, dtype=np.float32)
    # Generate embedding
    embedding = model.encode(text, convert_to_numpy=True)
    # L2 normalize for cosine similarity via dot product
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    return embedding.astype(np.float32)

def chunk_text(text: str, max_words: int = 150) -> list[str]:
    words = text.split()
    if not words:
        return []
        
    chunks = []
    # Sliding window: 20% overlap (e.g., 30 words overlap for a 150-word window)
    overlap = int(max_words * 0.2)
    step = max_words - overlap
    if step <= 0:
        step = max_words
        
    for i in range(0, len(words), step):
        chunk_words = words[i : i + max_words]
        chunk = " ".join(chunk_words)
        chunks.append(chunk)
        if i + max_words >= len(words):
            break
            
    return chunks
