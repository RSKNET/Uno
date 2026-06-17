import supabase from "../../../../utils/supabase";
import { authMiddleware } from "../../../../utils/auth";

async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method tidak didukung",
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

    const enrichedData = await Promise.all(
      data.map(async (record) => {
        try {
          const [pdfUrl, jsonUrl] = await Promise.all([
            supabase.storage
              .from("history-pdf")
              .createSignedUrl(record.pdf_filename, 60 * 60 * 24 * 365)
              .then((res) => res.data?.signedUrl || record.pdf),
            supabase.storage
              .from("history-json")
              .createSignedUrl(record.json_filename, 60 * 60 * 24 * 365)
              .then((res) => res.data?.signedUrl || record.json),
          ]);

          return {
            ...record,
            pdf: pdfUrl,
            json: jsonUrl,
          };
        } catch (err) {
          return record;
        }
      }),
    );

    return res.status(200).json({
      success: true,
      data: enrichedData,
    });
  } catch (error) {
    console.error("API /admin/report error:", error);
    return res.status(500).json({
      success: false,
      error: "Terjadi kesalahan server: " + error.message,
    });
  }
}

export default authMiddleware(handler);
