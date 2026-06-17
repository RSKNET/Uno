import React from "react";
import styles from "@/styles/components/ui/Loading.module.css";

const Loading = ({ isVisible = false, message = "Loading..." }) => {
  if (!isVisible) return null;

  return (
    <div className={styles.loadingOverlay}>
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>
          <div className={styles.spinnerLine}></div>
        </div>
        <p className={styles.loadingText}>{message}</p>
      </div>
    </div>
  );
};

export default Loading;
