import os
import pickle
import numpy as np
import faiss

class FAISSVectorStore:
    def __init__(self, index_path: str = "faiss_index.bin", metadata_path: str = "metadata_sidecar.pkl", dimension: int = 384):
        self.index_path = index_path
        self.metadata_path = metadata_path
        self.dimension = dimension
        
        # IndexIDMap wraps IndexFlatIP to support custom integer IDs
        self.index = faiss.IndexIDMap(faiss.IndexFlatIP(self.dimension))
        self.metadata_sidecar = {}  # maps vector_id (int) -> metadata dict
        self.current_id = 0
        self.load()

    def add(self, embedding: np.ndarray, metadata: dict) -> int:
        vector_id = self.current_id
        self.current_id += 1
        
        vec = np.array([embedding], dtype=np.float32)
        ids = np.array([vector_id], dtype=np.int64)
        
        self.index.add_with_ids(vec, ids)
        self.metadata_sidecar[vector_id] = metadata
        return vector_id

    def search(self, query_embedding: np.ndarray, top_k: int = 5) -> list:
        if self.index.ntotal == 0:
            return []
            
        vec = np.array([query_embedding], dtype=np.float32)
        scores, indices = self.index.search(vec, top_k)
        
        results = []
        for score, idx in zip(scores[0], indices[0]):
            if idx == -1:
                continue
            meta = self.metadata_sidecar.get(int(idx))
            if meta:
                # Cap scores between 0.0 and 1.0 for displaying percentage matches
                similarity = max(0.0, min(1.0, float(score)))
                results.append((meta, similarity))
        return results

    def persist(self):
        try:
            faiss.write_index(self.index, self.index_path)
            with open(self.metadata_path, "wb") as f:
                pickle.dump({
                    "metadata": self.metadata_sidecar,
                    "current_id": self.current_id
                }, f)
            print(f"INFO: Successfully persisted FAISS index with {self.index.ntotal} items.")
        except Exception as e:
            print(f"ERROR: Failed to persist FAISS index: {e}")

    def load(self):
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, "rb") as f:
                    data = pickle.load(f)
                    self.metadata_sidecar = data.get("metadata", {})
                    self.current_id = data.get("current_id", 0)
                print(f"INFO: Successfully loaded FAISS index with {self.index.ntotal} items.")
            except Exception as e:
                print(f"WARNING: Failed to load FAISS index: {e}. Starting fresh.")
                self.index = faiss.IndexIDMap(faiss.IndexFlatIP(self.dimension))
                self.metadata_sidecar = {}
                self.current_id = 0

# Single global instance
vector_store = FAISSVectorStore()
