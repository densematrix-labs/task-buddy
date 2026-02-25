import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './TaskInput.css';

interface TaskInputProps {
  onAdd: (title: string) => void;
  onBreakdown: (task: string) => void;
  isLoading: boolean;
}

export default function TaskInput({ onAdd, onBreakdown, isLoading }: TaskInputProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !isLoading) {
      onAdd(value.trim());
      setValue('');
    }
  };

  const handleBreakdown = () => {
    if (value.trim() && !isLoading) {
      onBreakdown(value.trim());
    }
  };

  return (
    <form className="task-input-form" onSubmit={handleSubmit}>
      <div className="input-wrapper">
        <input
          type="text"
          className="task-input"
          placeholder={t('task.placeholder')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={isLoading}
          data-testid="task-input"
        />
      </div>
      <div className="input-actions">
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!value.trim() || isLoading}
        >
          {t('task.add')}
        </button>
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={handleBreakdown}
          disabled={!value.trim() || isLoading}
          title={t('task.breakdownTooltip')}
        >
          ✨ {t('task.breakdown')}
        </button>
      </div>
    </form>
  );
}
