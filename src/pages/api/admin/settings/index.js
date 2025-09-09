import supabase from "../../../../utils/supabase";
import { authMiddleware } from "../../../../utils/auth";

const buildSelectQuery = () => `
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
`;

const transformData = (data) => ({
  id: data.id,
  maxPlayers: data.max_players,
  rounds: data.rounds,
  unlimited: data.unlimited_round?.unlimited || false,
  maintenance: data.maintenance?.maintenance || false,
});

const handleGet = async (res) => {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select(buildSelectQuery())
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: "Gagal mengambil data settings",
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        error: "Data settings tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data settings berhasil diambil",
      data: transformData(data),
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Terjadi kesalahan server",
    });
  }
};

const handlePatch = async (req, res) => {
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
        .select(buildSelectQuery())
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          error: "Gagal mereset data settings ke default",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Data settings berhasil direset ke default",
        data: transformData(data),
      });
    }

    if (action === "update") {
      const updateData = {};

      if (maxPlayers !== undefined) updateData.max_players = maxPlayers;
      if (rounds !== undefined) updateData.rounds = rounds;
      if (unlimited !== undefined) updateData.unlimited_id = unlimited ? 1 : 2;
      if (maintenance !== undefined)
        updateData.maintenance_id = maintenance ? 2 : 1;

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
        .select(buildSelectQuery())
        .single();

      if (error) {
        return res.status(500).json({
          success: false,
          error: "Gagal memperbarui data settings",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Data settings berhasil diperbarui",
        data: transformData(data),
      });
    }

    return res.status(400).json({
      success: false,
      error: "Action tidak valid. Gunakan action: 'reset' atau 'update'",
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Terjadi kesalahan server",
    });
  }
};

const handlePut = async (req, res) => {
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

    const { data, error } = await supabase
      .from("settings")
      .update({
        max_players: maxPlayers,
        rounds: rounds,
        unlimited_id: unlimited ? 1 : 2,
        maintenance_id: maintenance ? 2 : 1,
      })
      .eq("id", 1)
      .select(buildSelectQuery())
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: "Gagal memperbarui data settings",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data settings berhasil diperbarui",
      data: transformData(data),
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Terjadi kesalahan server",
    });
  }
};

async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return handleGet(res);
    case "PATCH":
      return handlePatch(req, res);
    case "PUT":
      return handlePut(req, res);
    default:
      return res.status(405).json({
        success: false,
        error: "Method tidak diizinkan",
      });
  }
}

export default authMiddleware(handler);
