import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import Loading from "@/components/Loading";
import styles from "@/styles/pages/Report.module.css";

const ReportPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
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

        if (response.ok && result.success) {
          setUser(result.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
          router.push("/login");
        }
      } catch (error) {
        localStorage.removeItem("token");
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (isLoading) {
    return <Loading isVisible={true} message="Memverifikasi autentikasi..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AdminLayout user={user} onLogout={handleLogout}>
      <div className={styles.reportContainer}>
        <div className={styles.header}>
          <h1 className={styles.title}>Report</h1>
          <p className={styles.subtitle}>Laporan dan statistik sistem</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>0</div>
              <div className={styles.statLabel}>Total Pemain</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>🏆</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>0</div>
              <div className={styles.statLabel}>Turnamen Aktif</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📈</div>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>0</div>
              <div className={styles.statLabel}>Laporan Bulanan</div>
            </div>
          </div>
        </div>

        <div className={styles.reportSection}>
          <h2 className={styles.sectionTitle}>Detail Laporan</h2>
          <div className={styles.placeholder}>
            <p>Konten laporan akan ditampilkan di sini.</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportPage;
