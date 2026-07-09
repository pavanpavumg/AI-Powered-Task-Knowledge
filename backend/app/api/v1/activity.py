from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role
from app.models.user import User
from app.models.activity_log import ActivityLog
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

router = APIRouter()

class ActivityLogOut(BaseModel):
    id: int
    user_id: int
    user_name: str
    user_email: str
    action: str
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class PaginatedActivityLogs(BaseModel):
    total: int
    page: int
    limit: int
    results: List[ActivityLogOut]

@router.get("/", response_model=PaginatedActivityLogs)
def list_activity_logs(
    action: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    query = db.query(ActivityLog)
    
    if action:
        query = query.filter(ActivityLog.action == action)
    if user_id is not None:
        query = query.filter(ActivityLog.user_id == user_id)
        
    total = query.count()
    offset = (page - 1) * limit
    results = query.order_by(ActivityLog.created_at.desc()).offset(offset).limit(limit).all()
    
    formatted = []
    for log in results:
        u_name = log.user.name if log.user else "System"
        u_email = log.user.email if log.user else "system@example.com"
        formatted.append(
            ActivityLogOut(
                id=log.id,
                user_id=log.user_id,
                user_name=u_name,
                user_email=u_email,
                action=log.action,
                details=log.details,
                created_at=log.created_at
            )
        )
        
    return PaginatedActivityLogs(
        total=total,
        page=page,
        limit=limit,
        results=formatted
    )
