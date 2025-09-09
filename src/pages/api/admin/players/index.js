import supabase from "../../../../utils/supabase";
import { authMiddleware } from "../../../../utils/auth";

const formatPlayerName = (name) =>
  name
    .toLowerCase()
    .split(/[,\s]+/)
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
    .replace(/\s*,\s*/g, ", ");

const transformPlayer = (player) => ({
  id: player.id,
  name: player.name,
  joinDate: player.created_at,
  updatedAt: player.updated_at,
});

const validateName = (name) => {
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return "Nama pemain harus diisi dan tidak boleh kosong";
  }
  if (name.trim().length > 100) {
    return "Nama pemain maksimal 100 karakter";
  }
  return null;
};

const checkExistingPlayer = async (name, excludeId = null) => {
  const query = supabase.from("players").select("id").eq("name", name);
  if (excludeId) query.neq("id", excludeId);

  const { data, error } = await query.single();
  if (error && error.code !== "PGRST116") {
    throw new Error("Gagal memeriksa data pemain");
  }
  return data;
};

const handleGet = async (req, res) => {
  try {
    const { search, id } = req.query;

    let query = supabase
      .from("players")
      .select("id, name, created_at, updated_at");

    if (search) query = query.ilike("name", `%${search}%`);
    if (id) query = query.eq("id", id);

    const { data, error } = await query.order("updated_at", {
      ascending: true,
    });

    if (error) {
      return res.status(500).json({ error: "Gagal mengambil data players" });
    }

    const transformedData = data ? data.map(transformPlayer) : [];

    return res.status(200).json({
      success: true,
      message: "Data players berhasil diambil",
      data: transformedData,
      total: transformedData.length,
    });
  } catch {
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

const handlePost = async (req, res) => {
  try {
    const { name } = req.body;
    const validationError = validateName(name);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const formattedName = formatPlayerName(name.trim());
    const existingPlayer = await checkExistingPlayer(formattedName);
    if (existingPlayer) {
      return res.status(409).json({ error: "Nama pemain sudah terdaftar" });
    }

    const { data, error } = await supabase
      .from("players")
      .insert({ name: formattedName })
      .select("id, name, created_at, updated_at")
      .single();

    if (error) {
      return res.status(500).json({ error: "Gagal menambahkan pemain" });
    }

    return res.status(201).json({
      success: true,
      message: "Pemain berhasil ditambahkan",
      data: transformPlayer(data),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Terjadi kesalahan server" });
  }
};

const handlePut = async (req, res) => {
  try {
    const { id, name } = req.body;
    const validationError = validateName(name);
    if (validationError || !id) {
      return res.status(400).json({
        error: !id ? "ID dan nama pemain harus diisi" : validationError,
      });
    }

    const { data: existingPlayer, error: checkError } = await supabase
      .from("players")
      .select("id, name")
      .eq("id", id)
      .single();

    if (checkError || !existingPlayer) {
      return res.status(404).json({ error: "Pemain tidak ditemukan" });
    }

    const formattedName = formatPlayerName(name.trim());
    if (name.trim() !== existingPlayer.name) {
      const duplicatePlayer = await checkExistingPlayer(formattedName, id);
      if (duplicatePlayer) {
        return res.status(409).json({
          error: "Nama pemain sudah digunakan oleh pemain lain",
        });
      }
    }

    const { data, error } = await supabase
      .from("players")
      .update({ name: formattedName })
      .eq("id", id)
      .select("id, name, created_at, updated_at")
      .single();

    if (error) {
      return res.status(500).json({ error: "Gagal mengupdate pemain" });
    }

    return res.status(200).json({
      success: true,
      message: "Pemain berhasil diupdate",
      data: transformPlayer(data),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Terjadi kesalahan server" });
  }
};

const handleDelete = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: "ID pemain harus disertakan" });
    }

    const { data: existingPlayer, error: checkError } = await supabase
      .from("players")
      .select("id, name")
      .eq("id", id)
      .single();

    if (checkError || !existingPlayer) {
      return res.status(404).json({ error: "Pemain tidak ditemukan" });
    }

    const { error } = await supabase.from("players").delete().eq("id", id);
    if (error) {
      return res.status(500).json({ error: "Gagal menghapus pemain" });
    }

    return res.status(200).json({
      success: true,
      message: "Pemain berhasil dihapus",
    });
  } catch {
    return res.status(500).json({ error: "Terjadi kesalahan server" });
  }
};

async function handler(req, res) {
  switch (req.method) {
    case "GET":
      return handleGet(req, res);
    case "POST":
      return handlePost(req, res);
    case "PUT":
      return handlePut(req, res);
    case "DELETE":
      return handleDelete(req, res);
    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}

export default authMiddleware(handler);
