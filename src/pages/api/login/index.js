import supabase from "../../../utils/supabase";
import jwt from "jsonwebtoken";

const validateCredentials = (username, password) => {
  if (!username?.trim() || !password?.trim()) {
    return "Username dan password wajib diisi";
  }
  return null;
};

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || "default_secret_key";
  return jwt.sign({ userId: user.id, username: user.username }, secret, {
    expiresIn: "24h",
  });
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;
  const validationError = validateCredentials(username, password);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username")
      .eq("username", username.trim())
      .eq("password", password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const token = generateToken(data);

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      user: { id: data.id, username: data.username },
    });
  } catch {
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
}
