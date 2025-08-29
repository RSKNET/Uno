import supabase from "../../../utils/supabase";
import { verifyToken } from "../../../utils/auth";

export default async function handler(req, res) {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token tidak ditemukan. Akses ditolak",
    });
  }

  const verification = verifyToken(token);

  if (!verification.success) {
    return res.status(401).json({
      success: false,
      error: verification.error,
    });
  }

  if (req.method === "PATCH") {
    try {
      const { action, maxPlayers, rounds, unlimited, maintenance } = req.body;

      if (action === "reset") {
        const defaultSettings = {
          max_players: 10,
          rounds: 40,
          unlimited_id: 1,
          maintenance_id: 1,
        };

        const { data, error } = await supabase
          .from("settings")
          .update(defaultSettings)
          .eq("id", 1)
          .select(
            `
            id,
            max_players,
            rounds,
            unlimited_id,
            maintenance_id,
            unlimited_round:unlimited_id (
              id,
              unlimited
            ),
            maintenance:maintenance_id (
              id,
              maintenance
            )
          `
          )
          .single();

        if (error) {
          return res.status(500).json({
            success: false,
            error: "Gagal mereset data settings ke default",
          });
        }

        const transformedData = {
          id: data.id,
          maxPlayers: data.max_players,
          rounds: data.rounds,
          unlimited: data.unlimited_round?.unlimited || false,
          maintenance: data.maintenance?.maintenance || false,
        };

        return res.status(200).json({
          success: true,
          message: "Data settings berhasil direset ke default",
          data: transformedData,
        });
      }

      if (action === "update") {
        const updateData = {};

        if (maxPlayers !== undefined) {
          updateData.max_players = maxPlayers;
        }

        if (rounds !== undefined) {
          updateData.rounds = rounds;
        }

        if (unlimited !== undefined) {
          updateData.unlimited_id = unlimited ? 1 : 2;
        }

        if (maintenance !== undefined) {
          updateData.maintenance_id = maintenance ? 2 : 1;
        }

        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({
            success: false,
            error:
              "Tidak ada field yang akan diupdate. Harap sertakan minimal satu field: maxPlayers, rounds, unlimited, atau maintenance",
          });
        }

        const { data, error } = await supabase
          .from("settings")
          .update(updateData)
          .eq("id", 1)
          .select(
            `
            id,
            max_players,
            rounds,
            unlimited_id,
            maintenance_id,
            unlimited_round:unlimited_id (
              id,
              unlimited
            ),
            maintenance:maintenance_id (
              id,
              maintenance
            )
          `
          )
          .single();

        if (error) {
          return res.status(500).json({
            success: false,
            error: "Gagal memperbarui data settings",
          });
        }

        const transformedData = {
          id: data.id,
          maxPlayers: data.max_players,
          rounds: data.rounds,
          unlimited: data.unlimited_round?.unlimited || false,
          maintenance: data.maintenance?.maintenance || false,
        };

        return res.status(200).json({
          success: true,
          message: "Data settings berhasil diperbarui",
          data: transformedData,
        });
      }

      return res.status(400).json({
        success: false,
        error: "Action tidak valid. Gunakan action: 'reset' atau 'update'",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Terjadi kesalahan server",
      });
    }
  }

  if (req.method === "PUT") {
    try {
      const { maxPlayers, rounds, unlimited, maintenance } = req.body;

      if (
        maxPlayers === undefined ||
        rounds === undefined ||
        unlimited === undefined ||
        maintenance === undefined
      ) {
        return res.status(400).json({
          success: false,
          error:
            "Semua field harus diisi: maxPlayers, rounds, unlimited, maintenance",
        });
      }

      const unlimitedValue = unlimited ? true : false;
      const maintenanceValue = maintenance ? true : false;

      let unlimitedId = unlimitedValue ? 1 : 2;
      let maintenanceId = maintenanceValue ? 2 : 1;

      const { data, error } = await supabase
        .from("settings")
        .update({
          max_players: maxPlayers,
          rounds: rounds,
          unlimited_id: unlimitedId,
          maintenance_id: maintenanceId,
        })
        .eq("id", 1)
        .select(
          `
          id,
          max_players,
          rounds,
          unlimited_id,
          maintenance_id,
          unlimited_round:unlimited_id (
            id,
            unlimited
          ),
          maintenance:maintenance_id (
            id,
            maintenance
          )
        `
        )
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          error: "Gagal memperbarui data settings",
        });
      }

      const transformedData = {
        id: data.id,
        maxPlayers: data.max_players,
        rounds: data.rounds,
        unlimited: data.unlimited_round?.unlimited || false,
        maintenance: data.maintenance?.maintenance || false,
      };

      return res.status(200).json({
        success: true,
        message: "Data settings berhasil diperbarui",
        data: transformedData,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: "Terjadi kesalahan server",
      });
    }
  }

  return res.status(405).json({
    success: false,
    error: "Method tidak diizinkan",
  });
}
