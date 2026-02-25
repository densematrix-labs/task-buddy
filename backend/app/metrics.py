import os
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter
from fastapi.responses import Response

TOOL_NAME = os.getenv("TOOL_NAME", "task-buddy")

# HTTP metrics
http_requests_total = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["tool", "endpoint", "method", "status"]
)

http_request_duration_seconds = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration in seconds",
    ["tool", "endpoint", "method"]
)

# Business metrics
tasks_created_total = Counter(
    "tasks_created_total",
    "Total tasks created",
    ["tool"]
)

tasks_completed_total = Counter(
    "tasks_completed_total",
    "Total tasks completed",
    ["tool"]
)

ai_breakdown_calls_total = Counter(
    "ai_breakdown_calls_total",
    "Total AI task breakdown calls",
    ["tool"]
)

ai_chat_calls_total = Counter(
    "ai_chat_calls_total",
    "Total AI chat calls",
    ["tool"]
)

active_users_gauge = Gauge(
    "active_users_gauge",
    "Number of active users (unique device_ids)",
    ["tool"]
)

metrics_router = APIRouter()

@metrics_router.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
