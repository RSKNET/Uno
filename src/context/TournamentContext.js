import React, { createContext, useContext, useState, useEffect } from "react";

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

const createInitialPlayerWins = (playerCount) => {
  const wins = {};
  for (let i = 1; i <= playerCount; i++) {
    wins[`position${i}`] = 0;
  }
  return wins;
};

const calculateStatistics = (wins, playerCount) => {
  let weighted = 0;
  let totalPositionSum = 0;
  let totalGames = 0;

  for (let i = 1; i <= playerCount; i++) {
    const positionKey = `position${i}`;
    const count = wins[positionKey] || 0;
    const weight = playerCount - i + 1;

    weighted += count * weight;
    totalPositionSum += count * i;
    totalGames += count;
  }

  return {
    weightedScore: weighted,
    averagePosition: totalGames > 0 ? totalPositionSum / totalGames : 0,
    totalGames,
  };
};

const TournamentContext = createContext();

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error("useTournament must be used within a TournamentProvider");
  }
  return context;
};

const createPlayerScore = (playerIndex, playerCount) => ({
  playerIndex,
  totalScore: 0,
  wins: createInitialPlayerWins(playerCount),
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

const sortPlayersByScore = (players, playerCount) => {
  return [...players].sort((a, b) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }

    const aStats = calculateStatistics(a.wins, playerCount);
    const bStats = calculateStatistics(b.wins, playerCount);

    if (bStats.weightedScore !== aStats.weightedScore) {
      return bStats.weightedScore - aStats.weightedScore;
    }

    if (aStats.averagePosition !== bStats.averagePosition) {
      return aStats.averagePosition - bStats.averagePosition;
    }

    return 0;
  });
};

const updateWinCounts = (player, rank, playerCount) => {
  if (rank < playerCount) {
    player.wins[`position${rank + 1}`]++;
  }
};

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

const migrateOldData = (data) => {
  if (!data.gameData) {
    return {
      ...data,
      gameData: {
        currentRound: 1,
        completedRounds: 0,
        playerScores:
          data.playerNames?.map((_, index) =>
            createPlayerScore(index, data.playerCount)
          ) || [],
        roundHistory: [],
      },
    };
  }

  if (data.gameData.playerScores) {
    data.gameData.playerScores = data.gameData.playerScores.map((player) => {
      const migratedPlayer = {
        ...player,
        firstWinRound: player.firstWinRound || null,
      };

      if (player.wins && player.wins.first !== undefined) {
        const newWins = createInitialPlayerWins(data.playerCount);
        newWins.position1 = player.wins.first || 0;
        newWins.position2 = player.wins.second || 0;
        newWins.position3 = player.wins.third || 0;
        newWins.position4 = player.wins.fourth || 0;
        migratedPlayer.wins = newWins;
      }

      return migratedPlayer;
    });
  }

  return data;
};

export const TournamentProvider = ({ children }) => {
  const [tournamentData, setTournamentData] = useState(
    INITIAL_TOURNAMENT_STATE
  );

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

  const saveTournamentData = async (data) => {
    const tournamentInfo = {
      ...data,
      isSetup: true,
      createdAt: new Date().toISOString(),
      gameData: {
        currentRound: 1,
        completedRounds: 0,
        playerScores: data.playerNames.map((_, index) =>
          createPlayerScore(index, data.playerCount)
        ),
        roundHistory: [],
      },
    };

    await storageUtils.save(tournamentInfo);
    setTournamentData(tournamentInfo);
    return tournamentInfo;
  };

  const saveRoundResult = async (rankings) => {
    const { gameData, playerCount } = tournamentData;

    const newRoundHistory = createRoundHistory(
      gameData.currentRound,
      rankings,
      playerCount
    );

    const playerMap = new Map(
      gameData.playerScores.map((player) => [
        player.playerIndex,
        { ...player, wins: { ...player.wins } },
      ])
    );

    rankings.forEach((playerIndex, rank) => {
      const points = calculatePoints(playerCount, rank);
      const player = playerMap.get(playerIndex);

      if (player) {
        player.totalScore += points;
        updateWinCounts(player, rank, playerCount);

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
        playerScores: sortPlayersByScore(updatedPlayerScores, playerCount),
        roundHistory: [...gameData.roundHistory, newRoundHistory],
      },
    };

    await storageUtils.save(updatedTournamentData);
    setTournamentData(updatedTournamentData);
    return updatedTournamentData;
  };

  const resetTournamentData = async () => {
    const resetData = {
      ...tournamentData,
      gameData: {
        currentRound: 1,
        completedRounds: 0,
        playerScores: tournamentData.playerNames.map((_, index) =>
          createPlayerScore(index, tournamentData.playerCount)
        ),
        roundHistory: [],
      },
    };

    await storageUtils.save(resetData);
    setTournamentData(resetData);
    return resetData;
  };

  const clearAllData = async () => {
    await storageUtils.remove();
    setTournamentData(INITIAL_TOURNAMENT_STATE);
    return INITIAL_TOURNAMENT_STATE;
  };

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

  const isTournamentCompleted = () => {
    const rounds = tournamentData.rounds;
    return (
      rounds &&
      rounds !== "unlimited" &&
      tournamentData.gameData.completedRounds >= parseInt(rounds, 10)
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
