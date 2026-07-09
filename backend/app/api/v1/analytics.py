from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role
from app.models.user import User
from app.services.analytics_service import AnalyticsService
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()

class SearchQueryCount(BaseModel):
    query: str
    count: int

class AnalyticsOut(BaseModel):
    total_tasks: int
    completed_tasks: int
    pending_tasks: int
    total_documents: int
    total_users: int
    top_searches: List[SearchQueryCount]

class UserMinOut(BaseModel):
    id: int
    name: str
    email: str
    role_name: str

@router.get("/", response_model=AnalyticsOut)
def get_analytics(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_admin_analytics(db)

@router.get("/users", response_model=List[UserMinOut])
def list_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    return [
        UserMinOut(
            id=u.id,
            name=u.name,
            email=u.email,
            role_name=u.role.name
        )
        for u in users
    ]
