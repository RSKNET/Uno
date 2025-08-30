import { verifyToken } from "../../../utils/auth";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Token tidak ditemukan" });
    }

    const verification = verifyToken(token);

    if (!verification.success) {
      return res.status(401).json({ error: "Token tidak valid" });
    }

    return res.status(200).json({
      success: true,
      message: "Logout berhasil",
      data: {
        loggedOut: true,
        timestamp: new Date().toISOString(),
        user: verification.data.username,
      },
    });
  } catch {
    return res.status(500).json({
      error: "Terjadi kesalahan server saat logout",
      success: false,
    });
  }
}
