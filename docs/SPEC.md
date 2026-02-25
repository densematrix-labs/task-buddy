# ADHD Task Buddy — AI-Powered Task Management for ADHD

## Product Overview

| Item | Value |
|------|-------|
| Product Name | ADHD Task Buddy |
| Target Audience | People with ADHD who struggle with task management |
| Core Problem | Breaking down overwhelming tasks, staying motivated, completing daily goals |
| Differentiation | Focus on **task management + AI decomposition** (vs Focus Buddy which is for focus sessions with ambient sounds) |

## Core Features (MVP)

1. **AI Task Breakdown** — Input a big task → AI breaks it into manageable micro-steps
2. **Task List Management** — Add, complete, delete tasks with satisfying interactions
3. **Celebration System** — Confetti, sounds, encouraging messages when completing tasks
4. **Daily Progress** — Visual progress tracker with streaks
5. **AI Companion Chat** — Get encouragement, reminders, and motivation from AI buddy

## Tech Stack

- **Frontend**: React + Vite (TypeScript)
- **Backend**: FastAPI (Python)
- **AI**: LLM Proxy (llm-proxy.densematrix.ai)
- **Database**: SQLite
- **Deployment**: Docker → langsheng

## Design Direction

**Aesthetic: "Warm Minimal"** — Calm, low-distraction interface with gentle warmth

- **Colors**: Soft warm tones (cream, peach, gentle greens) — calming not stimulating
- **Typography**: Friendly, readable fonts — not too formal
- **Layout**: Clear hierarchy, generous whitespace, no visual noise
- **Interactions**: Smooth, satisfying animations — task completion feels rewarding
- **Celebrations**: Confetti, gentle sounds, encouraging AI messages

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/tasks` | GET | Get all tasks |
| `/api/tasks` | POST | Create new task |
| `/api/tasks/{id}` | PATCH | Update task (complete, edit) |
| `/api/tasks/{id}` | DELETE | Delete task |
| `/api/tasks/breakdown` | POST | AI breaks down task into steps |
| `/api/chat` | POST | AI companion chat |
| `/api/progress` | GET | Get daily/weekly progress stats |

## Ports

- Frontend: 30059
- Backend: 30060

## Deployment

- URL: https://task-buddy.demo.densematrix.ai
- Server: langsheng (39.109.116.180)

## Completion Criteria

- [ ] Task CRUD operations work
- [ ] AI task breakdown works
- [ ] Celebration animations on task completion
- [ ] Daily progress tracking
- [ ] AI companion chat works
- [ ] Deployed to task-buddy.demo.densematrix.ai
- [ ] Health check passes
