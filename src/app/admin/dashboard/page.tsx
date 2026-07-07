"use client";

import { CustomModal } from '@/components/modal';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import PlayerTab from './components/PlayerTab';
import ReportTab from './components/ReportTab';
import SettingTab from './components/SettingTab';
import GameSummaryModal from './components/GameSummaryModal';
import PlayerModal from './components/PlayerModal';


import useAdminDashboard from './hooks/useAdminDashboard';

export default function AdminDashboard() {
  const {
    mounted,
    loading,
    activeTab,
    setActiveTab,
    user,
    latency,
    apiConnected,
    dbEngine,
    rlsActive,
    settingsActive,
    serverLocation,
    players,
    searchQuery,
    setSearchQuery,
    playerModal,
    setPlayerModal,
    games,
    selectedGame,
    setSelectedGame,
    selectedGameLeaderboard,
    setSelectedGameLeaderboard,
    loadingSummary,
    selectedGameReportData,
    setSelectedGameReportData,
    maintenanceMode,
    unlimitedRounds,
    maxPlayers,
    savingSettings,
    modalConfig,
    setModalConfig,
    handleLogout,
    openGameSummaryModal,
    handleToggleMaintenance,
    handleToggleUnlimitedRounds,
    handleMaxPlayersChange,
    handleSavePlayer,
    handleDeletePlayer
  } = useAdminDashboard();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleExportPdf = async (game: any) => {
    const { exportGamePdf } = await import('@/lib/pdf-template');
    exportGamePdf(game);
  };

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-zinc-400"></div>
          <span className="text-xs uppercase tracking-wider opacity-60">Memuat Portal Dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-row h-[100dvh] bg-[#050505] text-zinc-50 w-full max-w-[98%] mx-auto relative transition-colors duration-500 overflow-hidden">
      
      <div className="absolute top-[-10%] right-[-10%] w-[45%] h-[40%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto p-6 md:p-8 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardTab
            playersCount={players.length}
            gamesCount={games.length}
            maintenanceMode={maintenanceMode}
            dbEngine={dbEngine}
            apiConnected={apiConnected}
            settingsActive={settingsActive}
            rlsActive={rlsActive}
            latency={latency}
            serverLocation={serverLocation}
            onNavigateToTab={setActiveTab}
          />
        )}
        {activeTab === 'player' && (
          <PlayerTab
            players={players}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenCreateModal={() => setPlayerModal({ show: true, mode: 'create', name: '' })}
            onOpenEditModal={(p) => setPlayerModal({ show: true, mode: 'edit', id: p.id, name: p.name })}
            onDeletePlayer={handleDeletePlayer}
          />
        )}
        {activeTab === 'report' && (
          <ReportTab
            games={games}
            onOpenSummaryModal={openGameSummaryModal}
          />
        )}
        {activeTab === 'setting' && (
          <SettingTab
            maintenanceMode={maintenanceMode}
            unlimitedRounds={unlimitedRounds}
            maxPlayers={maxPlayers}
            savingSettings={savingSettings}
            onToggleMaintenance={handleToggleMaintenance}
            onToggleUnlimitedRounds={handleToggleUnlimitedRounds}
            onMaxPlayersChange={handleMaxPlayersChange}
          />
        )}

      </main>

      <GameSummaryModal
        isOpen={!!selectedGame}
        selectedGame={selectedGame}
        loadingSummary={loadingSummary}
        selectedGameLeaderboard={selectedGameLeaderboard}
        selectedGameReportData={selectedGameReportData}
        onClose={() => {
          setSelectedGame(null);
          setSelectedGameLeaderboard([]);
          setSelectedGameReportData(null);
        }}
        onExportPdf={handleExportPdf}
      />

      <PlayerModal
        isOpen={playerModal.show}
        mode={playerModal.mode}
        name={playerModal.name}
        setName={(name) => setPlayerModal(prev => ({ ...prev, name }))}
        onSave={handleSavePlayer}
        onClose={() => setPlayerModal(prev => ({ ...prev, show: false }))}
      />

      <CustomModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        severity={modalConfig.severity}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
