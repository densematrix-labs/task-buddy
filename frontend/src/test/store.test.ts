import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from '../hooks/useStore';

describe('useStore', () => {
  beforeEach(() => {
    useStore.setState({
      tasks: [],
      progress: null,
      deviceId: null,
      isLoading: false,
      error: null
    });
  });

  it('sets tasks', () => {
    const tasks = [{ id: 1, title: 'Test', completed: false, created_at: '', subtasks: [] }];
    useStore.getState().setTasks(tasks);
    expect(useStore.getState().tasks).toEqual(tasks);
  });

  it('adds task', () => {
    const task = { id: 1, title: 'New Task', completed: false, created_at: '', subtasks: [] };
    useStore.getState().addTask(task);
    expect(useStore.getState().tasks).toHaveLength(1);
    expect(useStore.getState().tasks[0]).toEqual(task);
  });

  it('updates task', () => {
    const task = { id: 1, title: 'Task', completed: false, created_at: '', subtasks: [] };
    useStore.getState().setTasks([task]);
    useStore.getState().updateTask(1, { completed: true });
    expect(useStore.getState().tasks[0].completed).toBe(true);
  });

  it('removes task', () => {
    const tasks = [
      { id: 1, title: 'Task 1', completed: false, created_at: '', subtasks: [] },
      { id: 2, title: 'Task 2', completed: false, created_at: '', subtasks: [] }
    ];
    useStore.getState().setTasks(tasks);
    useStore.getState().removeTask(1);
    expect(useStore.getState().tasks).toHaveLength(1);
    expect(useStore.getState().tasks[0].id).toBe(2);
  });

  it('sets progress', () => {
    const progress = {
      today_completed: 5,
      today_created: 3,
      streak_days: 7,
      total_completed: 100
    };
    useStore.getState().setProgress(progress);
    expect(useStore.getState().progress).toEqual(progress);
  });

  it('sets deviceId', () => {
    useStore.getState().setDeviceId('device-123');
    expect(useStore.getState().deviceId).toBe('device-123');
  });

  it('sets loading', () => {
    useStore.getState().setLoading(true);
    expect(useStore.getState().isLoading).toBe(true);
  });

  it('sets error', () => {
    useStore.getState().setError('Error message');
    expect(useStore.getState().error).toBe('Error message');
  });
});
