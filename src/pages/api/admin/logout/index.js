import { authMiddleware } from "../../../../utils/auth";

async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    return res.status(200).json({
      success: true,
      message: "Logout berhasil",
      data: {
        loggedOut: true,
        timestamp: new Date().toISOString(),
        user: req.user.username,
      },
    });
  } catch {
    return res.status(500).json({
      error: "Terjadi kesalahan server saat logout",
      success: false,
    });
  }
}

export default authMiddleware(handler);
