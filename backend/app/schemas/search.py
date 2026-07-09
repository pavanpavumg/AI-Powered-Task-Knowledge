from pydantic import BaseModel
from typing import List, Optional, Union
from app.schemas.task import TaskOut
from app.schemas.document import DocumentOut

class SearchResultItem(BaseModel):
    type: str  # "task" or "document"
    score: float
    item: Union[TaskOut, DocumentOut]

class SearchResponse(BaseModel):
    query: str
    results: List[SearchResultItem]
