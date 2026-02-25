import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  })
}));

// Mock fingerprint
vi.mock('../lib/fingerprint', () => ({
  getDeviceId: vi.fn().mockResolvedValue('test-device-id')
}));

// Mock confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));
