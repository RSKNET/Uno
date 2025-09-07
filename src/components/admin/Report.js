import React, { useState, useEffect, useCallback } from "react";
import Loading from "@/components/ui/Loading";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/components/admin/Report.module.css";

const Report = ({ showNotification }) => {
  const { fetchReports } = useApi();
  const [reportData, setReportData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);

  useEffect(() => {
    fetchReportData();
  }, []);

  const getPaginatedReports = useCallback(() => {
    const startIndex = (currentPage - 1) * reportsPerPage;
    const endIndex = startIndex + reportsPerPage;
    return reportData.slice(startIndex, endIndex);
  }, [reportData, currentPage, reportsPerPage]);

  const getTotalPages = useCallback(() => {
    return Math.ceil(reportData.length / reportsPerPage);
  }, [reportData.length, reportsPerPage]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const fetchReportData = async () => {
    setIsLoadingData(true);

    try {
      const result = await fetchReports();

      if (result.success) {
        setReportData(result.data);
      } else {
        showNotification("Gagal memuat data laporan", "error");
      }
    } catch (error) {
      if (error.message !== "Unauthorized") {
        showNotification("Terjadi kesalahan saat memuat data", "error");
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePreview = async (report) => {
    try {
      console.log("Report data:", report);
      console.log("Report pdf field:", report.pdf);

      if (!report.pdf) {
        showNotification("URL PDF tidak tersedia", "error");
        return;
      }

      if (typeof report.pdf === "string" && report.pdf.startsWith("http")) {
        // Set PDF URL for preview
        setPreviewData({ pdfUrl: report.pdf });
        setShowPreview(true);
      } else {
        showNotification("Format URL PDF tidak valid", "error");
        return;
      }
    } catch (error) {
      console.error("Preview error:", error);
      showNotification("Gagal memuat preview PDF: " + error.message, "error");
    }
  };

  const handleDetail = async (report) => {
    try {
      console.log("Detail Report data:", report);
      console.log("Detail json field type:", typeof report.json);
      console.log("Raw json field:", report.json);

      let parsedData;

      if (!report.json) {
        showNotification("Data laporan tidak tersedia", "error");
        return;
      }

      if (typeof report.json === "string") {
        // Check if it's a URL - fetch data from URL
        if (report.json.startsWith("http")) {
          try {
            const response = await fetch(report.json);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonData = await response.json();
            parsedData = jsonData;
          } catch (fetchError) {
            console.error("Fetch URL error:", fetchError);
            showNotification(
              "Gagal mengambil data dari URL: " + fetchError.message,
              "error"
            );
            return;
          }
        } else {
          // Try to parse as JSON string
          try {
            parsedData = JSON.parse(report.json);
          } catch (parseError) {
            console.error("JSON Parse error:", parseError);
            showNotification("Format data laporan tidak valid", "error");
            return;
          }
        }
      } else if (typeof report.json === "object") {
        parsedData = report.json;
      } else {
        showNotification("Tipe data laporan tidak didukung", "error");
        return;
      }

      console.log("Detail Parsed data:", parsedData);
      setDetailData(parsedData);
      setShowDetail(true);
    } catch (error) {
      console.error("Detail error:", error);
      showNotification("Gagal memuat detail data: " + error.message, "error");
    }
  };

  const handleDownloadPdf = async (report) => {
    try {
      if (!report.pdf) {
        showNotification("URL PDF tidak tersedia", "error");
        return;
      }

      if (typeof report.pdf === "string" && report.pdf.startsWith("http")) {
        // Download PDF from URL
        const response = await fetch(report.pdf);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          report.pdf_filename || `tournament-report-${report.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showNotification("PDF berhasil diunduh!", "success");
      } else {
        // Fallback to API download
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/report?id=${report.id}&download=pdf`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `tournament-report-${report.id}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          showNotification("PDF berhasil diunduh!", "success");
        } else {
          showNotification("Gagal mengunduh PDF", "error");
        }
      }
    } catch (error) {
      console.error("Download error:", error);
      showNotification(
        "Terjadi kesalahan saat mengunduh: " + error.message,
        "error"
      );
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewData(null);
  };

  const closeDetail = () => {
    setShowDetail(false);
    setDetailData(null);
  };

  return (
    <>
      <div className={styles.reportContainer}>
        <div className={styles.reportHeader}>
          <h1>Laporan Tournament</h1>
          <p>Riwayat dan data tournament yang telah berlangsung</p>
        </div>

        <div className={styles.reportContent}>
          {isLoadingData ? (
            <div className={styles.loadingState}>
              <p>Memuat data laporan...</p>
            </div>
          ) : reportData.length > 0 ? (
            <>
              <div className={styles.reportList}>
                {getPaginatedReports().map((report) => (
                  <div key={report.id} className={styles.reportCard}>
                    <div className={styles.reportInfo}>
                      <div className={styles.reportTitle}>
                        Tournament ID: {report.game_id}
                      </div>
                      <div className={styles.reportMeta}>
                        <span className={styles.reportDate}>
                          {formatDate(report.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className={styles.reportActions}>
                      <button
                        onClick={() => handlePreview(report)}
                        className={styles.previewBtn}
                      >
                        👁️ Preview
                      </button>
                      <button
                        onClick={() => handleDetail(report)}
                        className={styles.detailBtn}
                      >
                        📊 Detail
                      </button>
                      <button
                        onClick={() => handleDownloadPdf(report)}
                        className={styles.downloadBtn}
                      >
                        📄 Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {getTotalPages() > 1 && (
                <div className={styles.pagination}>
                  {Array.from({ length: getTotalPages() }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`${styles.pageButton} ${
                        currentPage === i + 1 ? styles.activePage : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <p>Belum ada data laporan tournament</p>
            </div>
          )}
        </div>
      </div>

      {showPreview && previewData && (
        <div className={styles.modal}>
          <div className={styles.modalContent + " " + styles.pdfPreviewModal}>
            <div className={styles.modalHeader}>
              <h2>Preview PDF Tournament</h2>
              <button onClick={closePreview} className={styles.closeButton}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              {previewData.pdfUrl ? (
                <iframe
                  src={`${previewData.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  className={styles.pdfIframe}
                  title="PDF Preview"
                />
              ) : (
                <div className={styles.errorState}>
                  <p>PDF tidak dapat ditampilkan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showDetail && detailData && (
        <div className={styles.modal}>
          <div className={styles.modalContent + " " + styles.largeModal}>
            <div className={styles.modalHeader}>
              <h2>Detail Tournament</h2>
              <button onClick={closeDetail} className={styles.closeButton}>
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailTabs}>
                <div className={styles.tabContent}>
                  {detailData.tournamentInfo && (
                    <>
                      <h3>🏆 Informasi Tournament</h3>
                      <div className={styles.tournamentInfoCard}>
                        <div className={styles.infoGrid}>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Judul:</span>
                            <span className={styles.infoValue}>
                              {detailData.tournamentInfo.title}
                            </span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>
                              Total Pemain:
                            </span>
                            <span className={styles.infoValue}>
                              {detailData.tournamentInfo.totalPlayers} pemain
                            </span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>
                              Tipe Ronde:
                            </span>
                            <span className={styles.infoValue}>
                              {detailData.tournamentInfo.roundsType}
                            </span>
                          </div>
                          <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>
                              Ronde Selesai:
                            </span>
                            <span className={styles.infoValue}>
                              {detailData.tournamentInfo.completedRounds} ronde
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <h3>📊 Leaderboard Final</h3>
                  <div className={styles.leaderboardTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Pemain</th>
                          <th>Total Skor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.leaderboard?.map((player, index) => (
                          <tr key={index}>
                            <td>#{index + 1}</td>
                            <td>{player.playerName}</td>
                            <td>{player.totalScore}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h3>📈 Statistik Pemain</h3>
                  <div className={styles.statsGrid}>
                    {detailData.playerStatistics?.map((player, index) => (
                      <div key={index} className={styles.playerStatCard}>
                        <h4>{player.playerName}</h4>
                        <div className={styles.positionStats}>
                          {player.positionHistory?.map((pos, posIndex) => (
                            <div key={posIndex} className={styles.statRow}>
                              <span>{pos.position}:</span>
                              <span>{pos.count}x</span>
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
        </div>
      )}

      <Loading isVisible={isLoadingData} message="Memuat data laporan..." />
    </>
  );
};

export default Report;
