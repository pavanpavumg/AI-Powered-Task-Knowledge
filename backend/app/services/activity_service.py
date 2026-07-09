from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog
from datetime import datetime

def log_activity(db: Session, user_id: int, action: str, details: str | None = None) -> ActivityLog:
    db_log = ActivityLog(
        user_id=user_id,
        action=action,
        details=details,
        created_at=datetime.utcnow()
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log
