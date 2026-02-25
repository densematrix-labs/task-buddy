import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { chat } from '../lib/api';
import { useStore } from '../hooks/useStore';
import './AiBuddy.css';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

export default function AiBuddy() {
  const { t } = useTranslation();
  const deviceId = useStore((state) => state.deviceId);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: t('buddy.greeting'), isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !deviceId) return;

    const userMessage: Message = {
      id: Date.now(),
      text: input.trim(),
      isUser: true
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chat(input.trim(), deviceId);
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: response.response,
        isUser: false
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: t('buddy.error'),
        isUser: false
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button 
        className={`buddy-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('buddy.toggle')}
      >
        {isOpen ? '×' : '💬'}
      </button>

      {isOpen && (
        <div className="buddy-panel">
          <div className="buddy-header">
            <span className="buddy-avatar">🤖</span>
            <span className="buddy-name">{t('buddy.name')}</span>
          </div>

          <div className="buddy-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`buddy-message ${msg.isUser ? 'user' : 'ai'}`}
              >
                {msg.text}
              </div>
            ))}
            {isLoading && (
              <div className="buddy-message ai typing">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            )}
          </div>

          <div className="buddy-input-area">
            <input
              type="text"
              className="buddy-input"
              placeholder={t('buddy.placeholder')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
            />
            <button
              className="buddy-send"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
