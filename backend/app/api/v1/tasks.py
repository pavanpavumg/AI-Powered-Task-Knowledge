from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import require_role, get_current_user
from app.models.user import User
from app.services.task_service import TaskService
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

router = APIRouter()

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: int

class TaskStatusUpdate(BaseModel):
    status: str

class TaskOut(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    status: str
    assigned_to: int
    assigned_to_name: str
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=TaskOut)
def create_task(
    task_in: TaskCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    task = TaskService.create_task(
        db,
        title=task_in.title,
        description=task_in.description,
        assigned_to=task_in.assigned_to,
        creator_id=current_user.id
    )
    
    assignee_name = task.assignee.name if task.assignee else "Unassigned"
    
    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status.value,
        assigned_to=task.assigned_to,
        assigned_to_name=assignee_name,
        created_by=task.created_by,
        created_at=task.created_at
    )

@router.get("/", response_model=List[TaskOut])
def list_tasks(
    status: Optional[str] = Query(None),
    assigned_to: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = TaskService.get_tasks(
        db,
        current_user=current_user,
        status_filter=status,
        assigned_to_filter=assigned_to
    )
    
    results = []
    for task in tasks:
        assignee_name = task.assignee.name if task.assignee else "Unassigned"
        results.append(
            TaskOut(
                id=task.id,
                title=task.title,
                description=task.description,
                status=task.status.value,
                assigned_to=task.assigned_to,
                assigned_to_name=assignee_name,
                created_by=task.created_by,
                created_at=task.created_at
            )
        )
    return results

@router.patch("/{id}/status", response_model=TaskOut)
def update_task_status(
    id: int,
    status_update: TaskStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = TaskService.update_task_status(
        db,
        task_id=id,
        new_status=status_update.status,
        user_id=current_user.id
    )
    
    assignee_name = task.assignee.name if task.assignee else "Unassigned"
    
    return TaskOut(
        id=task.id,
        title=task.title,
        description=task.description,
        status=task.status.value,
        assigned_to=task.assigned_to,
        assigned_to_name=assignee_name,
        created_by=task.created_by,
        created_at=task.created_at
    )
