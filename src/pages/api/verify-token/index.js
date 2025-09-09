import { authMiddleware } from "../../../utils/auth";

function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  return res.status(200).json({
    success: true,
    user: req.user,
    message: "Token valid",
  });
}

export default authMiddleware(handler);
