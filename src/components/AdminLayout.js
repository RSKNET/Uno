import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import styles from "@/styles/components/AdminLayout.module.css";

const AdminLayout = ({ children, user, onLogout }) => {
  return (
    <div className={styles.adminLayout}>
      <AdminSidebar user={user} onLogout={onLogout} />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
};

export default AdminLayout;
