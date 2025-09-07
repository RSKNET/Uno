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
    {
      id: "dashboard",
      icon: "📊",
      label: "Dashboard",
      view: "dashboard",
    },
    {
      id: "players",
      icon: "👥",
      label: "Players",
      view: "players",
    },
    {
      id: "report",
      icon: "📄",
      label: "Report",
      view: "report",
    },
    {
      id: "settings",
      icon: "⚙️",
      label: "Settings",
      view: "settings",
    },
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
            <span className={styles.logoIcon}>🎮</span>
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
              <span className={styles.menuIcon}>{item.icon}</span>
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
                {isMinimized ? "▶️" : "◀️"}
              </span>
              {!isMinimized && (
                <span className={styles.buttonText}>
                  {isMinimized ? "Expand" : "Minimize"}
                </span>
              )}
            </button>
          )}

          <div className={styles.footerButton}>
            <span className={styles.buttonIcon}>👤</span>
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
            <span className={styles.buttonIcon}>🚪</span>
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
