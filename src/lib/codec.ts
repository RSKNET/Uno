import { encode, decode } from '@msgpack/msgpack';
import { type GameCache } from './db';


export function serializeGameToText(game: Partial<GameCache> & { id: string, totalPlayers: number, totalRounds: number, isUnlimitedRounds: boolean, createdAt: number, players: { id: string, name: string }[], rounds: any[] }): string {
  const header = [
    game.id,
    game.totalPlayers,
    game.totalRounds,
    game.isUnlimitedRounds ? '1' : '0',
    game.status || 'completed',
    game.createdAt
  ].join('|');

  const players = game.players.map(p => `${p.id}:${p.name}`).join(',');

  const rounds = game.rounds.map((r: any) => {
    const scores = Object.entries(r.scores)
      .map(([pid, s]: [string, any]) => `${pid}=${s.score},${s.rank}`)
      .join(';');
    return `${r.roundNumber}:${scores}`;
  }).join('|');

  return [header, players, rounds].join('\n');
}

export function deserializeGameFromText(text: string): GameCache {
  const [headerStr, playersStr, roundsStr] = text.split('\n');

  
  const [id, totalPlayersStr, totalRoundsStr, isUnlimitedStr, status, createdAtStr] = headerStr.split('|');
  
  
  const players = playersStr ? playersStr.split(',').map(pStr => {
    const [pid, name] = pStr.split(':');
    return { id: pid, name };
  }) : [];

  
  const rounds = (roundsStr && roundsStr.trim()) ? roundsStr.split('|').map(rStr => {
    const [rNumStr, scoresStr] = rStr.split(':');
    const scores: { [playerId: string]: { score: number; rank: number } } = {};
    
    if (scoresStr) {
      scoresStr.split(';').forEach(sStr => {
        const [pid, details] = sStr.split('=');
        const [scoreVal, rankVal] = details.split(',');
        scores[pid] = {
          score: parseInt(scoreVal, 10),
          rank: parseInt(rankVal, 10)
        };
      });
    }

    return {
      roundNumber: parseInt(rNumStr, 10),
      scores
    };
  }) : [];

  return {
    id,
    totalPlayers: parseInt(totalPlayersStr, 10),
    totalRounds: parseInt(totalRoundsStr, 10),
    isUnlimitedRounds: isUnlimitedStr === '1',
    players,
    rounds,
    status: (status || 'completed') as 'active' | 'completed',
    isSynced: 0,
    createdAt: parseInt(createdAtStr, 10)
  };
}


export function encodeGame(game: any): Uint8Array {
  const text = serializeGameToText(game);
  return encode(text);
}

export function decodeGame(buffer: Uint8Array): GameCache {
  const text = decode(buffer) as string;
  return deserializeGameFromText(text);
}
