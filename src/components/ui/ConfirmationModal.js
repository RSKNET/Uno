import React from "react";
import styles from "@/styles/components/ui/ConfirmationModal.module.css";
import Loading from "./Loading";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi",
  message = "Apakah Anda yakin ingin melanjutkan?",
  confirmText = "Ya",
  cancelText = "Batal",
  type = "default", // 'default', 'danger', 'success', 'warning'
  isLoading = false,
}) => {
  const handleBackdropClick = React.useCallback(
    (e) => {
      if (e.target === e.currentTarget && onClose && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading]
  );

  const handleConfirm = React.useCallback(
    (e) => {
      e.preventDefault();
      if (onConfirm && !isLoading) onConfirm();
    },
    [onConfirm, isLoading]
  );

  const handleClose = React.useCallback(
    (e) => {
      e.preventDefault();
      if (onClose && !isLoading) onClose();
    },
    [onClose, isLoading]
  );

  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose && !isLoading) {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Enter" && onConfirm && !isLoading) {
        e.preventDefault();
        onConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, onConfirm, isLoading]);

  const getIcon = () => {
    const iconProps = {
      className: styles.icon,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
    };

    switch (type) {
      case "danger":
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case "success":
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      case "warning":
        return (
          <svg {...iconProps}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10" />
            <path d="M9,12l2,2 4-4" />
          </svg>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div
        className={`${styles.modal} ${styles[type]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className={styles.closeButton}
          onClick={handleClose}
          type="button"
          aria-label="Tutup modal"
          disabled={isLoading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className={styles.content}>
          {isLoading ? (
            <Loading isVisible={true} message="Memproses..." />
          ) : (
            <>
              <div className={styles.iconContainer}>{getIcon()}</div>
              <div className={styles.textContent}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.message}>{message}</p>
              </div>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.cancelButton}`}
            onClick={handleClose}
            type="button"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            className={`${styles.button} ${styles.confirmButton} ${
              styles[`${type}Confirm`]
            }`}
            onClick={handleConfirm}
            type="button"
            disabled={isLoading}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
