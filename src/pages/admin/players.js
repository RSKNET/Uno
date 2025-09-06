import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import AdminLayout from "@/components/AdminLayout";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";
import ConfirmationModal from "@/components/ConfirmationModal";
import styles from "@/styles/pages/PlayersPage.module.css";

const PlayersPage = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isSavingPlayer, setIsSavingPlayer] = useState(false);
  const [isDeletingPlayer, setIsDeletingPlayer] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
  });

  const fetchPlayers = useCallback(async () => {
    setIsLoadingPlayers(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/players", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setPlayers(result.data || []);
        setFilteredPlayers(result.data || []);
      } else {
        showNotification(result.error || "Gagal memuat data pemain", "error");
        setPlayers([]);
        setFilteredPlayers([]);
      }
    } catch {
      showNotification("Terjadi kesalahan saat memuat data pemain", "error");
      setPlayers([]);
      setFilteredPlayers([]);
    } finally {
      setIsLoadingPlayers(false);
    }
  }, []);

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlayers();
    }
  }, [isAuthenticated, fetchPlayers]);

  useEffect(() => {
    const filtered = players.filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sorted = [...filtered].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPlayers(sorted);
  }, [searchTerm, sortBy, sortOrder, players]);

  const checkAuthentication = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      showNotification(
        "Akses ditolak. Silakan login terlebih dahulu.",
        "error"
      );
      router.push("/login");
      setIsLoading(false);
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
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showNotification("Session expired. Silakan login kembali.", "error");
        router.push("/login");
      }
    } catch {
      showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const showNotification = useCallback((message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleLogout = useCallback(async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showNotification("Token tidak ditemukan", "error");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showNotification("Logout berhasil", "success");
        router.push("/login");
      } else {
        showNotification(data.error || "Gagal logout", "error");
      }
    } catch {
      showNotification("Terjadi kesalahan saat logout", "error");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.push("/login");
    }
  }, [router]);

  const handleAddPlayer = useCallback(() => {
    setFormData({ name: "" });
    setIsAddModalOpen(true);
  }, []);

  const handleEditPlayer = useCallback((player) => {
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
    });
    setIsEditModalOpen(true);
  }, []);

  const handleDeletePlayer = useCallback((player) => {
    setSelectedPlayer(player);
    setIsDeleteModalOpen(true);
  }, []);

  const handleSavePlayer = useCallback(async () => {
    if (!formData.name || formData.name.trim().length === 0) {
      showNotification("Nama pemain harus diisi", "error");
      return;
    }

    if (formData.name.trim().length > 100) {
      showNotification("Nama pemain maksimal 100 karakter", "error");
      return;
    }

    setIsSavingPlayer(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showNotification("Token tidak ditemukan", "error");
        return;
      }

      let response;
      let successMessage;

      if (isAddModalOpen) {
        response = await fetch("/api/players", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name.trim(),
          }),
        });
        successMessage = "Pemain berhasil ditambahkan!";
      } else if (isEditModalOpen && selectedPlayer) {
        response = await fetch("/api/players", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: selectedPlayer.id,
            name: formData.name.trim(),
          }),
        });
        successMessage = "Pemain berhasil diupdate!";
      }

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification(successMessage, "success");
        handleCloseModal();
        await fetchPlayers();
      } else {
        showNotification(result.error || "Gagal menyimpan pemain", "error");
      }
    } catch {
      showNotification("Terjadi kesalahan saat menyimpan pemain", "error");
    } finally {
      setIsSavingPlayer(false);
    }
  }, [
    formData.name,
    isAddModalOpen,
    isEditModalOpen,
    selectedPlayer,
    fetchPlayers,
  ]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedPlayer) {
      showNotification("Pemain tidak ditemukan", "error");
      return;
    }

    setIsDeletingPlayer(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showNotification("Token tidak ditemukan", "error");
        return;
      }

      const response = await fetch(`/api/players?id=${selectedPlayer.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        showNotification("Pemain berhasil dihapus!", "success");
        handleCloseDeleteModal();
        await fetchPlayers();
      } else {
        showNotification(result.error || "Gagal menghapus pemain", "error");
      }
    } catch {
      showNotification("Terjadi kesalahan saat menghapus pemain", "error");
    } finally {
      setIsDeletingPlayer(false);
    }
  }, [selectedPlayer, fetchPlayers]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setFormData({ name: "" });
    setSelectedPlayer(null);
  }, []);

  const handleCloseDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setSelectedPlayer(null);
  }, []);

  const handleSort = useCallback(
    (field) => {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(field);
        setSortOrder("asc");
      }
    },
    [sortBy, sortOrder]
  );

  if (isLoading) {
    return <Loading isVisible={true} message="Memverifikasi autentikasi..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AdminLayout user={user} onLogout={handleLogout}>
        <div className={styles.playersContainer}>
          <div className={styles.header}>
            <h1 className={styles.title}>Manajemen Pemain</h1>
            <p className={styles.subtitle}>Kelola data pemain UNO tournament</p>
          </div>

          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Cari pemain berdasarkan nama..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <div className={styles.searchIcon}>🔍</div>
            </div>

            <div className={styles.controlsRight}>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-");
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className={styles.sortSelect}
              >
                <option value="name-asc">Nama (A-Z)</option>
                <option value="name-desc">Nama (Z-A)</option>
                <option value="joinDate-desc">Terbaru</option>
                <option value="joinDate-asc">Terlama</option>
              </select>

              <button
                onClick={handleAddPlayer}
                className={styles.addButton}
                disabled={isSavingPlayer || isDeletingPlayer}
              >
                <span className={styles.addIcon}>+</span>
                {isSavingPlayer ? "Menyimpan..." : "Tambah Pemain"}
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {isLoadingPlayers ? (
              <Loading isVisible={true} message="Memuat data pemain..." />
            ) : (
              <table className={styles.playersTable}>
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort("name")}
                      className={`${styles.sortableHeader} ${styles.centerHeader}`}
                    >
                      Nama{" "}
                      {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th
                      onClick={() => handleSort("joinDate")}
                      className={`${styles.sortableHeader} ${styles.centerHeader}`}
                    >
                      Tanggal Bergabung{" "}
                      {sortBy === "joinDate" &&
                        (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className={styles.centerHeader}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className={styles.tableRow}>
                      <td className={styles.playerName}>
                        <div className={styles.playerAvatar}>
                          {player.name.charAt(0).toUpperCase()}
                        </div>
                        {player.name}
                      </td>
                      <td className={styles.joinDate}>
                        {new Date(player.joinDate).toLocaleDateString("id-ID")}
                      </td>
                      <td className={styles.actions}>
                        <button
                          onClick={() => handleEditPlayer(player)}
                          className={styles.editButton}
                          title="Edit"
                          disabled={isSavingPlayer || isDeletingPlayer}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeletePlayer(player)}
                          className={styles.deleteButton}
                          title="Hapus"
                          disabled={isSavingPlayer || isDeletingPlayer}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!isLoadingPlayers && filteredPlayers.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>👥</div>
                <h3>Tidak ada pemain ditemukan</h3>
                <p>
                  {searchTerm
                    ? "Coba ubah kata kunci pencarian"
                    : "Belum ada pemain yang terdaftar"}
                </p>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>

      {(isAddModalOpen || isEditModalOpen) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{isAddModalOpen ? "Tambah Pemain" : "Edit Pemain"}</h2>
              <button
                onClick={handleCloseModal}
                className={styles.closeButton}
                disabled={isSavingPlayer}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              {isSavingPlayer ? (
                <Loading isVisible={true} message="Menyimpan pemain..." />
              ) : (
                <div className={styles.formGroup}>
                  <label>Nama</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama pemain"
                    disabled={isSavingPlayer}
                  />
                </div>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={handleCloseModal}
                className={styles.cancelButton}
                disabled={isSavingPlayer}
              >
                Batal
              </button>
              <button
                onClick={handleSavePlayer}
                className={styles.saveButton}
                disabled={isSavingPlayer}
              >
                {isSavingPlayer
                  ? "Menyimpan..."
                  : isAddModalOpen
                  ? "Tambah"
                  : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Hapus Pemain"
          message={
            isDeletingPlayer
              ? "Menghapus pemain..."
              : `Apakah Anda yakin ingin menghapus pemain "${selectedPlayer?.name}"?`
          }
          onConfirm={handleConfirmDelete}
          onClose={handleCloseDeleteModal}
          confirmText={isDeletingPlayer ? "Menghapus..." : "Ya, Hapus"}
          cancelText="Batal"
          type="danger"
        />
      )}

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

export default PlayersPage;
