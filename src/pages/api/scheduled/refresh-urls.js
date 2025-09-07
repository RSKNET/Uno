import supabase from "../../../utils/supabase";

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

const refreshAllUrls = async () => {
  try {
    const { data: records, error } = await supabase
      .from("history")
      .select("*")
      .order("updated_at", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch records: ${error.message}`);
    }

    if (!records || records.length === 0) {
      return { success: true, message: "No records to refresh", refreshed: 0 };
    }

    let refreshedCount = 0;
    const errors = [];

    for (const record of records) {
      try {
        const [pdfUrl, jsonUrl] = await Promise.all([
          createSignedUrl("history-pdf", record.pdf_filename),
          createSignedUrl("history-json", record.json_filename),
        ]);

        const { error: updateError } = await supabase
          .from("history")
          .update({
            pdf: pdfUrl,
            json: jsonUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", record.id);

        if (updateError) {
          errors.push(
            `Failed to update record ${record.id}: ${updateError.message}`
          );
        } else {
          refreshedCount++;
        }
      } catch (recordError) {
        errors.push(
          `Error processing record ${record.id}: ${recordError.message}`
        );
      }
    }

    const result = {
      success: true,
      message: `Refresh completed: ${refreshedCount}/${records.length} records updated`,
      refreshed: refreshedCount,
      total: records.length,
      timestamp: new Date().toISOString(),
    };

    if (errors.length > 0) {
      result.errors = errors;
      result.hasErrors = true;
    }

    return result;
  } catch (error) {
    throw new Error(`Batch refresh failed: ${error.message}`);
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  const authHeader = req.headers.authorization;
  const cronSecret = req.headers["x-vercel-cron-signature"];

  if (!cronSecret && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized access",
    });
  }

  try {
    console.log(
      `[${new Date().toISOString()}] Starting scheduled URL refresh...`
    );

    const result = await refreshAllUrls();

    console.log(
      `[${new Date().toISOString()}] Scheduled refresh completed:`,
      result
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Scheduled refresh failed:`,
      error
    );

    return res.status(500).json({
      success: false,
      error: "Scheduled refresh failed",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}
