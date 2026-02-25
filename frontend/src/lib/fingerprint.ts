import FingerprintJS from '@fingerprintjs/fingerprintjs';

let cachedDeviceId: string | null = null;

export async function getDeviceId(): Promise<string> {
  if (cachedDeviceId) return cachedDeviceId;
  
  // Try localStorage first
  const stored = localStorage.getItem('task-buddy-device-id');
  if (stored) {
    cachedDeviceId = stored;
    return stored;
  }
  
  // Generate new fingerprint
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    cachedDeviceId = result.visitorId;
    localStorage.setItem('task-buddy-device-id', cachedDeviceId);
    return cachedDeviceId;
  } catch {
    // Fallback to random ID
    cachedDeviceId = `tb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('task-buddy-device-id', cachedDeviceId);
    return cachedDeviceId;
  }
}
