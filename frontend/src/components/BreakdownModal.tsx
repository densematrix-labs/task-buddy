import { useTranslation } from 'react-i18next';
import { TaskBreakdown } from '../lib/api';
import './BreakdownModal.css';

interface BreakdownModalProps {
  breakdown: TaskBreakdown | null;
  onClose: () => void;
  onAddAll: (subtasks: string[]) => void;
}

export default function BreakdownModal({ breakdown, onClose, onAddAll }: BreakdownModalProps) {
  const { t } = useTranslation();

  if (!breakdown) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <span className="modal-icon">✨</span>
          <h2 className="modal-title">{t('breakdown.title')}</h2>
        </div>

        <div className="original-task">
          <span className="label">{t('breakdown.original')}</span>
          <p>{breakdown.original_task}</p>
        </div>

        <div className="subtasks-list">
          <span className="label">{t('breakdown.steps')}</span>
          {breakdown.subtasks.map((subtask, index) => (
            <div key={index} className="subtask-item">
              <span className="subtask-number">{index + 1}</span>
              <span className="subtask-text">{subtask}</span>
            </div>
          ))}
        </div>

        <div className="encouragement">
          <span className="encouragement-icon">💪</span>
          <p>{breakdown.encouragement}</p>
        </div>

        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            {t('breakdown.cancel')}
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => {
              onAddAll(breakdown.subtasks);
              onClose();
            }}
          >
            {t('breakdown.addAll')}
          </button>
        </div>
      </div>
    </div>
  );
}
