import jwt from "jsonwebtoken";

export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret_key"
    );
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: "Token tidak valid atau sudah kadaluarsa" };
  }
};

export const authMiddleware = (handler) => {
  return async (req, res) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Token tidak ditemukan" });
    }

    const verification = verifyToken(token);

    if (!verification.success) {
      return res.status(401).json({ error: verification.error });
    }

    req.user = verification.data;
    return handler(req, res);
  };
};
