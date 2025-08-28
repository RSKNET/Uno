import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";

const AdminPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      showNotification(
        "Akses ditolak. Silakan login terlebih dahulu.",
        "error"
      );
      setTimeout(() => {
        router.push("/login");
      }, 2000);
      return;
    }

    try {
      const response = await fetch("/api/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
        // Auto redirect ke dashboard
        router.push("/admin/dashboard");
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showNotification("Session expired. Silakan login kembali.", "error");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AdminLayout user={user} onLogout={handleLogout}></AdminLayout>
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
