"use client";

import { memo, useEffect, useState } from "react";

export interface NotificationProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose: () => void;
}

export const Notification = memo(function Notification({
  message,
  type,
  duration = 5000,
  onClose,
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 350); // Wait for animation to complete
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]); // Remove onClose from dependencies to prevent re-renders

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "bg-green-100 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300";
      case "error":
        return "bg-red-100 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300";
      case "warning":
        return "bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-700 dark:text-yellow-300";
      case "info":
        return "bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-300";
      default:
        return "bg-neutral-100 border-neutral-200 text-neutral-800 dark:bg-neutral-900/20 dark:border-neutral-700 dark:text-neutral-300";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        );
      case "error":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "warning":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case "info":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-lg backdrop-blur-lg border shadow-lg ${getTypeStyles()}`}
      >
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="flex-1 text-sm">{message}</div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
});

export interface NotificationState {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  const addNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info" = "info",
    duration?: number
  ) => {
    const id = `notification-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const NotificationContainer = memo(function NotificationContainer() {
    return (
      <>
        {notifications.map((notification) => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </>
    );
  });

  return {
    addNotification,
    removeNotification,
    NotificationContainer,
  };
}
