import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import Notification from "@/components/ui/Notification";
import Loading from "@/components/ui/Loading";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useApi } from "@/hooks/useApi";
import styles from "@/styles/components/admin/Players.module.css";

const Players = ({ showNotification }) => {
  const showNotificationRef = useRef(showNotification);
  showNotificationRef.current = showNotification;

  const api = useApi();
  const apiRef = useRef();
  apiRef.current = api;

  const [playersState, setPlayersState] = useState({
    players: [],
    searchTerm: "",
    sortBy: "name",
    sortOrder: "asc",
    currentPage: 1,
    playersPerPage: 5,
  });

  const [loadingState, setLoadingState] = useState({
    isLoadingPlayers: false,
    isSavingPlayer: false,
    isDeletingPlayer: false,
  });

  const [modalState, setModalState] = useState({
    isFormModalOpen: false,
    isDeleteModalOpen: false,
    selectedPlayer: null,
    formData: { name: "" },
  });

  const updatePlayersState = (updates) =>
    setPlayersState((prev) => ({ ...prev, ...updates }));

  const updateLoadingState = (updates) =>
    setLoadingState((prev) => ({ ...prev, ...updates }));

  const updateModalState = (updates) =>
    setModalState((prev) => ({ ...prev, ...updates }));

  const fetchPlayers = useCallback(async () => {
    updateLoadingState({ isLoadingPlayers: true });
    try {
      const result = await apiRef.current.fetchPlayers();

      if (result.success) {
        const playersData = result.data || [];
        updatePlayersState({
          players: playersData,
        });
      } else {
        showNotificationRef.current(
          result.error || "Gagal memuat data pemain",
          "error"
        );
        updatePlayersState({ players: [] });
      }
    } catch (error) {
      if (error.message !== "Unauthorized") {
        showNotificationRef.current(
          "Terjadi kesalahan saat memuat data pemain",
          "error"
        );
      }
      updatePlayersState({ players: [] });
    } finally {
      updateLoadingState({ isLoadingPlayers: false });
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const filteredPlayers = useMemo(() => {
    const { players, searchTerm, sortBy, sortOrder } = playersState;

    const filtered = players.filter((player) =>
      player.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return sortOrder === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });
  }, [
    playersState.players,
    playersState.searchTerm,
    playersState.sortBy,
    playersState.sortOrder,
  ]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const { name } = modalState.formData;

    if (!name.trim()) {
      showNotificationRef.current("Nama pemain wajib diisi!", "error");
      return;
    }

    updateLoadingState({ isSavingPlayer: true });
    try {
      const playerData = { name: name.trim() };
      const isEditing = !!modalState.selectedPlayer;

      const result = isEditing
        ? await apiRef.current.updatePlayer({
            id: modalState.selectedPlayer.id,
            ...playerData,
          })
        : await apiRef.current.createPlayer(playerData);

      if (result.success) {
        showNotificationRef.current(
          isEditing
            ? "Pemain berhasil diperbarui!"
            : "Pemain berhasil ditambahkan!",
          "success"
        );
        closeModal();
        fetchPlayers();
      } else {
        showNotificationRef.current(
          result.error ||
            `Gagal ${isEditing ? "memperbarui" : "menambahkan"} pemain`,
          "error"
        );
      }
    } catch (error) {
      if (error.message !== "Unauthorized") {
        const action = modalState.selectedPlayer
          ? "memperbarui"
          : "menambahkan";
        showNotificationRef.current(
          `Terjadi kesalahan saat ${action} pemain`,
          "error"
        );
      }
    } finally {
      updateLoadingState({ isSavingPlayer: false });
    }
  };

  const handleDeletePlayer = async () => {
    if (!modalState.selectedPlayer) return;

    updateLoadingState({ isDeletingPlayer: true });
    try {
      const result = await apiRef.current.deletePlayer(
        modalState.selectedPlayer.id
      );

      if (result.success) {
        showNotificationRef.current("Pemain berhasil dihapus!", "success");
        closeModal();
        fetchPlayers();
      } else {
        showNotificationRef.current(
          result.error || "Gagal menghapus pemain",
          "error"
        );
      }
    } catch (error) {
      if (error.message !== "Unauthorized") {
        showNotificationRef.current(
          "Terjadi kesalahan saat menghapus pemain",
          "error"
        );
      }
    } finally {
      updateLoadingState({ isDeletingPlayer: false });
    }
  };

  const openAddModal = () => {
    updateModalState({
      selectedPlayer: null,
      formData: { name: "" },
      isFormModalOpen: true,
    });
  };

  const openEditModal = (player) => {
    updateModalState({
      selectedPlayer: player,
      formData: { name: player.name },
      isFormModalOpen: true,
    });
  };

  const openDeleteModal = (player) => {
    updateModalState({
      selectedPlayer: player,
      isDeleteModalOpen: true,
    });
  };

  const closeModal = () => {
    updateModalState({
      isFormModalOpen: false,
      isDeleteModalOpen: false,
      selectedPlayer: null,
      formData: { name: "" },
    });
  };

  const handleSort = (field) => {
    const { sortBy, sortOrder } = playersState;
    updatePlayersState({
      sortBy: field,
      sortOrder:
        sortBy === field ? (sortOrder === "asc" ? "desc" : "asc") : "asc",
      currentPage: 1,
    });
  };

  const { currentPage, playersPerPage, searchTerm, sortBy, sortOrder } =
    playersState;

  const { isLoadingPlayers, isSavingPlayer, isDeletingPlayer } = loadingState;
  const { isFormModalOpen, isDeleteModalOpen, selectedPlayer, formData } =
    modalState;

  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = filteredPlayers.slice(
    indexOfFirstPlayer,
    indexOfLastPlayer
  );
  const totalPages = Math.ceil(filteredPlayers.length / playersPerPage);

  const paginate = (pageNumber) =>
    updatePlayersState({ currentPage: pageNumber });

  return (
    <>
      <div className={styles.playersContainer}>
        <div className={styles.playersHeader}>
          <h1>Kelola Pemain</h1>
          <p>Tambah, edit, dan hapus data pemain</p>
        </div>

        <div className={styles.playersControls}>
          <div className={styles.leftControls}>
            <input
              type="text"
              placeholder="Cari pemain..."
              value={searchTerm}
              onChange={(e) =>
                updatePlayersState({
                  searchTerm: e.target.value,
                  currentPage: 1,
                })
              }
              className={styles.searchInput}
            />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                updatePlayersState({
                  sortBy: field,
                  sortOrder: order,
                  currentPage: 1,
                });
              }}
              className={styles.sortSelect}
            >
              <option value="name-asc">Nama A-Z</option>
              <option value="name-desc">Nama Z-A</option>
              <option value="joinDate-desc">Terbaru</option>
              <option value="joinDate-asc">Terlama</option>
            </select>
          </div>
          <button onClick={openAddModal} className={styles.addButton}>
            + Tambah Pemain
          </button>
        </div>

        <div className={`${styles.playersTableWrapper} double-bezel`}>
          <div className={`${styles.playersTable} double-bezel-inner`}>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")}>
                    Nama
                    {sortBy === "name" && (
                      <span>{sortOrder === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </th>
                  <th onClick={() => handleSort("joinDate")}>
                    Tanggal Dibuat
                    {sortBy === "joinDate" && (
                      <span>{sortOrder === "asc" ? " ↑" : " ↓"}</span>
                    )}
                  </th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {currentPlayers.length > 0 ? (
                  currentPlayers.map((player) => (
                    <tr key={player.id}>
                      <td>{player.name}</td>
                      <td>
                        {new Date(player.joinDate).toLocaleDateString("id-ID")}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => openEditModal(player)}
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(player)}
                            className={styles.deleteButton}
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className={styles.emptyState}>
                      {isLoadingPlayers
                        ? "Memuat data..."
                        : filteredPlayers.length === 0 &&
                          playersState.players.length === 0
                        ? "Belum ada pemain terdaftar"
                        : "Tidak ada pemain yang sesuai dengan pencarian"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.cardContainer}>
          {currentPlayers.length > 0 ? (
            currentPlayers.map((player) => (
              <div key={player.id} className={styles.playerCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.playerCardInfo}>
                    <div className={styles.playerAvatar}>
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className={styles.cardTitle}>{player.name}</h3>
                  </div>
                </div>
                <div className={styles.cardContent}>
                  <div className={styles.cardRow}>
                    <span className={styles.cardLabel}>Tanggal Dibuat:</span>
                    <span className={styles.cardValue}>
                      {new Date(player.joinDate).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => openEditModal(player)}
                    className={styles.editCardButton}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(player)}
                    className={styles.deleteCardButton}
                  >
                    🗑️ Hapus
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>👤</div>
              <h3>
                {isLoadingPlayers
                  ? "Memuat data..."
                  : filteredPlayers.length === 0 &&
                    playersState.players.length === 0
                  ? "Belum ada pemain terdaftar"
                  : "Tidak ada pemain yang sesuai dengan pencarian"}
              </h3>
              <p>
                {!isLoadingPlayers &&
                  filteredPlayers.length === 0 &&
                  playersState.players.length === 0 &&
                  "Tambahkan pemain pertama dengan klik tombol 'Tambah Pemain'"}
              </p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className={styles.pagination}>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`${styles.pageButton} ${
                  currentPage === i + 1 ? styles.activePage : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {isFormModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{selectedPlayer ? "Edit Pemain" : "Tambah Pemain Baru"}</h2>
              <button onClick={closeModal} className={styles.closeButton}>
                ×
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label htmlFor="playerName">Nama Pemain</label>
                  <input
                    type="text"
                    id="playerName"
                    value={formData.name}
                    onChange={(e) =>
                      updateModalState({
                        formData: { ...formData, name: e.target.value },
                      })
                    }
                    placeholder="Masukkan nama pemain"
                    required
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  onClick={closeModal}
                  className={styles.cancelButton}
                  disabled={isSavingPlayer}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={isSavingPlayer}
                >
                  {isSavingPlayer
                    ? "Menyimpan..."
                    : selectedPlayer
                    ? "Perbarui"
                    : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Hapus Pemain"
        message={
          selectedPlayer
            ? `Apakah Anda yakin ingin menghapus pemain "${selectedPlayer.name}"?`
            : "Apakah Anda yakin ingin menghapus pemain ini?"
        }
        confirmText={isDeletingPlayer ? "Menghapus..." : "Ya, Hapus"}
        cancelText="Batal"
        onConfirm={handleDeletePlayer}
        onClose={closeModal}
        type="danger"
        isLoading={isDeletingPlayer}
      />

      <Loading isVisible={isLoadingPlayers} message="Memuat data pemain..." />
    </>
  );
};

export default Players;
