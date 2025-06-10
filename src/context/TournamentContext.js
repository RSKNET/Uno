import React, { createContext, useContext, useState, useEffect } from "react";

// Constants
const STORAGE_KEY = "unoTournamentData";
const MIN_PLAYERS = 2;

const INITIAL_TOURNAMENT_STATE = {
  playerCount: 0,
  rounds: "",
  playerNames: [],
  isSetup: false,
  createdAt: null,
  gameData: {
    currentRound: 1,
    completedRounds: 0,
    playerScores: [],
    roundHistory: [],
  },
};

const INITIAL_PLAYER_WINS = {
  first: 0,
  second: 0,
  third: 0,
  fourth: 0,
};

// Context
const TournamentContext = createContext();

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error("useTournament must be used within a TournamentProvider");
  }
  return context;
};

// Utility Functions
const createPlayerScore = (playerIndex) => ({
  playerIndex,
  totalScore: 0,
  wins: { ...INITIAL_PLAYER_WINS },
  firstWinRound: null,
});

const calculatePoints = (totalPlayers, rank) => {
  return Math.max(0, totalPlayers - rank - 1);
};

const createRoundHistory = (currentRound, rankings, playerCount) => ({
  round: currentRound,
  rankings: rankings.map((playerIndex, rank) => ({
    playerIndex,
    rank: rank + 1,
    points: calculatePoints(playerCount, rank),
  })),
  timestamp: new Date().toISOString(),
});

const sortPlayersByScore = (players) => {
  return [...players].sort((a, b) => {
    // Primary: Total points (highest first)
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    // Secondary: Number of first place wins (most first)
    const aWins = a.wins?.first || 0;
    const bWins = b.wins?.first || 0;
    if (bWins !== aWins) {
      return bWins - aWins;
    }

    // Tertiary: Who achieved first win earlier (lower round number first)
    const aFirstWin = a.firstWinRound || Number.MAX_SAFE_INTEGER;
    const bFirstWin = b.firstWinRound || Number.MAX_SAFE_INTEGER;

    if (aWins > 0 && bWins > 0) {
      return aFirstWin - bFirstWin;
    }

    if (aWins > 0) return -1;
    if (bWins > 0) return 1;

    // Final: Player index for consistency
    return a.playerIndex - b.playerIndex;
  });
};

const updateWinCounts = (player, rank) => {
  const winTypes = ["first", "second", "third", "fourth"];
  if (rank < winTypes.length) {
    player.wins[winTypes[rank]]++;
  }
};

// Storage utilities
const storageUtils = {
  async save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      throw new Error("Failed to save tournament data");
    }
  },

  async load() {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      return savedData ? JSON.parse(savedData) : null;
    } catch (error) {
      throw new Error("Failed to load tournament data");
    }
  },

  async remove() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      throw new Error("Failed to remove tournament data");
    }
  },
};

// Data migration utility
const migrateOldData = (data) => {
  if (!data.gameData) {
    return {
      ...data,
      gameData: {
        currentRound: 1,
        completedRounds: 0,
        playerScores: data.playerNames
          ? data.playerNames.map((_, index) => createPlayerScore(index))
          : [],
        roundHistory: [],
      },
    };
  }

  if (data.gameData.playerScores) {
    data.gameData.playerScores = data.gameData.playerScores.map((player) => ({
      ...player,
      firstWinRound: player.firstWinRound || null,
    }));
  }

  return data;
};

// Provider Component
export const TournamentProvider = ({ children }) => {
  const [tournamentData, setTournamentData] = useState(
    INITIAL_TOURNAMENT_STATE
  );

  // Load saved data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = await storageUtils.load();
        if (savedData) {
          const migratedData = migrateOldData(savedData);
          setTournamentData(migratedData);
        }
      } catch (error) {
        setTournamentData(INITIAL_TOURNAMENT_STATE);
      }
    };

    loadData();
  }, []);

  // Tournament setup
  const saveTournamentData = async (data) => {
    const tournamentInfo = {
      ...data,
      isSetup: true,
      createdAt: new Date().toISOString(),
      gameData: {
        currentRound: 1,
        completedRounds: 0,
        playerScores: data.playerNames.map((_, index) =>
          createPlayerScore(index)
        ),
        roundHistory: [],
      },
    };

    await storageUtils.save(tournamentInfo);
    setTournamentData(tournamentInfo);
    return tournamentInfo;
  };

  // Save round results
  const saveRoundResult = async (rankings) => {
    const { gameData, playerCount } = tournamentData;

    const newRoundHistory = createRoundHistory(
      gameData.currentRound,
      rankings,
      playerCount
    );

    // Buat map untuk akses cepat berdasarkan playerIndex
    const playerMap = new Map();
    gameData.playerScores.forEach((player) => {
      playerMap.set(player.playerIndex, {
        ...player,
        wins: { ...player.wins },
      });
    });

    rankings.forEach((playerIndex, rank) => {
      const points = calculatePoints(playerCount, rank);
      const player = playerMap.get(playerIndex);

      if (player) {
        player.totalScore += points;
        updateWinCounts(player, rank);

        if (rank === 0 && !player.firstWinRound) {
          player.firstWinRound = gameData.currentRound;
        }
      }
    });

    const updatedPlayerScores = Array.from(playerMap.values());

    const updatedTournamentData = {
      ...tournamentData,
      gameData: {
        ...gameData,
        currentRound: gameData.currentRound + 1,
        completedRounds: gameData.completedRounds + 1,
        playerScores: sortPlayersByScore(updatedPlayerScores),
        roundHistory: [...gameData.roundHistory, newRoundHistory],
      },
    };

    await storageUtils.save(updatedTournamentData);
    setTournamentData(updatedTournamentData);
    return updatedTournamentData;
  };

  // Reset tournament
  const resetTournamentData = async () => {
    const resetData = {
      ...tournamentData,
      gameData: {
        currentRound: 1,
        completedRounds: 0,
        playerScores: tournamentData.playerNames.map((_, index) =>
          createPlayerScore(index)
        ),
        roundHistory: [],
      },
    };

    await storageUtils.save(resetData);
    setTournamentData(resetData);
    return resetData;
  };

  // Clear all tournament data and return to initial state
  const clearAllData = async () => {
    await storageUtils.remove();
    setTournamentData(INITIAL_TOURNAMENT_STATE);
    return INITIAL_TOURNAMENT_STATE;
  };

  // Tournament summary
  const getTournamentSummary = () => ({
    totalPlayers: tournamentData.playerCount,
    roundsType: tournamentData.rounds
      ? `${tournamentData.rounds} babak`
      : "Unlimited",
    players: tournamentData.playerNames,
    isValid:
      tournamentData.isSetup && tournamentData.playerCount >= MIN_PLAYERS,
    createdDate: tournamentData.createdAt
      ? new Date(tournamentData.createdAt).toLocaleDateString("id-ID")
      : null,
  });

  // Check if tournament is completed
  const isTournamentCompleted = () => {
    if (!tournamentData.rounds || tournamentData.rounds === "unlimited") {
      return false;
    }
    return (
      tournamentData.gameData.completedRounds >= parseInt(tournamentData.rounds)
    );
  };

  const value = {
    tournamentData,
    saveTournamentData,
    saveRoundResult,
    resetTournamentData,
    clearAllData,
    getTournamentSummary,
    isTournamentCompleted,
  };

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  );
};

export default TournamentContext;
