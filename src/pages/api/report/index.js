import supabase from "../../../utils/supabase";
import { verifyToken } from "../../../utils/auth";

const createSignedUrl = async (bucketName, fileName) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(fileName, 60 * 60 * 24 * 365);

  if (error) {
    throw new Error(
      `Failed to create signed URL for ${fileName}: ${error.message}`
    );
  }

  return data.signedUrl;
};

const refreshUrlsInBackground = async (expiredRecords) => {
  setImmediate(async () => {
    try {
      for (const record of expiredRecords) {
        const [pdfUrl, jsonUrl] = await Promise.all([
          createSignedUrl("history-pdf", record.pdf_filename),
          createSignedUrl("history-json", record.json_filename),
        ]);

        await supabase
          .from("history")
          .update({
            pdf: pdfUrl,
            json: jsonUrl,
            updated_at: new Date().toISOString(),
            needs_refresh: false,
          })
          .eq("id", record.id);
      }
    } catch (error) {
      console.error("Background URL refresh failed:", error);
    }
  });
};

const checkAndScheduleRefresh = async (data) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(elevenMonthsAgo.getMonth() - 11);

  const expiredRecords = data.filter((record) => {
    const updatedAt = new Date(record.updated_at);
    return updatedAt < elevenMonthsAgo;
  });

  const shouldRunWeeklyCheck = data.some((record) => {
    const updatedAt = new Date(record.updated_at);
    return updatedAt < oneWeekAgo;
  });

  if (shouldRunWeeklyCheck && expiredRecords.length > 0) {
    refreshUrlsInBackground(expiredRecords);
  }

  return data;
};

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

    checkAndScheduleRefresh(data);

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
