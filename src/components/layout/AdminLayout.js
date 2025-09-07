import React from "react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import styles from "@/styles/components/layout/AdminLayout.module.css";

const AdminLayout = ({ children, user, onLogout, currentView, onNavigate }) => {
  return (
    <div className={styles.adminLayout}>
      <AdminSidebar
        user={user}
        onLogout={onLogout}
        currentView={currentView}
        onNavigate={onNavigate}
      />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};

export default AdminLayout;
