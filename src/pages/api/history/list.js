import supabase from "../../../../utils/supabase";

const validatePaginationParams = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;

  if (pageNum < 1) return { page: 1, limit: limitNum };
  if (limitNum < 1 || limitNum > 100) return { page: pageNum, limit: 10 };

  return { page: pageNum, limit: limitNum };
};

const transformHistoryRecord = (record) => ({
  id: record.id,
  pdfUrl: record.pdf,
  jsonUrl: record.json,
  pdfFilename: record.pdf_filename,
  jsonFilename: record.json_filename,
  createdAt: record.created_at,
  updatedAt: record.updated_at,
});

const fetchHistoryRecords = async (page, limit) => {
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("history")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new Error(`Failed to fetch history records: ${error.message}`);
  }

  return { data, count };
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }

  try {
    const { page: rawPage = 1, limit: rawLimit = 10 } = req.query;
    const { page, limit } = validatePaginationParams(rawPage, rawLimit);

    const { data: historyRecords, count } = await fetchHistoryRecords(
      page,
      limit
    );

    const totalPages = Math.ceil(count / limit);
    const transformedRecords = historyRecords.map(transformHistoryRecord);

    return res.status(200).json({
      success: true,
      data: transformedRecords,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: count,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
