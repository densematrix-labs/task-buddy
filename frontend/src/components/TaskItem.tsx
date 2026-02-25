import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Task } from '../lib/api';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

export default function TaskItem({ task, onComplete, onDelete }: TaskItemProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleComplete = () => {
    if (!task.completed) {
      onComplete(task.id);
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(task.id), 300);
  };

  return (
    <div 
      className={`task-item ${task.completed ? 'completed' : ''} ${isDeleting ? 'deleting' : ''}`}
      data-testid="task-item"
    >
      <button 
        className="task-checkbox"
        onClick={handleComplete}
        aria-label={task.completed ? t('task.completed') : t('task.markComplete')}
      >
        {task.completed && <span className="checkmark">✓</span>}
      </button>
      
      <div className="task-content">
        <p className="task-title">{task.title}</p>
        {task.description && (
          <p className="task-description">{task.description}</p>
        )}
      </div>
      
      <button 
        className="task-delete"
        onClick={handleDelete}
        aria-label={t('task.delete')}
      >
        ×
      </button>
    </div>
  );
}
