import supabase from "../../../../utils/supabase";
import { authMiddleware } from "../../../../utils/auth";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method tidak didukung",
    });
  }

  try {
    const { data, error } = await supabase
      .from("history")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        error: "Gagal mengambil data history",
      });
    }

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Terjadi kesalahan server",
    });
  }
}

export default authMiddleware(handler);
