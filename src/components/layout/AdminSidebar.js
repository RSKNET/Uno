import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/components/layout/AdminSidebar.module.css";

const AdminSidebar = ({ user, onLogout, currentView, onNavigate }) => {
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const isMobileSize = window.innerWidth <= 768;
      setIsMobile(isMobileSize);

      if (isMobileSize) {
        setIsMinimized(true);
      } else {
        setIsMinimized(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const menuItems = [
    { id: "dashboard", letter: "D", label: "Dashboard", view: "dashboard" },
    { id: "players", letter: "P", label: "Players", view: "players" },
    { id: "report", letter: "R", label: "Report", view: "report" },
    { id: "settings", letter: "S", label: "Settings", view: "settings" },
  ];

  const handleMenuClick = useCallback(
    (view) => {
      onNavigate(view);
    },
    [onNavigate]
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setIsMinimized(!isMinimized);
    }
  }, [isMinimized, isMobile]);

  return (
    <>
      <div
        className={`${styles.sidebar} ${isMinimized ? styles.minimized : ""}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>U</span>
            {!isMinimized && <span className={styles.logoText}>UNO Admin</span>}
          </div>
        </div>

        <nav className={styles.navigation}>
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.menuItem} ${
                currentView === item.view ? styles.active : ""
              }`}
              onClick={() => handleMenuClick(item.view)}
              title={isMinimized ? item.label : ""}
            >
              <span className={styles.menuIcon}>{item.letter}</span>
              {!isMinimized && (
                <span className={styles.menuLabel}>{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {isMobile && (
            <button
              className={styles.footerButton}
              onClick={toggleSidebar}
              title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
            >
              <span className={styles.buttonIcon}>
                {isMinimized ? "\u25B6" : "\u25C0"}
              </span>
              {!isMinimized && (
                <span className={styles.buttonText}>
                  {isMinimized ? "Expand" : "Minimize"}
                </span>
              )}
            </button>
          )}

          <div className={styles.footerButton}>
            <span className={styles.buttonIcon}>
              {user?.username?.charAt(0)?.toUpperCase() || "A"}
            </span>
            {!isMinimized && (
              <div className={styles.buttonText}>
                <div className={styles.username}>{user?.username}</div>
                <div className={styles.userRole}>Admin</div>
              </div>
            )}
          </div>

          <button
            className={`${styles.footerButton} ${styles.logout}`}
            onClick={onLogout}
            title={isMinimized ? "Logout" : ""}
          >
            <span className={styles.buttonIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </span>
            {!isMinimized && <span className={styles.buttonText}>Logout</span>}
          </button>
        </div>
      </div>

      {isMobile && !isMinimized && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setIsMinimized(true)}
        />
      )}
    </>
  );
};

export default AdminSidebar;
