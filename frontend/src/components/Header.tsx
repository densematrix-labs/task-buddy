import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import './Header.css';

export default function Header() {
  const { t } = useTranslation();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">✓</span>
          <h1 className="logo-text">{t('app.name')}</h1>
        </div>
        <div className="header-actions">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
