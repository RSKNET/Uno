import supabase from "../../../../utils/supabase";

const validateHistoryId = (historyId) => {
  if (
    !historyId ||
    typeof historyId !== "string" ||
    historyId.trim().length === 0
  ) {
    return "History ID is required";
  }
  return null;
};

const fetchHistoryRecord = async (historyId) => {
  const { data, error } = await supabase
    .from("history")
    .select("*")
    .eq("id", historyId)
    .single();

  if (error || !data) {
    throw new Error("History record not found");
  }

  return data;
};

const generateSignedUrls = async (jsonFileName, pdfFileName) => {
  const [jsonResult, pdfResult] = await Promise.allSettled([
    supabase.storage
      .from("history-json")
      .createSignedUrl(jsonFileName, 60 * 60 * 24 * 365),
    supabase.storage
      .from("history-pdf")
      .createSignedUrl(pdfFileName, 60 * 60 * 24 * 365),
  ]);

  if (jsonResult.status === "rejected" || pdfResult.status === "rejected") {
    throw new Error("Failed to generate signed URLs");
  }

  if (jsonResult.value.error || pdfResult.value.error) {
    throw new Error("Failed to generate signed URLs");
  }

  return {
    jsonUrl: jsonResult.value.data.signedUrl,
    pdfUrl: pdfResult.value.data.signedUrl,
  };
};

const updateHistoryRecord = async (historyId, jsonUrl, pdfUrl) => {
  const { data, error } = await supabase
    .from("history")
    .update({
      pdf: pdfUrl,
      json: jsonUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", historyId)
    .select()
    .single();

  if (error) {
    throw new Error("Failed to update URLs");
  }

  return data;
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { historyId } = req.body;

    const validationError = validateHistoryId(historyId);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError,
      });
    }

    const historyRecord = await fetchHistoryRecord(historyId);

    const { jsonUrl, pdfUrl } = await generateSignedUrls(
      historyRecord.json_filename,
      historyRecord.pdf_filename
    );

    const updatedRecord = await updateHistoryRecord(historyId, jsonUrl, pdfUrl);

    return res.status(200).json({
      success: true,
      message: "URLs refreshed successfully",
      data: {
        id: updatedRecord.id,
        jsonUrl: updatedRecord.json,
        pdfUrl: updatedRecord.pdf,
        updatedAt: updatedRecord.updated_at,
      },
    });
  } catch (error) {
    const statusCode = error.message === "History record not found" ? 404 : 500;

    return res.status(statusCode).json({
      success: false,
      error:
        error.message === "History record not found"
          ? "History record not found"
          : "Internal server error",
    });
  }
}
