const API_BASE = import.meta.env.PROD ? '' : '';

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  parent_id?: number;
  created_at: string;
  completed_at?: string;
  subtasks: Task[];
}

export interface TaskBreakdown {
  original_task: string;
  subtasks: string[];
  encouragement: string;
}

export interface ChatResponse {
  response: string;
  encouragement: boolean;
}

export interface Progress {
  today_completed: number;
  today_created: number;
  streak_days: number;
  total_completed: number;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const errorMessage = typeof data.detail === 'string'
      ? data.detail
      : data.detail?.error || data.detail?.message || `Request failed: ${response.status}`;
    throw new Error(errorMessage);
  }
  return response.json();
}

export async function getTasks(deviceId: string): Promise<Task[]> {
  const response = await fetch(`${API_BASE}/api/tasks?device_id=${deviceId}`);
  return handleResponse<Task[]>(response);
}

export async function createTask(
  title: string,
  deviceId: string,
  description?: string,
  parentId?: number
): Promise<Task> {
  const response = await fetch(`${API_BASE}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description,
      parent_id: parentId,
      device_id: deviceId
    })
  });
  return handleResponse<Task>(response);
}

export async function updateTask(
  taskId: number,
  deviceId: string,
  updates: { title?: string; description?: string; completed?: boolean }
): Promise<Task> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}?device_id=${deviceId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return handleResponse<Task>(response);
}

export async function deleteTask(taskId: number, deviceId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}?device_id=${deviceId}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    const errorMessage = typeof data.detail === 'string'
      ? data.detail
      : data.detail?.error || data.detail?.message || 'Delete failed';
    throw new Error(errorMessage);
  }
}

export async function breakdownTask(task: string, deviceId: string): Promise<TaskBreakdown> {
  const response = await fetch(`${API_BASE}/api/tasks/breakdown`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task, device_id: deviceId })
  });
  return handleResponse<TaskBreakdown>(response);
}

export async function chat(message: string, deviceId: string): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, device_id: deviceId })
  });
  return handleResponse<ChatResponse>(response);
}

export async function getProgress(deviceId: string): Promise<Progress> {
  const response = await fetch(`${API_BASE}/api/progress?device_id=${deviceId}`);
  return handleResponse<Progress>(response);
}
