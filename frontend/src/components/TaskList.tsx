import { useTranslation } from 'react-i18next';
import { Task } from '../lib/api';
import TaskItem from './TaskItem';
import './TaskList.css';

interface TaskListProps {
  tasks: Task[];
  onComplete: (taskId: number) => void;
  onDelete: (taskId: number) => void;
}

export default function TaskList({ tasks, onComplete, onDelete }: TaskListProps) {
  const { t } = useTranslation();
  
  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📝</span>
        <p className="empty-text">{t('task.empty')}</p>
        <p className="empty-hint">{t('task.emptyHint')}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {pendingTasks.length > 0 && (
        <div className="task-section">
          <h3 className="section-title">{t('task.pending')}</h3>
          <div className="task-items">
            {pendingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={onComplete}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
      
      {completedTasks.length > 0 && (
        <div className="task-section">
          <h3 className="section-title completed">{t('task.completedSection')}</h3>
          <div className="task-items">
            {completedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={onComplete}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
