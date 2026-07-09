from fastapi import APIRouter, Depends, Query
from app.api.deps import get_current_user
from app.models.user import User
from app.services.embedding_service import embedding_service
from app.services.activity_service import log_activity
from app.db.session import get_db
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SearchResultOut(BaseModel):
    document_id: int
    title: str
    snippet: str
    score: float

@router.get("/", response_model=List[SearchResultOut])
def search(
    q: str = Query(..., min_length=1),
    top_k: int = Query(5, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    results = embedding_service.search(q, top_k=top_k)
    
    # Log audit entry
    log_activity(db, user_id=current_user.id, action="search", details=q)
    
    return [
        SearchResultOut(
            document_id=r["document_id"],
            title=r["title"],
            snippet=r["snippet"],
            score=r["score"]
        )
        for r in results
    ]
