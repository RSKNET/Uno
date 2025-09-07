import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import AdminLayout from "@/components/layout/AdminLayout";
import Notification from "@/components/ui/Notification";
import Loading from "@/components/ui/Loading";
import Dashboard from "@/components/admin/Dashboard";
import Players from "@/components/admin/Players";
import Settings from "@/components/admin/Settings";
import Report from "@/components/admin/Report";

const AdminPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [notification, setNotification] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      showNotification(
        "Akses ditolak. Silakan login terlebih dahulu.",
        "error"
      );
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleNavigate = useCallback((view) => {
    setCurrentView(view);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  if (authLoading) {
    return <Loading isVisible={true} message="Memverifikasi autentikasi..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "players":
        return <Players showNotification={showNotification} />;
      case "settings":
        return <Settings showNotification={showNotification} />;
      case "report":
        return <Report showNotification={showNotification} />;
      default:
        return (
          <Dashboard
            onNavigate={handleNavigate}
            showNotification={showNotification}
          />
        );
    }
  };

  return (
    <>
      <AdminLayout
        user={user}
        onLogout={handleLogout}
        currentView={currentView}
        onNavigate={handleNavigate}
      >
        {renderCurrentView()}
      </AdminLayout>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
};

export default AdminPage;
