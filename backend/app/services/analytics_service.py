from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.task import Task, TaskStatus
from app.models.document import Document
from app.models.user import User
from app.models.activity_log import ActivityLog
from typing import Dict, Any

class AnalyticsService:
    @staticmethod
    def get_admin_analytics(db: Session) -> Dict[str, Any]:
        total_tasks = db.query(Task).count()
        completed_tasks = db.query(Task).filter(Task.status == TaskStatus.completed).count()
        pending_tasks = db.query(Task).filter(Task.status == TaskStatus.pending).count()
        total_documents = db.query(Document).count()
        total_users = db.query(User).count()
        
        # Group by and count details for top searches
        top_searches_query = db.query(
            ActivityLog.details.label("query"),
            func.count(ActivityLog.id).label("count")
        ).filter(
            ActivityLog.action == "search"
        ).group_by(
            ActivityLog.details
        ).order_by(
            func.count(ActivityLog.id).desc()
        ).limit(10).all()
        
        top_searches = [{"query": r.query or "", "count": r.count} for r in top_searches_query]
        
        return {
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "pending_tasks": pending_tasks,
            "total_documents": total_documents,
            "total_users": total_users,
            "top_searches": top_searches
        }
