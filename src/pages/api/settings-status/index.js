import supabase from "../../../utils/supabase";

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

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method tidak diizinkan",
    });
  }

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
}
