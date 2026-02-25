from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    parent_id: Optional[int] = None

class TaskCreate(TaskBase):
    device_id: str

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    completed: bool
    created_at: datetime
    completed_at: Optional[datetime] = None
    subtasks: List["TaskResponse"] = []
    
    class Config:
        from_attributes = True

class TaskBreakdownRequest(BaseModel):
    task: str
    device_id: str

class TaskBreakdownResponse(BaseModel):
    original_task: str
    subtasks: List[str]
    encouragement: str

class ChatRequest(BaseModel):
    message: str
    device_id: str

class ChatResponse(BaseModel):
    response: str
    encouragement: bool

class ProgressResponse(BaseModel):
    today_completed: int
    today_created: int
    streak_days: int
    total_completed: int

# Avoid circular import
TaskResponse.model_rebuild()
