"use server";

import { createServerClient } from '@/lib/supabase-server';
import { encodeGame } from '@/lib/codec';
import { type GameCache } from '@/lib/db';

export async function getInitialSetupData() {
  const supabase = createServerClient();

  const { data: playersData, error: playersError } = await supabase
    .from('players')
    .select('id, name');

  if (playersError) {
    
    throw playersError;
  }

  const { data: settingsData, error: settingsError } = await supabase
    .from('settings')
    .select('key, value');

  if (settingsError) {
    
    throw settingsError;
  }

  return {
    players: playersData || [],
    settings: settingsData || [],
  };
}

export async function syncGameOnServer(gameData: GameCache) {
  const supabase = createServerClient();
  const playerMap: { [localId: string]: string } = {};

  
  for (const player of gameData.players) {
    const { data: existingPlayer, error: searchError } = await supabase
      .from('players')
      .select('id, name')
      .ilike('name', player.name)
      .maybeSingle();

    if (searchError) {
      
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
        
        throw insertPlayerError;
      }

      playerMap[player.id] = newPlayer.id;
    }
  }

  
  if (gameData.status === 'completed') {
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

    const { error: uploadError } = await supabase.storage
      .from('game-reports')
      .upload(`${gameData.id}.msgpack`, binaryData, {
        contentType: 'application/x-msgpack',
        upsert: true
      });

    if (uploadError) {
      const isDuplicate = uploadError.status === 409 || uploadError.message?.includes('already exists');
      if (!isDuplicate) {
        
        throw uploadError;
      }
    }
  }

  return {
    success: true,
    playerMap
  };
}
