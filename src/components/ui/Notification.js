import React, { useEffect, useCallback, useMemo } from "react";
import styles from "@/styles/components/ui/Notification.module.css";

const Notification = ({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) => {
  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    if (!duration || !onClose) return;

    const timer = setTimeout(handleClose, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const getIcon = useMemo(() => {
    const iconMap = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    return iconMap[type] || iconMap.success;
  }, [type]);

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <div className={styles.iconContainer}>
        <span className={styles.icon}>{getIcon}</span>
      </div>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>
      <button
        className={styles.closeButton}
        onClick={handleClose}
        type="button"
        aria-label="Tutup notifikasi"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6L6 18M6 6L18 18" />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
