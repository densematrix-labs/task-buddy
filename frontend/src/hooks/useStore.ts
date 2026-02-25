import { create } from 'zustand';
import { Task, Progress } from '../lib/api';

interface AppState {
  tasks: Task[];
  progress: Progress | null;
  deviceId: string | null;
  isLoading: boolean;
  error: string | null;
  
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: number, updates: Partial<Task>) => void;
  removeTask: (taskId: number) => void;
  setProgress: (progress: Progress) => void;
  setDeviceId: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  tasks: [],
  progress: null,
  deviceId: null,
  isLoading: false,
  error: null,
  
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({
    tasks: [task, ...state.tasks]
  })),
  
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === taskId ? { ...t, ...updates } : t
    )
  })),
  
  removeTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== taskId)
  })),
  
  setProgress: (progress) => set({ progress }),
  setDeviceId: (deviceId) => set({ deviceId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error })
}));
