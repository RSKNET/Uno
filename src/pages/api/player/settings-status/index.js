import supabase from "../../../../utils/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method tidak didukung",
    });
  }

  try {
    const { data, error } = await supabase
      .from("settings")
      .select(
        `
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
        error: "Gagal mengambil status settings",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        maintenance: data.maintenance?.maintenance || false,
        maxPlayers: data.max_players || null,
        rounds: data.rounds || null,
        unlimited: data.unlimited_round?.unlimited || true,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Terjadi kesalahan server",
    });
  }
}
