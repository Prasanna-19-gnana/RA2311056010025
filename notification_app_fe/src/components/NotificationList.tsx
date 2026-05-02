import type { NotificationItem } from "../services/notificationService";
import NotificationCard from "./Notification";

interface NotificationListProps {
  notifications: NotificationItem[];
  loading: boolean;
  error: string | null;
}

export default function NotificationList({
  notifications,
  loading,
  error,
}: NotificationListProps) {
  if (loading) {
    return <div className="notification-list-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="notification-list-error">Error: {error}</div>;
  }

  if (notifications.length === 0) {
    return <div className="notification-list-empty">No notifications found.</div>;
  }

  return (
    <ul className="notification-list">
      {notifications.map((notification) => (
        <li key={notification.ID} className="notification-list__item">
          <NotificationCard notification={notification} />
        </li>
      ))}
    </ul>
  );
}