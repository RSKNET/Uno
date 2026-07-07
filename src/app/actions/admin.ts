"use server";

import { createServerClient } from '@/lib/supabase-server';
import { decodeGame } from '@/lib/codec';

async function verifyAdmin(token: string) {
  if (!token) {
    throw new Error('Unauthorized: Session token is missing.');
  }
  const supabase = createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw new Error('Unauthorized: Session is invalid or expired.');
  }
  return { supabase, user };
}

export async function pingAdmin(token: string) {
  const { supabase } = await verifyAdmin(token);
  const { data, error } = await supabase.rpc('ping');
  if (error) throw error;
  return data;
}

export async function getAdminSystemMetrics(token: string) {
  const { supabase } = await verifyAdmin(token);
  const { data, error } = await supabase.rpc('get_system_metrics');
  if (error) throw error;
  return data;
}

export async function fetchAdminPlayers(token: string) {
  const { supabase } = await verifyAdmin(token);
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAdminSettings(token: string) {
  const { supabase } = await verifyAdmin(token);
  const { data, error } = await supabase
    .from('settings')
    .select('*');
  if (error) throw error;
  return data || [];
}

export async function fetchAdminGames(token: string) {
  const { supabase } = await verifyAdmin(token);
  const { data: files, error: listError } = await supabase.storage
    .from('game-reports')
    .list('', { limit: 100 });

  if (listError) throw listError;
  if (!files) return [];

  const msgpackFiles = files.filter(f => f.name.endsWith('.msgpack'));

  const fetchedGames = await Promise.all(
    msgpackFiles.map(async (file) => {
      try {
        const { data, error } = await supabase.storage
          .from('game-reports')
          .download(file.name);

        if (error) return null;
        if (data) {
          const buffer = await data.arrayBuffer();
          const parsed = decodeGame(new Uint8Array(buffer));
          return {
            id: parsed.id,
            total_players: parsed.totalPlayers,
            total_rounds: parsed.totalRounds,
            is_unlimited_rounds: parsed.isUnlimitedRounds,
            created_at: parsed.createdAt || file.created_at || file.updated_at
          };
        }
      } catch (err) {
        
      }
      return null;
    })
  );

  return fetchedGames
    .filter((g): g is { id: string; total_players: number; total_rounds: number; is_unlimited_rounds: boolean; created_at: string } => g !== null)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function fetchAdminGameSummary(token: string, gameId: string) {
  const { supabase } = await verifyAdmin(token);
  const { data, error } = await supabase.storage
    .from('game-reports')
    .download(`${gameId}.msgpack`);

  if (error) throw error;
  if (!data) throw new Error('File laporan tidak ditemukan.');

  const buffer = await data.arrayBuffer();
  const parsedGame = decodeGame(new Uint8Array(buffer));
  return parsedGame;
}

export async function updateAdminSetting(token: string, key: string, value: string) {
  const { supabase } = await verifyAdmin(token);
  const { error } = await supabase
    .from('settings')
    .update({ value })
    .eq('key', key);
  if (error) throw error;
  return { success: true };
}

export async function saveAdminPlayer(token: string, name: string, id?: string) {
  const { supabase } = await verifyAdmin(token);
  const capitalizedName = name.trim().replace(/\b\w/g, l => l.toUpperCase());

  if (id) {
    
    const { error } = await supabase
      .from('players')
      .update({ name: capitalizedName })
      .eq('id', id);
    if (error) throw error;
  } else {
    
    const { error } = await supabase
      .from('players')
      .insert({ name: capitalizedName });
    if (error) throw error;
  }
  return { success: true };
}

export async function deleteAdminPlayer(token: string, id: string) {
  const { supabase } = await verifyAdmin(token);
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return { success: true };
}

export async function deleteAdminGames(token: string, gameIds: string[]) {
  const { supabase } = await verifyAdmin(token);
  const filePaths = gameIds.map(id => `${id}.msgpack`);
  const { data, error } = await supabase.storage
    .from('game-reports')
    .remove(filePaths);
  if (error) throw error;
  return { success: true, data };
}
