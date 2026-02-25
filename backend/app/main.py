from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List
import time

from app.database import get_db, engine, Base
from app.models import Task, DailyProgress
from app.schemas import (
    TaskCreate, TaskUpdate, TaskResponse,
    TaskBreakdownRequest, TaskBreakdownResponse,
    ChatRequest, ChatResponse, ProgressResponse
)
from app.metrics import (
    metrics_router, http_requests_total, http_request_duration_seconds,
    tasks_created_total, tasks_completed_total, ai_breakdown_calls_total,
    ai_chat_calls_total, TOOL_NAME
)
from app.llm_service import breakdown_task, chat_with_buddy
from app.config import get_settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ADHD Task Buddy API",
    description="AI-powered task management for ADHD",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include metrics router
app.include_router(metrics_router)

@app.middleware("http")
async def metrics_middleware(request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    endpoint = request.url.path
    method = request.method
    status = response.status_code
    
    http_requests_total.labels(
        tool=TOOL_NAME,
        endpoint=endpoint,
        method=method,
        status=status
    ).inc()
    
    http_request_duration_seconds.labels(
        tool=TOOL_NAME,
        endpoint=endpoint,
        method=method
    ).observe(duration)
    
    return response

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "task-buddy"}

@app.get("/api/health")
async def api_health():
    return {"status": "healthy", "service": "task-buddy"}

# Task CRUD
@app.get("/api/tasks", response_model=List[TaskResponse])
async def get_tasks(
    device_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get all tasks for a device"""
    tasks = db.query(Task).filter(
        Task.device_id == device_id,
        Task.parent_id == None
    ).order_by(Task.created_at.desc()).all()
    return tasks

@app.post("/api/tasks", response_model=TaskResponse)
async def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db)
):
    """Create a new task"""
    db_task = Task(
        title=task.title,
        description=task.description,
        parent_id=task.parent_id,
        device_id=task.device_id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Update daily progress
    update_daily_progress(db, task.device_id, created=1)
    
    tasks_created_total.labels(tool=TOOL_NAME).inc()
    return db_task

@app.patch("/api/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    device_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Update a task"""
    db_task = db.query(Task).filter(
        Task.id == task_id,
        Task.device_id == device_id
    ).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task_update.title is not None:
        db_task.title = task_update.title
    if task_update.description is not None:
        db_task.description = task_update.description
    if task_update.completed is not None:
        db_task.completed = task_update.completed
        if task_update.completed:
            db_task.completed_at = datetime.utcnow()
            update_daily_progress(db, device_id, completed=1)
            tasks_completed_total.labels(tool=TOOL_NAME).inc()
    
    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/api/tasks/{task_id}")
async def delete_task(
    task_id: int,
    device_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Delete a task"""
    db_task = db.query(Task).filter(
        Task.id == task_id,
        Task.device_id == device_id
    ).first()
    
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Delete subtasks first
    db.query(Task).filter(Task.parent_id == task_id).delete()
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}

# AI Features
@app.post("/api/tasks/breakdown", response_model=TaskBreakdownResponse)
async def breakdown_task_endpoint(
    request: TaskBreakdownRequest,
    db: Session = Depends(get_db)
):
    """Break down a task into smaller steps using AI"""
    ai_breakdown_calls_total.labels(tool=TOOL_NAME).inc()
    result = await breakdown_task(request.task)
    return TaskBreakdownResponse(
        original_task=request.task,
        subtasks=result["subtasks"],
        encouragement=result["encouragement"]
    )

@app.post("/api/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """Chat with the AI buddy"""
    ai_chat_calls_total.labels(tool=TOOL_NAME).inc()
    result = await chat_with_buddy(request.message)
    return ChatResponse(**result)

# Progress
@app.get("/api/progress", response_model=ProgressResponse)
async def get_progress(
    device_id: str = Query(...),
    db: Session = Depends(get_db)
):
    """Get progress stats"""
    today = date.today().isoformat()
    
    # Today's progress
    today_progress = db.query(DailyProgress).filter(
        DailyProgress.device_id == device_id,
        DailyProgress.date == today
    ).first()
    
    # Calculate streak
    streak = calculate_streak(db, device_id)
    
    # Total completed
    total = db.query(Task).filter(
        Task.device_id == device_id,
        Task.completed == True
    ).count()
    
    return ProgressResponse(
        today_completed=today_progress.tasks_completed if today_progress else 0,
        today_created=today_progress.tasks_created if today_progress else 0,
        streak_days=streak,
        total_completed=total
    )

def update_daily_progress(db: Session, device_id: str, completed: int = 0, created: int = 0):
    """Update daily progress counters"""
    today = date.today().isoformat()
    progress = db.query(DailyProgress).filter(
        DailyProgress.device_id == device_id,
        DailyProgress.date == today
    ).first()
    
    if not progress:
        progress = DailyProgress(
            device_id=device_id,
            date=today,
            tasks_completed=0,
            tasks_created=0
        )
        db.add(progress)
    
    progress.tasks_completed += completed
    progress.tasks_created += created
    db.commit()

def calculate_streak(db: Session, device_id: str) -> int:
    """Calculate consecutive days with completed tasks"""
    from datetime import timedelta
    
    streak = 0
    current_date = date.today()
    
    while True:
        day_str = current_date.isoformat()
        progress = db.query(DailyProgress).filter(
            DailyProgress.device_id == device_id,
            DailyProgress.date == day_str,
            DailyProgress.tasks_completed > 0
        ).first()
        
        if progress:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break
        
        if streak > 365:  # Safety limit
            break
    
    return streak

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
