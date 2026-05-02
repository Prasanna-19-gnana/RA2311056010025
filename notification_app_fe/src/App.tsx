import { useEffect } from "react";
import { useNotifications } from "./hooks/useNotifications";
import NotificationList from "./components/NotificationList";
import { Log } from "./utils/logger";
import "./App.css";

export default function App() {
  const {
    notifications,
    loading,
    error,
    page,
    setPage,
    limit,
    setLimit,
    notificationType,
    setNotificationType,
  } = useNotifications();

  useEffect(() => {
    Log("frontend", "info", "page", "App loaded successfully");
  }, []);

  const handleFilterChange = (type: string) => {
    const notificationType = type === "All" ? undefined : type;
    setNotificationType(notificationType);
    setPage(1);
    Log("frontend", "info", "component", `Filter changed to ${type}`);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    Log("frontend", "info", "component", `Limit changed to ${newLimit}`);
  };

  const handlePrevious = () => {
    if (page > 1) {
      setPage(page - 1);
      Log("frontend", "info", "component", `Previous page clicked. Page ${page - 1}`);
    }
  };

  const handleNext = () => {
    setPage(page + 1);
    Log("frontend", "info", "component", `Next page clicked. Page ${page + 1}`);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Campus Notifications</h1>
      </header>

      <main className="app-main">
        <div style={{ marginBottom: 20 }}>
          <select
            value={notificationType || "All"}
            onChange={(e) => handleFilterChange(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Result">Result</option>
            <option value="Placement">Placement</option>
            <option value="Event">Event</option>
          </select>

          <select
            value={limit}
            onChange={(e) => handleLimitChange(Number(e.target.value))}
            style={{ marginLeft: 10 }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>

        <NotificationList
          notifications={notifications}
          loading={loading}
          error={error}
        />

        <div style={{ marginTop: 20 }}>
          <button disabled={page === 1} onClick={handlePrevious}>
            Previous
          </button>

          <span style={{ margin: "0 10px" }}>Page {page}</span>

          <button onClick={handleNext}>Next</button>
        </div>
      </main>
    </div>
  );
}