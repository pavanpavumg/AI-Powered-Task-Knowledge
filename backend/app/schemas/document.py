from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.task import UserMinOut

class DocumentBase(BaseModel):
    title: str
    content: str
    file_path: Optional[str] = None

class DocumentCreate(DocumentBase):
    pass

class DocumentOut(DocumentBase):
    id: int
    uploaded_by_id: int
    created_at: datetime
    uploader: UserMinOut

    class Config:
        from_attributes = True
