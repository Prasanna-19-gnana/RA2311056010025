import { useEffect, useState } from "react";
import getNotifications from "../services/notificationService";
import type { NotificationItem } from "../services/notificationService";
import { Log } from "../utils/logger";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [notificationType, setNotificationType] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        await Log("frontend", "info", "hook", "useNotifications fetch started");

        const result = await getNotifications({
          page,
          limit,
          notificationType: notificationType === "All" || !notificationType ? undefined : notificationType,
        });

        setNotifications(result);

        await Log("frontend", "info", "hook", "useNotifications fetch completed");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        await Log("frontend", "error", "hook", `useNotifications error: ${message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [page, limit, notificationType]);

  return {
    notifications,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    notificationType,
    setNotificationType,
  };
}