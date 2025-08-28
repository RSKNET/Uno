import supabase from "../../../utils/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ error: "Gagal mengambil data players" });
    }

    return res.status(200).json({
      success: true,
      message: "Data players berhasil diambil",
      data: data || [],
      total: data ? data.length : 0,
    });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
}
