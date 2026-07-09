from fastapi import APIRouter, Depends, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role, get_current_user
from app.models.user import User
from app.services.document_service import DocumentService
from pydantic import BaseModel
from datetime import datetime
from typing import List

router = APIRouter()

class DocumentOut(BaseModel):
    id: int
    title: str
    filename: str
    filepath: str
    uploaded_by: int
    uploader_name: str
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedDocuments(BaseModel):
    total: int
    page: int
    limit: int
    results: List[DocumentOut]

@router.post("/", response_model=DocumentOut)
def upload_document(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    content_bytes = file.file.read()
    content = content_bytes.decode("utf-8", errors="ignore")
    
    db_doc = DocumentService.upload_document(
        db, 
        title=title, 
        filename=file.filename, 
        content=content, 
        uploader_id=current_user.id
    )
    
    return DocumentOut(
        id=db_doc.id,
        title=db_doc.title,
        filename=db_doc.filename,
        filepath=db_doc.filepath,
        uploaded_by=db_doc.uploaded_by,
        uploader_name=current_user.name,
        created_at=db_doc.created_at
    )

@router.get("/", response_model=PaginatedDocuments)
def list_documents(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results, total = DocumentService.get_documents_paginated(db, page=page, limit=limit)
    
    formatted_results = []
    for doc in results:
        uploader_name = doc.uploader.name if doc.uploader else "Unknown"
        formatted_results.append(
            DocumentOut(
                id=doc.id,
                title=doc.title,
                filename=doc.filename,
                filepath=doc.filepath,
                uploaded_by=doc.uploaded_by,
                uploader_name=uploader_name,
                created_at=doc.created_at
            )
        )
        
    return PaginatedDocuments(
        total=total,
        page=page,
        limit=limit,
        results=formatted_results
    )
