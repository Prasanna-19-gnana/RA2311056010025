import React from 'react';
import type { NotificationItem } from "../services/notificationService";

type KnownType = 'Result' | 'Placement' | 'Event' | string;

interface NotificationCardProps {
  notification: NotificationItem;
}

function formatTimestamp(ts?: string): string {
  if (!ts) return '';
  try {
    const d = new Date(ts);
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d);
  } catch {
    return ts;
  }
}

export function NotificationCard({ notification }: NotificationCardProps) {
  const { ID, Type, Message, Timestamp } = notification;

  return (
    <article
      className={`notification-card notification-card--${Type.toLowerCase()}`}
      aria-labelledby={`notification-${ID}-title`}
      aria-describedby={`notification-${ID}-message`}
      data-notification-id={ID}
    >
      <header className="notification-card__header">
        <span
          className="notification-card__badge"
          aria-hidden="false"
          role="status"
          aria-label={`Notification type ${Type}`}
        >
          {Type}
        </span>
        <time
          className="notification-card__time"
          dateTime={Timestamp ?? ''}
          title={Timestamp ?? ''}
        >
          {formatTimestamp(Timestamp)}
        </time>
      </header>

      <div className="notification-card__body">
        <p id={`notification-${ID}-message`} className="notification-card__message">
          {Message}
        </p>
      </div>
    </article>
  );
}

export default NotificationCard;
