import { supabase } from './supabase';
import { localDb, type GameCache } from './db';


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


        const { error: insertGameError } = await supabase
          .from('games')
          .upsert({
            id: gameData.id,
            total_players: gameData.totalPlayers,
            total_rounds: gameData.totalRounds,
            is_unlimited_rounds: gameData.isUnlimitedRounds,
            created_at: new Date(gameData.createdAt).toISOString()
          });

        if (insertGameError) {
          console.error('Error upserting game:', insertGameError);
          throw insertGameError;
        }


        const scoresToInsert = [];
        for (const round of gameData.rounds) {
          for (const [localPlayerId, roundDetails] of Object.entries(round.scores)) {
            const supabasePlayerId = playerMap[localPlayerId];
            if (!supabasePlayerId) continue;

            scoresToInsert.push({
              game_id: gameData.id,
              player_id: supabasePlayerId,
              round_number: round.roundNumber,
              rank: roundDetails.rank,
              calculated_score: roundDetails.score
            });
          }
        }

        if (scoresToInsert.length > 0) {
          const { error: insertScoresError } = await supabase
            .from('game_scores')
            .upsert(scoresToInsert, { onConflict: 'game_id,player_id,round_number' });

          if (insertScoresError) {
            console.error('Error upserting game scores:', insertScoresError);
            throw insertScoresError;
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

            const fileContent = JSON.stringify(reportData);
            const blob = new Blob([fileContent], { type: 'application/json' });
            
            const { error: uploadError } = await supabase.storage
              .from('game-reports')
              .upload(`${gameData.id}.json`, blob, {
                contentType: 'application/json',
                upsert: true
              });
            
            if (uploadError) {
              console.error('Error uploading game report to storage:', uploadError);
              throw uploadError;
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
