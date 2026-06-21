import Dexie, { type Table } from 'dexie';

export interface UnsyncedItem {
  id?: number;
  type: 'game' | 'score' | 'player';
  payload: any;
  createdAt: number;
}

export interface GameCache {
  id: string;
  totalPlayers: number;
  totalRounds: number;
  isUnlimitedRounds: boolean;
  players: { id: string; name: string }[];
  rounds: {
    roundNumber: number;
    scores: {
      [playerId: string]: {
        score: number;
        rank: number;
      };
    };
  }[];
  status: 'active' | 'completed';
  isSynced: number;
  createdAt: number;
}

export interface PlayerCache {
  id: string;
  name: string;
}

class UnoSkorsDexie extends Dexie {
  syncQueue!: Table<UnsyncedItem, number>;
  gamesCache!: Table<GameCache, string>;
  playersCache!: Table<PlayerCache, string>;

  constructor() {
    super('UnoSkorsLocalDB');
    this.version(1).stores({
      syncQueue: '++id, type, createdAt',
      gamesCache: 'id, status, isSynced, createdAt',
      playersCache: 'id, name',
    });
  }
}

export const localDb = new UnoSkorsDexie();
