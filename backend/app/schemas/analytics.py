from pydantic import BaseModel
from typing import Dict, Optional, List
from datetime import datetime

class ActivityLogOut(BaseModel):
    id: int
    user_id: int
    username: str
    action: str
    target_type: str
    target_id: Optional[int] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class SystemStats(BaseModel):
    total_tasks: int
    tasks_by_status: Dict[str, int]
    tasks_by_priority: Dict[str, int]
    total_documents: int
    total_users: int
