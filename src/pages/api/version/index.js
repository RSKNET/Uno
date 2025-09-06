import { getVersion } from "../../../utils/version";

export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      error: "Method tidak didukung",
    });
  }

  try {
    const versionInfo = getVersion();
    return res.status(200).json({
      success: true,
      data: versionInfo,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Gagal mendapatkan informasi versi",
    });
  }
}
