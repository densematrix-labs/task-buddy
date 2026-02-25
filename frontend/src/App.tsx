import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Header from './components/Header';
import ProgressCard from './components/ProgressCard';
import TaskInput from './components/TaskInput';
import TaskList from './components/TaskList';
import AiBuddy from './components/AiBuddy';
import BreakdownModal from './components/BreakdownModal';
import { useStore } from './hooks/useStore';
import { getDeviceId } from './lib/fingerprint';
import { celebrateCompletion } from './lib/confetti';
import * as api from './lib/api';
import './App.css';

export default function App() {
  const { t } = useTranslation();
  const {
    tasks,
    deviceId,
    isLoading,
    setTasks,
    addTask,
    updateTask,
    removeTask,
    setProgress,
    setDeviceId,
    setLoading,
    setError
  } = useStore();

  const [breakdown, setBreakdown] = useState<api.TaskBreakdown | null>(null);

  // Initialize device ID
  useEffect(() => {
    getDeviceId().then(setDeviceId);
  }, [setDeviceId]);

  // Load tasks and progress
  const loadData = useCallback(async () => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const [tasksData, progressData] = await Promise.all([
        api.getTasks(deviceId),
        api.getProgress(deviceId)
      ]);
      setTasks(tasksData);
      setProgress(progressData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [deviceId, setTasks, setProgress, setLoading, setError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddTask = async (title: string) => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const newTask = await api.createTask(title, deviceId);
      addTask(newTask);
      const progress = await api.getProgress(deviceId);
      setProgress(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };

  const handleBreakdown = async (task: string) => {
    if (!deviceId) return;
    setLoading(true);
    try {
      const result = await api.breakdownTask(task, deviceId);
      setBreakdown(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to break down task');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllSubtasks = async (subtasks: string[]) => {
    if (!deviceId) return;
    setLoading(true);
    try {
      for (const subtask of subtasks) {
        const newTask = await api.createTask(subtask, deviceId);
        addTask(newTask);
      }
      const progress = await api.getProgress(deviceId);
      setProgress(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subtasks');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (taskId: number) => {
    if (!deviceId) return;
    try {
      await api.updateTask(taskId, deviceId, { completed: true });
      updateTask(taskId, { completed: true, completed_at: new Date().toISOString() });
      celebrateCompletion();
      const progress = await api.getProgress(deviceId);
      setProgress(progress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete task');
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!deviceId) return;
    try {
      await api.deleteTask(taskId, deviceId);
      removeTask(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="hero">
          <h2 className="hero-title">{t('hero.title')}</h2>
          <p className="hero-subtitle">{t('hero.subtitle')}</p>
        </div>

        <ProgressCard />
        
        <TaskInput
          onAdd={handleAddTask}
          onBreakdown={handleBreakdown}
          isLoading={isLoading}
        />

        <TaskList
          tasks={tasks}
          onComplete={handleComplete}
          onDelete={handleDelete}
        />
      </main>

      <AiBuddy />

      <BreakdownModal
        breakdown={breakdown}
        onClose={() => setBreakdown(null)}
        onAddAll={handleAddAllSubtasks}
      />
    </div>
  );
}
