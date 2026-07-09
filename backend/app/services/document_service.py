import os
import uuid
from sqlalchemy.orm import Session
from app.models.document import Document
from app.core.config import settings
from app.services.activity_service import log_activity
from typing import List, Tuple

class DocumentService:
    @staticmethod
    def upload_document(db: Session, title: str, filename: str, content: str, uploader_id: int) -> Document:
        # Ensure uploads folder exists
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        
        _, file_ext = os.path.splitext(filename)
        # Fallback to .txt if no extension is present
        if not file_ext:
            file_ext = ".txt"
            
        uuid_filename = f"{uuid.uuid4()}{file_ext}"
        filepath = os.path.join(settings.UPLOAD_DIR, uuid_filename)
        
        # Save content locally
        with open(filepath, "w", encoding="utf-8", errors="ignore") as f:
            f.write(content)
            
        # Create database record
        db_doc = Document(
            title=title,
            filename=uuid_filename,
            filepath=filepath,
            uploaded_by=uploader_id
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        
        # Trigger vector store indexing
        from app.services.embedding_service import embedding_service
        try:
            embedding_service.index_document(db_doc.id, db_doc.title, content)
        except Exception as e:
            print(f"ERROR: Vector indexing failed for document {db_doc.id}: {e}")
            
        # Log centralized activity
        log_activity(
            db, 
            user_id=uploader_id, 
            action="document_upload", 
            details=f"Uploaded document '{title}' as {uuid_filename}"
        )
        
        return db_doc

    @staticmethod
    def get_documents_paginated(db: Session, page: int = 1, limit: int = 10) -> Tuple[List[Document], int]:
        offset = (page - 1) * limit
        query = db.query(Document).order_by(Document.created_at.desc())
        total = query.count()
        results = query.offset(offset).limit(limit).all()
        return results, total
