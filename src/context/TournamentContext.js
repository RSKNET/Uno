import React, { createContext, useContext, useState, useEffect } from "react";

const STORAGE_KEY = "unoTournamentData";
const MIN_PLAYERS = 2;

const INITIAL_TOURNAMENT_STATE = {
  playerCount: 0,
  rounds: "",
  playerNames: [],
  playerIds: [],
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
  return Array.from(
    { length: playerCount },
    (_, i) => `position${i + 1}`
  ).reduce((wins, key) => ({ ...wins, [key]: 0 }), {});
};

const calculateStatistics = (wins, playerCount) => {
  const stats = Array.from({ length: playerCount }, (_, i) => {
    const positionKey = `position${i + 1}`;
    const count = wins[positionKey] || 0;
    const weight = playerCount - i;
    return { count, weight, position: i + 1 };
  }).reduce(
    (acc, { count, weight, position }) => ({
      weighted: acc.weighted + count * weight,
      totalPositionSum: acc.totalPositionSum + count * position,
      totalGames: acc.totalGames + count,
    }),
    { weighted: 0, totalPositionSum: 0, totalGames: 0 }
  );

  return {
    weightedScore: stats.weighted,
    averagePosition:
      stats.totalGames > 0 ? stats.totalPositionSum / stats.totalGames : 0,
    totalGames: stats.totalGames,
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

    return aStats.averagePosition - bStats.averagePosition;
  });
};

const updateWinCounts = (player, rank, playerCount) => {
  if (rank < playerCount) {
    player.wins[`position${rank + 1}`]++;
  }
};

const storageUtils = {
  async save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  async load() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    return savedData ? JSON.parse(savedData) : null;
  },

  async remove() {
    localStorage.removeItem(STORAGE_KEY);
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

      if (player.wins?.first !== undefined) {
        const newWins = createInitialPlayerWins(data.playerCount);
        Object.assign(newWins, {
          position1: player.wins.first || 0,
          position2: player.wins.second || 0,
          position3: player.wins.third || 0,
          position4: player.wins.fourth || 0,
        });
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

  const getTournamentSummary = async () => {
    let players = tournamentData.playerNames;

    if (tournamentData.playerIds?.length > 0) {
      const fetchedPlayers = await Promise.all(
        tournamentData.playerIds.map(async (playerId, index) => {
          try {
            const response = await fetch(`/api/players?id=${playerId}`);
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data?.length > 0) {
                return result.data[0].name;
              }
            }
          } catch (error) {}
          return tournamentData.playerNames[index] || `Player ${index + 1}`;
        })
      );
      players = fetchedPlayers;
    }

    return {
      totalPlayers: tournamentData.playerCount,
      roundsType: tournamentData.rounds
        ? `${tournamentData.rounds} babak`
        : "Unlimited",
      players,
      isValid:
        tournamentData.isSetup && tournamentData.playerCount >= MIN_PLAYERS,
      createdDate: tournamentData.createdAt
        ? new Date(tournamentData.createdAt).toLocaleDateString("id-ID")
        : null,
    };
  };

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
