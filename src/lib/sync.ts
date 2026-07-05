import { supabase } from './supabase';
import { localDb, type GameCache } from './db';
import { encodeGame } from './codec';


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

        const playerMap: { [localId: string]: string } = {};

        for (const player of gameData.players) {

          const { data: existingPlayer, error: searchError } = await supabase
            .from('players')
            .select('id, name')
            .ilike('name', player.name)
            .maybeSingle();

          if (searchError) {
            console.error('Error searching player:', searchError);
            throw searchError;
          }

          if (existingPlayer) {
            playerMap[player.id] = existingPlayer.id;
          } else {

            const { data: newPlayer, error: insertPlayerError } = await supabase
              .from('players')
              .insert({ name: player.name })
              .select('id')
              .single();

            if (insertPlayerError) {
              console.error('Error inserting player:', insertPlayerError);
              throw insertPlayerError;
            }

            playerMap[player.id] = newPlayer.id;
          }
        }


        if (gameData.status === 'completed') {
          try {
            const updatedPlayers = gameData.players.map(p => ({
              id: playerMap[p.id] || p.id,
              name: p.name
            }));
            const updatedRounds = gameData.rounds.map(round => {
              const updatedScores: { [playerId: string]: { score: number; rank: number } } = {};
              for (const [playerId, scoreObj] of Object.entries(round.scores)) {
                const mappedId = playerMap[playerId] || playerId;
                updatedScores[mappedId] = scoreObj;
              }
              return {
                roundNumber: round.roundNumber,
                scores: updatedScores
              };
            });

            const reportData = {
              id: gameData.id,
              totalPlayers: gameData.totalPlayers,
              totalRounds: gameData.totalRounds,
              isUnlimitedRounds: gameData.isUnlimitedRounds,
              createdAt: gameData.createdAt,
              players: updatedPlayers,
              rounds: updatedRounds
            };

            const binaryData = encodeGame(reportData);
            const blob = new Blob([binaryData as any], { type: 'application/x-msgpack' });
            
            const { error: uploadError } = await supabase.storage
              .from('game-reports')
              .upload(`${gameData.id}.msgpack`, blob, {
                contentType: 'application/x-msgpack'
              });
            
            if (uploadError) {
              const isDuplicate = uploadError.status === 409 || uploadError.message?.includes('already exists');
              if (!isDuplicate) {
                console.error('Error uploading game report to storage:', uploadError);
                throw uploadError;
              }
            }
          } catch (uploadErr) {
            console.error('Failed to upload completed game report during sync:', uploadErr);
            throw uploadErr;
          }
        }


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
    console.error('Offline synchronization failed:', error);
    return {
      success: false,
      count: 0,
      message: error.message || 'Sync failed'
    };
  }
}
