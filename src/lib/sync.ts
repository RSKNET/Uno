import { localDb, type GameCache } from './db';
import { syncGameOnServer } from '@/app/actions/public';

export async function syncOfflineData(): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const queue = await localDb.syncQueue.toArray();
    if (queue.length === 0) {
      return { success: true, count: 0, message: 'Nothing to sync' };
    }

    let syncedCount = 0;

    for (const item of queue) {
      if (item.type === 'game') {
        const gameData: GameCache = item.payload;

        const result = await syncGameOnServer(gameData);
        if (!result.success) {
          throw new Error('Server synchronization failed');
        }

        const playerMap = result.playerMap;

        await localDb.gamesCache.update(gameData.id, {
          isSynced: 1,
          players: gameData.players.map(p => ({
            id: playerMap[p.id] || p.id,
            name: p.name
          }))
        });

        if (item.id !== undefined) {
          await localDb.syncQueue.delete(item.id);
        }

        syncedCount++;
      }
    }

    return {
      success: true,
      count: syncedCount,
      message: `Successfully synchronized ${syncedCount} game(s) to cloud.`
    };
  } catch (error: any) {
    
    return {
      success: false,
      count: 0,
      message: error.message || 'Sync failed'
    };
  }
}
