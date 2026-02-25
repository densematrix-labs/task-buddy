import pytest
from fastapi.testclient import TestClient

DEVICE_ID = "test-device-123"

class TestHealth:
    def test_health_endpoint(self, client: TestClient):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
    
    def test_api_health_endpoint(self, client: TestClient):
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

class TestTasks:
    def test_get_empty_tasks(self, client: TestClient):
        response = client.get(f"/api/tasks?device_id={DEVICE_ID}")
        assert response.status_code == 200
        assert response.json() == []
    
    def test_create_task(self, client: TestClient):
        response = client.post("/api/tasks", json={
            "title": "Test task",
            "description": "Test description",
            "device_id": DEVICE_ID
        })
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test task"
        assert data["description"] == "Test description"
        assert data["completed"] == False
        assert "id" in data
    
    def test_get_tasks_after_create(self, client: TestClient):
        # Create task
        client.post("/api/tasks", json={
            "title": "Task 1",
            "device_id": DEVICE_ID
        })
        
        # Get tasks
        response = client.get(f"/api/tasks?device_id={DEVICE_ID}")
        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 1
        assert tasks[0]["title"] == "Task 1"
    
    def test_update_task_title(self, client: TestClient):
        # Create task
        create_response = client.post("/api/tasks", json={
            "title": "Original",
            "device_id": DEVICE_ID
        })
        task_id = create_response.json()["id"]
        
        # Update title
        response = client.patch(
            f"/api/tasks/{task_id}?device_id={DEVICE_ID}",
            json={"title": "Updated"}
        )
        assert response.status_code == 200
        assert response.json()["title"] == "Updated"
    
    def test_complete_task(self, client: TestClient):
        # Create task
        create_response = client.post("/api/tasks", json={
            "title": "To complete",
            "device_id": DEVICE_ID
        })
        task_id = create_response.json()["id"]
        
        # Complete task
        response = client.patch(
            f"/api/tasks/{task_id}?device_id={DEVICE_ID}",
            json={"completed": True}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["completed"] == True
        assert data["completed_at"] is not None
    
    def test_delete_task(self, client: TestClient):
        # Create task
        create_response = client.post("/api/tasks", json={
            "title": "To delete",
            "device_id": DEVICE_ID
        })
        task_id = create_response.json()["id"]
        
        # Delete task
        response = client.delete(f"/api/tasks/{task_id}?device_id={DEVICE_ID}")
        assert response.status_code == 200
        
        # Verify deleted
        get_response = client.get(f"/api/tasks?device_id={DEVICE_ID}")
        assert len(get_response.json()) == 0
    
    def test_update_nonexistent_task(self, client: TestClient):
        response = client.patch(
            f"/api/tasks/99999?device_id={DEVICE_ID}",
            json={"title": "Test"}
        )
        assert response.status_code == 404
    
    def test_delete_nonexistent_task(self, client: TestClient):
        response = client.delete(f"/api/tasks/99999?device_id={DEVICE_ID}")
        assert response.status_code == 404
    
    def test_create_subtask(self, client: TestClient):
        # Create parent task
        parent_response = client.post("/api/tasks", json={
            "title": "Parent task",
            "device_id": DEVICE_ID
        })
        parent_id = parent_response.json()["id"]
        
        # Create subtask
        subtask_response = client.post("/api/tasks", json={
            "title": "Subtask",
            "parent_id": parent_id,
            "device_id": DEVICE_ID
        })
        assert subtask_response.status_code == 200
        assert subtask_response.json()["parent_id"] == parent_id

class TestProgress:
    def test_get_progress_empty(self, client: TestClient):
        response = client.get(f"/api/progress?device_id={DEVICE_ID}")
        assert response.status_code == 200
        data = response.json()
        assert data["today_completed"] == 0
        assert data["today_created"] == 0
        assert data["streak_days"] == 0
        assert data["total_completed"] == 0
    
    def test_progress_after_creating_task(self, client: TestClient):
        # Create task
        client.post("/api/tasks", json={
            "title": "Test",
            "device_id": DEVICE_ID
        })
        
        # Check progress
        response = client.get(f"/api/progress?device_id={DEVICE_ID}")
        data = response.json()
        assert data["today_created"] == 1
    
    def test_progress_after_completing_task(self, client: TestClient):
        # Create and complete task
        create_response = client.post("/api/tasks", json={
            "title": "Test",
            "device_id": DEVICE_ID
        })
        task_id = create_response.json()["id"]
        
        client.patch(
            f"/api/tasks/{task_id}?device_id={DEVICE_ID}",
            json={"completed": True}
        )
        
        # Check progress
        response = client.get(f"/api/progress?device_id={DEVICE_ID}")
        data = response.json()
        assert data["today_completed"] == 1
        assert data["total_completed"] == 1
        assert data["streak_days"] == 1

class TestMetrics:
    def test_metrics_endpoint(self, client: TestClient):
        response = client.get("/metrics")
        assert response.status_code == 200
        assert b"http_requests_total" in response.content

class TestErrorResponses:
    def test_404_error_detail_format(self, client: TestClient):
        response = client.patch(
            f"/api/tasks/99999?device_id={DEVICE_ID}",
            json={"title": "Test"}
        )
        assert response.status_code == 404
        data = response.json()
        detail = data.get("detail")
        # detail should be string
        assert isinstance(detail, str), f"detail should be string: {detail}"
        assert "not found" in detail.lower()
    
    def test_422_validation_error_format(self, client: TestClient):
        # Missing required field
        response = client.post("/api/tasks", json={
            "description": "Missing title and device_id"
        })
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data
