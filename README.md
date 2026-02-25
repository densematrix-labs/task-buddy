# Task Buddy — ADHD-Friendly Task Management

AI-powered task management designed for ADHD minds. Break down overwhelming tasks, celebrate wins, stay motivated.

🌐 **Live Demo**: https://task-buddy.demo.densematrix.ai

## Features

- ✨ **AI Task Breakdown** — Input a big task → AI breaks it into manageable micro-steps
- ✅ **Task Management** — Add, complete, delete tasks with satisfying interactions  
- 🎉 **Celebration System** — Confetti, sounds, encouraging messages when completing tasks
- 📊 **Daily Progress** — Visual progress tracker with streaks
- 💬 **AI Companion Chat** — Get encouragement, reminders, and motivation

## Tech Stack

- **Frontend**: React + Vite (TypeScript)
- **Backend**: Python FastAPI
- **AI**: LLM Proxy (Claude)
- **Database**: SQLite
- **Deployment**: Docker

## Quick Start

```bash
# Clone
git clone https://github.com/densematrix-labs/task-buddy.git
cd task-buddy

# Start with Docker
docker compose up -d

# Access
# Frontend: http://localhost:30059
# Backend: http://localhost:30060
```

## Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Tests
```bash
# Backend
cd backend && pytest --cov=app

# Frontend  
cd frontend && npm run test
```

## Ports

| Service | Port |
|---------|------|
| Frontend | 30059 |
| Backend | 30060 |

## Differentiation from Focus Buddy

- **Focus Buddy** = Pomodoro timer + ambient sounds (focus sessions)
- **Task Buddy** = Task management + AI decomposition (task completion)

## License

MIT
