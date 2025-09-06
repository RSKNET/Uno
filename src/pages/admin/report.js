import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import Loading from "@/components/Loading";
import styles from "@/styles/pages/Report.module.css";

const ReportPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReportData();
    }
  }, [isAuthenticated]);

  const checkAuth = useCallback(async () => {
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
    } catch {
      localStorage.removeItem("token");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  const fetchReportData = async () => {
    setIsLoadingData(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("/api/report", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setReportData(result.data);
      }
    } catch (error) {
      setReportData([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePreview = (item) => {
    setPreviewData(item);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleDetail = async (item) => {
    try {
      const response = await fetch(item.json);
      const jsonData = await response.json();
      setDetailData(jsonData);
      setShowDetail(true);
    } catch (error) {
      setDetailData(null);
    }
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailData(null);
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

        {isLoadingData ? (
          <div className={styles.loadingContainer}>
            <p>Memuat data report...</p>
          </div>
        ) : reportData.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Belum ada data history game</p>
          </div>
        ) : (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.reportTable}>
                <thead>
                  <tr>
                    <th>Tanggal Dibuat</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item) => (
                    <tr key={item.id}>
                      <td>{formatDate(item.created_at)}</td>
                      <td className={styles.actionCell}>
                        <div className={styles.buttonGroup}>
                          <button
                            className={styles.previewButton}
                            onClick={() => handlePreview(item)}
                          >
                            Preview
                          </button>
                          <button
                            className={styles.pdfButton}
                            onClick={() => window.open(item.pdf, "_blank")}
                          >
                            PDF
                          </button>
                          <button
                            className={styles.detailButton}
                            onClick={() => handleDetail(item)}
                          >
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.cardContainer}>
              {reportData.map((item) => (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.cardTitle}>Report Data</h3>
                  </div>
                  <div className={styles.cardContent}>
                    <div className={styles.cardRow}>
                      <span className={styles.cardLabel}>Tanggal Dibuat:</span>
                      <span className={styles.cardValue}>
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.pdfButton}
                      onClick={() => window.open(item.pdf, "_blank")}
                    >
                      PDF
                    </button>
                    <button
                      className={styles.detailButton}
                      onClick={() => handleDetail(item)}
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {showPreview && previewData && (
        <div className={styles.previewModal}>
          <div className={styles.previewContent}>
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>
                {previewData.pdf_filename}
              </h3>
              <button
                className={styles.closeButton}
                onClick={handleClosePreview}
              >
                ×
              </button>
            </div>
            <div className={styles.previewBody}>
              <iframe
                src={`${previewData.pdf}#toolbar=0&navpanes=0&scrollbar=0`}
                className={styles.pdfIframe}
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}

      {showDetail && detailData && (
        <div className={styles.detailModal}>
          <div className={styles.detailContent}>
            <div className={styles.detailHeader}>
              <h3 className={styles.detailTitle}>Detail Tournament Data</h3>
              <button
                className={styles.closeButton}
                onClick={handleCloseDetail}
              >
                ×
              </button>
            </div>
            <div className={styles.detailBody}>
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Informasi Turnamen</h4>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Judul:</span>
                    <span className={styles.infoValue}>
                      {detailData.tournamentInfo.title}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Total Pemain:</span>
                    <span className={styles.infoValue}>
                      {detailData.tournamentInfo.totalPlayers}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Jenis Ronde:</span>
                    <span className={styles.infoValue}>
                      {detailData.tournamentInfo.roundsType}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Ronde Selesai:</span>
                    <span className={styles.infoValue}>
                      {detailData.tournamentInfo.completedRounds}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Leaderboard</h4>
                <div className={styles.leaderboardTable}>
                  <table className={styles.detailTable}>
                    <thead>
                      <tr>
                        <th>Peringkat</th>
                        <th>Nama Pemain</th>
                        <th>Total Skor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailData.leaderboard.map((player, index) => (
                        <tr key={index}>
                          <td className={styles.rankCell}>#{index + 1}</td>
                          <td>{player.playerName}</td>
                          <td className={styles.scoreCell}>
                            {player.totalScore}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Statistik Pemain</h4>
                <div className={styles.statisticsContainer}>
                  {detailData.playerStatistics.map((player, index) => (
                    <div key={index} className={styles.playerStatCard}>
                      <h5 className={styles.playerName}>{player.playerName}</h5>
                      <div className={styles.positionStats}>
                        {player.positionHistory.map((position, posIndex) => (
                          <div key={posIndex} className={styles.positionItem}>
                            <span className={styles.positionLabel}>
                              {position.position}:
                            </span>
                            <span className={styles.positionCount}>
                              {position.count}x
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ReportPage;
