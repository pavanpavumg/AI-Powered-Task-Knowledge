from sqlalchemy.orm import Session
from app.models.task import Task, TaskStatus
from app.models.user import User
from app.services.activity_service import log_activity
from fastapi import HTTPException, status
from typing import List, Optional

class TaskService:
    @staticmethod
    def create_task(db: Session, title: str, description: Optional[str], assigned_to: int, creator_id: int) -> Task:
        # Verify assignee exists
        assignee = db.query(User).filter(User.id == assigned_to).first()
        if not assignee:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Assigned user not found"
            )
        # Verify assignee has 'user' role
        if assignee.role.name != "user":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tasks can only be assigned to users with role 'user'"
            )
            
        db_task = Task(
            title=title,
            description=description,
            status=TaskStatus.pending,
            assigned_to=assigned_to,
            created_by=creator_id
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        
        # Log activity
        log_activity(
            db, 
            user_id=creator_id, 
            action="task_create", 
            details=f"Created task '{title}' (ID: {db_task.id}) assigned to user {assignee.email}"
        )
        
        return db_task

    @staticmethod
    def get_tasks(
        db: Session, 
        current_user: User, 
        status_filter: Optional[str] = None, 
        assigned_to_filter: Optional[int] = None
    ) -> List[Task]:
        query = db.query(Task)
        
        # Apply role scoping
        if current_user.role.name == "admin":
            if assigned_to_filter is not None:
                query = query.filter(Task.assigned_to == assigned_to_filter)
        else:
            query = query.filter(Task.assigned_to == current_user.id)
            
        # Apply conditional filter
        if status_filter:
            query = query.filter(Task.status == status_filter)
            
        return query.order_by(Task.created_at.desc()).all()

    @staticmethod
    def update_task_status(db: Session, task_id: int, new_status: str, user_id: int, completion_note: Optional[str] = None) -> Task:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
            
        # Verify task ownership
        if task.assigned_to != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update tasks assigned to you"
            )
            
        # Transition checks
        # 1. pending -> completed
        if task.status == TaskStatus.pending and new_status == TaskStatus.completed:
            if completion_note and len(completion_note) > 500:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Completion note cannot exceed 500 characters"
                )
            task.status = TaskStatus.completed
            task.completed_at = datetime.utcnow()
            task.completion_note = completion_note
            
        # 2. completed -> pending (reopen)
        elif task.status == TaskStatus.completed and new_status == TaskStatus.pending:
            if not task.completed_at:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot reopen this task: completed timestamp not recorded"
                )
                
            from datetime import timedelta
            time_diff = datetime.utcnow() - task.completed_at
            if time_diff > timedelta(hours=24):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Reopen window has expired"
                )
                
            task.status = TaskStatus.pending
            task.completed_at = None
            task.completion_note = None
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid status transition"
            )
            
        db.commit()
        db.refresh(task)
        
        # Log activity
        log_activity(
            db, 
            user_id=user_id, 
            action="task_update", 
            details=f"task_id={task_id} -> {new_status}"
        )
        
        return task

    @staticmethod
    def edit_task(db: Session, task_id: int, admin_id: int, update_data: dict) -> Task:
        task = db.query(Task).filter(Task.id == task_id).first()
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
            
        # Validate that the task is pending
        if task.status == TaskStatus.completed:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot edit a completed task"
            )
            
        # Perform updates
        if "title" in update_data:
            task.title = update_data["title"]
            
        if "description" in update_data:
            task.description = update_data["description"]
            
        if "assigned_to" in update_data:
            assigned_to = update_data["assigned_to"]
            assignee = db.query(User).filter(User.id == assigned_to).first()
            if not assignee:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Assigned user not found"
                )
            if assignee.role.name != "user":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tasks can only be assigned to users with role 'user'"
                )
            task.assigned_to = assigned_to
            
        db.commit()
        db.refresh(task)
        
        # Log activity
        log_activity(
            db,
            user_id=admin_id,
            action="task_edit",
            details=f"task_id={task_id}"
        )
        
        return task
