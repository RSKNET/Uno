import supabase from "../../../utils/supabase";
import { verifyToken } from "../../../utils/auth";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method tidak didukung",
    });
  }

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
