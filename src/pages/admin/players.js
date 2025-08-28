import React, { useState, useEffect } from "react";
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

  // Players data state
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    joinDate: "",
  });

  // Mock data untuk demo UI
  const mockPlayers = [
    {
      id: 1,
      name: "John Doe",
      email: "john@example.com",
      phone: "081234567890",
      joinDate: "2024-01-15",
      totalGames: 15,
      wins: 8,
      winRate: "53%",
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane@example.com",
      phone: "081234567891",
      joinDate: "2024-01-20",
      totalGames: 12,
      wins: 10,
      winRate: "83%",
    },
    {
      id: 3,
      name: "Bob Wilson",
      email: "bob@example.com",
      phone: "081234567892",
      joinDate: "2024-02-01",
      totalGames: 8,
      wins: 3,
      winRate: "38%",
    },
    {
      id: 4,
      name: "Alice Johnson",
      email: "alice@example.com",
      phone: "081234567893",
      joinDate: "2024-02-10",
      totalGames: 20,
      wins: 15,
      winRate: "75%",
    },
    {
      id: 5,
      name: "Charlie Brown",
      email: "charlie@example.com",
      phone: "081234567894",
      joinDate: "2024-02-15",
      totalGames: 6,
      wins: 2,
      winRate: "33%",
    },
  ];

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      // Simulate loading players data
      setTimeout(() => {
        setPlayers(mockPlayers);
        setFilteredPlayers(mockPlayers);
      }, 500);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Filter players based on search term
    const filtered = players.filter(
      (player) =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.phone.includes(searchTerm)
    );

    // Sort players
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

  const handleAddPlayer = () => {
    setFormData({ name: "", email: "", phone: "", joinDate: "" });
    setIsAddModalOpen(true);
  };

  const handleEditPlayer = (player) => {
    setSelectedPlayer(player);
    setFormData({
      name: player.name,
      email: player.email,
      phone: player.phone,
      joinDate: player.joinDate,
    });
    setIsEditModalOpen(true);
  };

  const handleDeletePlayer = (player) => {
    setSelectedPlayer(player);
    setIsDeleteModalOpen(true);
  };

  const handleSavePlayer = () => {
    // TODO: Implement save functionality
    showNotification("Pemain berhasil disimpan!", "success");
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
  };

  const handleConfirmDelete = () => {
    // TODO: Implement delete functionality
    showNotification("Pemain berhasil dihapus!", "success");
    setIsDeleteModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AdminLayout user={user} onLogout={handleLogout}>
        <div className={styles.playersContainer}>
          {/* Header */}
          <div className={styles.header}>
            <h1 className={styles.title}>Manajemen Pemain</h1>
            <p className={styles.subtitle}>Kelola data pemain UNO tournament</p>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>{players.length}</h3>
                <p className={styles.statLabel}>Total Pemain</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🎮</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>
                  {players.reduce((sum, p) => sum + p.totalGames, 0)}
                </h3>
                <p className={styles.statLabel}>Total Game</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🏆</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>
                  {players.reduce((sum, p) => sum + p.wins, 0)}
                </h3>
                <p className={styles.statLabel}>Total Kemenangan</p>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📈</div>
              <div className={styles.statContent}>
                <h3 className={styles.statNumber}>
                  {players.length > 0
                    ? Math.round(
                        players.reduce(
                          (sum, p) => sum + parseFloat(p.winRate),
                          0
                        ) / players.length
                      ) + "%"
                    : "0%"}
                </h3>
                <p className={styles.statLabel}>Rata-rata Win Rate</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.searchContainer}>
              <input
                type="text"
                placeholder="Cari pemain..."
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
                <option value="totalGames-desc">Game Terbanyak</option>
                <option value="winRate-desc">Win Rate Tertinggi</option>
              </select>

              <button onClick={handleAddPlayer} className={styles.addButton}>
                <span className={styles.addIcon}>+</span>
                Tambah Pemain
              </button>
            </div>
          </div>

          {/* Players Table */}
          <div className={styles.tableContainer}>
            <table className={styles.playersTable}>
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("name")}
                    className={styles.sortableHeader}
                  >
                    Nama{" "}
                    {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("email")}
                    className={styles.sortableHeader}
                  >
                    Email{" "}
                    {sortBy === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Telepon</th>
                  <th
                    onClick={() => handleSort("joinDate")}
                    className={styles.sortableHeader}
                  >
                    Tanggal Bergabung{" "}
                    {sortBy === "joinDate" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("totalGames")}
                    className={styles.sortableHeader}
                  >
                    Total Game{" "}
                    {sortBy === "totalGames" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    onClick={() => handleSort("winRate")}
                    className={styles.sortableHeader}
                  >
                    Win Rate{" "}
                    {sortBy === "winRate" && (sortOrder === "asc" ? "↑" : "↓")}
                  </th>
                  <th>Aksi</th>
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
                    <td>{player.email}</td>
                    <td>{player.phone}</td>
                    <td>
                      {new Date(player.joinDate).toLocaleDateString("id-ID")}
                    </td>
                    <td className={styles.gameCount}>{player.totalGames}</td>
                    <td className={styles.winRate}>{player.winRate}</td>
                    <td className={styles.actions}>
                      <button
                        onClick={() => handleEditPlayer(player)}
                        className={styles.editButton}
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(player)}
                        className={styles.deleteButton}
                        title="Hapus"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPlayers.length === 0 && (
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

      {/* Add/Edit Player Modal */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>{isAddModalOpen ? "Tambah Pemain" : "Edit Pemain"}</h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className={styles.closeButton}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Nama</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama pemain"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Masukkan email"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Telepon</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Masukkan nomor telepon"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Tanggal Bergabung</label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                }}
                className={styles.cancelButton}
              >
                Batal
              </button>
              <button onClick={handleSavePlayer} className={styles.saveButton}>
                {isAddModalOpen ? "Tambah" : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          title="Hapus Pemain"
          message={`Apakah Anda yakin ingin menghapus pemain "${selectedPlayer?.name}"?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
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
