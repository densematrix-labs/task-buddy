import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as api from '../lib/api';

describe('API module', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('error handling', () => {
    it('handles string error detail', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: "Something went wrong" })
      });

      await expect(api.getTasks('device-1'))
        .rejects.toThrow("Something went wrong");
    });

    it('handles object error detail with error field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 402,
        json: () => Promise.resolve({
          detail: { error: "No tokens remaining", code: "payment_required" }
        })
      });

      await expect(api.getTasks('device-1'))
        .rejects.toThrow("No tokens remaining");
    });

    it('handles object error detail with message field', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          detail: { message: "Invalid input" }
        })
      });

      await expect(api.getTasks('device-1'))
        .rejects.toThrow("Invalid input");
    });

    it('never throws [object Object]', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({
          detail: { someField: "value" }
        })
      });

      try {
        await api.getTasks('device-1');
      } catch (e) {
        expect((e as Error).message).not.toContain('[object Object]');
        expect((e as Error).message).not.toContain('object Object');
      }
    });
  });

  describe('getTasks', () => {
    it('fetches tasks successfully', async () => {
      const mockTasks = [{ id: 1, title: 'Test', completed: false }];
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTasks)
      });

      const result = await api.getTasks('device-1');
      expect(result).toEqual(mockTasks);
      expect(fetch).toHaveBeenCalledWith('/api/tasks?device_id=device-1');
    });
  });

  describe('createTask', () => {
    it('creates task successfully', async () => {
      const mockTask = { id: 1, title: 'New Task', completed: false };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTask)
      });

      const result = await api.createTask('New Task', 'device-1');
      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTask', () => {
    it('updates task successfully', async () => {
      const mockTask = { id: 1, title: 'Updated', completed: true };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockTask)
      });

      const result = await api.updateTask(1, 'device-1', { completed: true });
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    it('deletes task successfully', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({})
      });

      await expect(api.deleteTask(1, 'device-1')).resolves.not.toThrow();
    });
  });

  describe('breakdownTask', () => {
    it('breaks down task successfully', async () => {
      const mockBreakdown = {
        original_task: 'Big task',
        subtasks: ['Step 1', 'Step 2'],
        encouragement: 'You got this!'
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBreakdown)
      });

      const result = await api.breakdownTask('Big task', 'device-1');
      expect(result).toEqual(mockBreakdown);
    });
  });

  describe('chat', () => {
    it('chats successfully', async () => {
      const mockResponse = { response: 'Hello!', encouragement: true };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await api.chat('Hi', 'device-1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProgress', () => {
    it('gets progress successfully', async () => {
      const mockProgress = {
        today_completed: 5,
        today_created: 3,
        streak_days: 7,
        total_completed: 100
      };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProgress)
      });

      const result = await api.getProgress('device-1');
      expect(result).toEqual(mockProgress);
    });
  });
});
