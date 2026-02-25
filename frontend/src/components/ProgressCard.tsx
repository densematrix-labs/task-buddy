import { useTranslation } from 'react-i18next';
import { useStore } from '../hooks/useStore';
import './ProgressCard.css';

export default function ProgressCard() {
  const { t } = useTranslation();
  const progress = useStore((state) => state.progress);

  if (!progress) return null;

  return (
    <div className="progress-card">
      <div className="progress-stat">
        <span className="progress-value">{progress.today_completed}</span>
        <span className="progress-label">{t('progress.todayCompleted')}</span>
      </div>
      <div className="progress-divider" />
      <div className="progress-stat">
        <span className="progress-value streak">🔥 {progress.streak_days}</span>
        <span className="progress-label">{t('progress.streak')}</span>
      </div>
      <div className="progress-divider" />
      <div className="progress-stat">
        <span className="progress-value">{progress.total_completed}</span>
        <span className="progress-label">{t('progress.total')}</span>
      </div>
    </div>
  );
}
