from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class UserMinOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None
    assignee_id: Optional[int] = None

class TaskOut(TaskBase):
    id: int
    creator_id: int
    created_at: datetime
    updated_at: datetime
    creator: UserMinOut
    assignee: Optional[UserMinOut] = None

    class Config:
        from_attributes = True

class TaskStatusUpdate(BaseModel):
    status: str
