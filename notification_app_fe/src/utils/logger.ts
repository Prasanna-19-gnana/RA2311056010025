export type Stack = 'web' | 'backend' | 'worker' | 'frontend' | 'other';
export type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type PackageName = 'notification_app_fe' | 'logging_middleware' | 'evaluation_service' | 'page' | 'other';

interface LogPayload {
  stack: Stack;
  level: Level;
  package: PackageName;
  message: string;
}

const LOG_ENDPOINT = 'http://20.207.122.201/evaluation-service/logs';

export async function Log(
  stack: Stack,
  level: Level,
  pkg: PackageName,
  message: string
): Promise<void> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    console.error('Log: missing access_token in localStorage; log not sent', {
      stack,
      level,
      package: pkg,
      message,
    });
    return;
  }

  const payload: LogPayload = {
    stack,
    level,
    package: pkg,
    message,
  };

  try {
    const res = await fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // leave data as raw text when JSON parse fails
    }

    if (!res.ok) {
      console.error('Log: API returned error', { status: res.status, body: data });
    } else {
      console.log('Log: API response', data);
    }
  } catch (err) {
    console.error('Log: network or fetch error', err);
  }
}

export default Log;
