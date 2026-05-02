import { Log } from '../utils/logger';

export type NotificationItem = {
  id: string;
  type: 'Result' | 'Placement' | 'Event' | string;
  message: string;
  createdAt?: string;
  [key: string]: unknown;
};

type Params = {
  page?: number;
  limit?: number;
  notificationType?: string;
};

const ENDPOINT = 'http://20.207.122.201/evaluation-service/notifications';

export default async function getNotifications({
  page = 1,
  limit = 10,
  notificationType = 'All',
}: Params = {}): Promise<NotificationItem[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  if (!token) {
    await Log('frontend', 'error', 'auth', 'Missing access token');
    throw new Error('Missing access token');
  }

  const params = new URLSearchParams();
  if (typeof limit === 'number') params.append('limit', String(limit));
  if (typeof page === 'number') params.append('page', String(page));
  if (notificationType && notificationType !== 'All') params.append('notification_type', notificationType);

  const url = params.toString() ? `${ENDPOINT}?${params.toString()}` : ENDPOINT;

  await Log('frontend', 'info', 'api', `Fetching notifications: ${url}`);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    await Log('frontend', 'error', 'api', `Notification API failed: ${response.status}`);
    const msg = data && data.message ? data.message : `Status ${response.status}`;
    throw new Error(msg);
  }

  await Log('frontend', 'info', 'api', 'Notifications fetched successfully');

  // Normalize to our NotificationItem shape
  const items: any[] = (data && (data.notifications || data.data || data)) || [];
  return items.map((it) => ({
    id: it.id ?? it.ID ?? String(it.id ?? it.ID ?? ''),
    type: it.type ?? it.Type ?? 'Event',
    message: it.message ?? it.Message ?? String(it.message ?? it.Message ?? ''),
    createdAt: it.createdAt ?? it.createdAt ?? it.Timestamp ?? it.timestamp,
    ...it,
  }));
}