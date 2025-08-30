import { verifyToken } from "../../../utils/auth";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Token tidak ditemukan",
    });
  }

  const verification = verifyToken(token);

  if (!verification.success) {
    return res.status(401).json({
      success: false,
      error: verification.error,
    });
  }

  return res.status(200).json({
    success: true,
    user: verification.data,
    message: "Token valid",
  });
}
