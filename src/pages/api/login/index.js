import supabase from "../../../utils/supabase";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi" });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, username")
      .eq("username", username)
      .eq("password", password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: "Username atau password salah" });
    }

    const token = jwt.sign(
      {
        userId: data.id,
        username: data.username,
      },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: data.id,
        username: data.username,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
}
