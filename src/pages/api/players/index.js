import supabase from "../../../utils/supabase";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("players")
        .select("id, name, total_games, created_at, updated_at")
        .order("created_at", { ascending: false });

      if (error) {
        return res.status(500).json({ error: "Gagal mengambil data players" });
      }

      const transformedData = data
        ? data.map((player) => ({
            id: player.id,
            name: player.name,
            totalGames: player.total_games,
            joinDate: player.created_at,
            updatedAt: player.updated_at,
          }))
        : [];

      return res.status(200).json({
        success: true,
        message: "Data players berhasil diambil",
        data: transformedData,
        total: transformedData.length,
      });
    } catch (error) {
      return res.status(500).json({ error: "Terjadi kesalahan server" });
    }
  } else if (req.method === "POST") {
    try {
      const { name } = req.body;

      if (!name || typeof name !== "string" || name.trim().length === 0) {
        return res.status(400).json({
          error: "Nama pemain harus diisi dan tidak boleh kosong",
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          error: "Nama pemain maksimal 100 karakter",
        });
      }

      const { data: existingPlayer, error: checkError } = await supabase
        .from("players")
        .select("id")
        .eq("name", name.trim())
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        return res.status(500).json({ error: "Gagal memeriksa data pemain" });
      }

      if (existingPlayer) {
        return res.status(409).json({
          error: "Nama pemain sudah terdaftar",
        });
      }

      const { data, error } = await supabase
        .from("players")
        .insert({
          name: name.trim(),
          total_games: 0,
        })
        .select("id, name, total_games, created_at, updated_at")
        .single();

      if (error) {
        return res.status(500).json({ error: "Gagal menambahkan pemain" });
      }

      const transformedPlayer = {
        id: data.id,
        name: data.name,
        totalGames: data.total_games,
        joinDate: data.created_at,
        updatedAt: data.updated_at,
      };

      return res.status(201).json({
        success: true,
        message: "Pemain berhasil ditambahkan",
        data: transformedPlayer,
      });
    } catch (error) {
      return res.status(500).json({ error: "Terjadi kesalahan server" });
    }
  } else if (req.method === "PUT") {
    try {
      const { id, name } = req.body;

      if (
        !id ||
        !name ||
        typeof name !== "string" ||
        name.trim().length === 0
      ) {
        return res.status(400).json({
          error: "ID dan nama pemain harus diisi",
        });
      }

      if (name.trim().length > 100) {
        return res.status(400).json({
          error: "Nama pemain maksimal 100 karakter",
        });
      }

      const { data: existingPlayer, error: checkError } = await supabase
        .from("players")
        .select("id, name")
        .eq("id", id)
        .single();

      if (checkError || !existingPlayer) {
        return res.status(404).json({
          error: "Pemain tidak ditemukan",
        });
      }

      if (name.trim() !== existingPlayer.name) {
        const { data: duplicatePlayer, error: duplicateError } = await supabase
          .from("players")
          .select("id")
          .eq("name", name.trim())
          .neq("id", id)
          .single();

        if (duplicateError && duplicateError.code !== "PGRST116") {
          return res.status(500).json({ error: "Gagal memeriksa data pemain" });
        }

        if (duplicatePlayer) {
          return res.status(409).json({
            error: "Nama pemain sudah digunakan oleh pemain lain",
          });
        }
      }

      const { data, error } = await supabase
        .from("players")
        .update({
          name: name.trim(),
        })
        .eq("id", id)
        .select("id, name, total_games, created_at, updated_at")
        .single();

      if (error) {
        return res.status(500).json({ error: "Gagal mengupdate pemain" });
      }

      const transformedPlayer = {
        id: data.id,
        name: data.name,
        totalGames: data.total_games,
        joinDate: data.created_at,
        updatedAt: data.updated_at,
      };

      return res.status(200).json({
        success: true,
        message: "Pemain berhasil diupdate",
        data: transformedPlayer,
      });
    } catch (error) {
      return res.status(500).json({ error: "Terjadi kesalahan server" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({
          error: "ID pemain harus disertakan",
        });
      }

      const { data: existingPlayer, error: checkError } = await supabase
        .from("players")
        .select("id, name")
        .eq("id", id)
        .single();

      if (checkError || !existingPlayer) {
        return res.status(404).json({
          error: "Pemain tidak ditemukan",
        });
      }

      const { error } = await supabase.from("players").delete().eq("id", id);

      if (error) {
        return res.status(500).json({ error: "Gagal menghapus pemain" });
      }

      return res.status(200).json({
        success: true,
        message: "Pemain berhasil dihapus",
      });
    } catch (error) {
      return res.status(500).json({ error: "Terjadi kesalahan server" });
    }
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
}
