import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/components/layout/AdminSidebar.module.css";

const AdminSidebar = ({ user, onLogout, currentView, onNavigate }) => {
  const router = useRouter();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsMinimized(true);
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
    setIsMinimized(!isMinimized);
  }, [isMinimized]);

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
          <button
            className={styles.toggleButton}
            onClick={toggleSidebar}
            title={isMinimized ? "Expand sidebar" : "Minimize sidebar"}
          >
            {isMinimized ? "▶️" : "◀️"}
          </button>
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
          <div className={styles.userSection}>
            <div className={styles.userAvatar}>👤</div>
            {!isMinimized && (
              <div className={styles.userInfo}>
                <div className={styles.username}>{user?.username}</div>
                <div className={styles.userRole}>Admin</div>
              </div>
            )}
          </div>

          <button
            className={styles.logoutButton}
            onClick={onLogout}
            title={isMinimized ? "Logout" : ""}
          >
            <span className={styles.logoutIcon}>🚪</span>
            {!isMinimized && <span className={styles.logoutText}>Logout</span>}
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
