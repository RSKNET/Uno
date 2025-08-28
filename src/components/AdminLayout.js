import React, { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";
import styles from "@/styles/components/AdminLayout.module.css";

const AdminLayout = ({ children, user, onLogout }) => {
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMinimized(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar user={user} onLogout={onLogout} />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};

export default AdminLayout;
