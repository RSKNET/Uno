import supabase from "../../../utils/supabase";

const validateHistoryData = (data) => {
  const { tournamentInfo, leaderboard, playerStatistics, pdfBuffer, metadata } =
    data;

  if (!tournamentInfo || !leaderboard || !playerStatistics || !pdfBuffer) {
    return "Missing required data: tournamentInfo, leaderboard, playerStatistics, pdfBuffer";
  }

  if (!tournamentInfo.title || !tournamentInfo.totalPlayers) {
    return "Tournament info must include title and totalPlayers";
  }

  if (!Array.isArray(leaderboard) || !Array.isArray(playerStatistics)) {
    return "Leaderboard and playerStatistics must be arrays";
  }

  if (!metadata?.tournamentId) {
    return "Tournament ID is required in metadata";
  }

  return null;
};

const generateFileName = (type, tournamentId) => {
  const dateStr = new Date().toISOString().split("T")[0];
  const shortId = tournamentId ? tournamentId.substring(0, 8) : "";

  if (type === "pdf") {
    return shortId
      ? `Turnamen-UNO-${dateStr}-${shortId}.pdf`
      : `Turnamen-UNO-${dateStr}.pdf`;
  }

  return shortId
    ? `history-${dateStr}-${shortId}.json`
    : `history-${dateStr}.json`;
};

const createHistoryData = (
  tournamentInfo,
  leaderboard,
  playerStatistics,
  metadata
) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-");

  return {
    tournamentInfo: {
      title: tournamentInfo.title,
      totalPlayers: tournamentInfo.totalPlayers,
      roundsType: tournamentInfo.roundsType,
      completedRounds: tournamentInfo.completedRounds,
    },
    leaderboard,
    playerStatistics,
    metadata: {
      tournamentId: metadata?.tournamentId,
      timestamp,
      exportedAt: metadata?.exportedAt || now.toISOString(),
    },
  };
};

const uploadFile = async (bucketName, fileName, content, contentType) => {
  const { data: existingFiles } = await supabase.storage
    .from(bucketName)
    .list("", { search: fileName });

  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage.from(bucketName).remove([fileName]);
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, content, {
      contentType,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload to ${bucketName}: ${error.message}`);
  }

  return data;
};

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

const cleanupOldFiles = async (gameId) => {
  try {
    const { data: existingRecord } = await supabase
      .from("history")
      .select("pdf_filename, json_filename")
      .eq("game_id", gameId)
      .single();

    if (existingRecord) {
      await Promise.allSettled([
        supabase.storage
          .from("history-json")
          .remove([existingRecord.json_filename]),
        supabase.storage
          .from("history-pdf")
          .remove([existingRecord.pdf_filename]),
      ]);
    }
  } catch (error) {
    // Continue if no existing record found
  }
};

const saveHistoryRecord = async (
  pdfUrl,
  jsonUrl,
  pdfFileName,
  jsonFileName,
  gameId
) => {
  const { data: existingRecord } = await supabase
    .from("history")
    .select("id")
    .eq("game_id", gameId)
    .single();

  if (existingRecord) {
    const { data, error } = await supabase
      .from("history")
      .update({
        pdf: pdfUrl,
        json: jsonUrl,
        pdf_filename: pdfFileName,
        json_filename: jsonFileName,
        updated_at: new Date().toISOString(),
      })
      .eq("game_id", gameId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update history record: ${error.message}`);
    }

    return data;
  }

  const { data, error } = await supabase
    .from("history")
    .insert([
      {
        game_id: gameId,
        pdf: pdfUrl,
        json: jsonUrl,
        pdf_filename: pdfFileName,
        json_filename: jsonFileName,
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to save history record: ${error.message}`);
  }

  return data;
};

const handlePost = async (req, res) => {
  try {
    const validationError = validateHistoryData(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError,
      });
    }

    const {
      tournamentInfo,
      leaderboard,
      playerStatistics,
      metadata,
      pdfBuffer,
    } = req.body;
    const tournamentId = metadata?.tournamentId;

    await cleanupOldFiles(tournamentId);

    const historyData = createHistoryData(
      tournamentInfo,
      leaderboard,
      playerStatistics,
      metadata
    );
    const jsonFileName = generateFileName("json", tournamentId);
    const pdfFileName = generateFileName("pdf", tournamentId);

    await uploadFile(
      "history-json",
      jsonFileName,
      JSON.stringify(historyData, null, 2),
      "application/json"
    );

    const pdfData = Buffer.from(pdfBuffer, "base64");
    await uploadFile("history-pdf", pdfFileName, pdfData, "application/pdf");

    const [jsonUrl, pdfUrl] = await Promise.all([
      createSignedUrl("history-json", jsonFileName),
      createSignedUrl("history-pdf", pdfFileName),
    ]);

    const historyRecord = await saveHistoryRecord(
      pdfUrl,
      jsonUrl,
      pdfFileName,
      jsonFileName,
      tournamentId
    );

    return res.status(201).json({
      success: true,
      message: "History saved successfully",
      data: {
        id: historyRecord.id,
        gameId: historyRecord.game_id,
        jsonUrl: historyRecord.json,
        pdfUrl: historyRecord.pdf,
        createdAt: historyRecord.created_at,
        updatedAt: historyRecord.updated_at,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Gagal menyimpan history",
    });
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  return handlePost(req, res);
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};
