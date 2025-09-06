const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const FALLBACK_VERSION = {
  version: "1.3.3",
  buildInfo: "unknown",
  commitCount: 33,
  branch: "main",
};

function calculateVersion(commitCount) {
  const count = parseInt(commitCount);
  return {
    major: Math.floor(count / 100) || 1,
    minor: Math.floor((count % 100) / 10),
    patch: count % 10,
  };
}

function generateLocalVersion() {
  try {
    const commitCount = execSync("git rev-list --count HEAD", { encoding: "utf8" }).trim();
    const commitHash = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
    const branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf8" }).trim();

    const { major, minor, patch } = calculateVersion(commitCount);
    const timestamp = new Date().toISOString();

    return {
      version: `${major}.${minor}.${patch}`,
      buildInfo: commitHash,
      commitCount: parseInt(commitCount),
      branch,
      timestamp,
      buildTime: timestamp,
    };
  } catch {
    const timestamp = new Date().toISOString();
    return {
      ...FALLBACK_VERSION,
      timestamp,
      buildTime: timestamp,
    };
  }
}

function generateVercelVersion() {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || "unknown";
  const branch = process.env.VERCEL_GIT_COMMIT_REF?.replace("refs/heads/", "") || "main";
  const timestamp = new Date().toISOString();
  
  const versionInfo = {
    ...FALLBACK_VERSION,
    buildInfo: commitSha,
    branch,
    timestamp,
    buildTime: timestamp,
  };

  return versionInfo;
}

function writeVersionFile(versionInfo) {
  const outputPath = path.join(process.cwd(), "public", "version.json");
  fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));
}

const versionInfo = process.env.VERCEL ? generateVercelVersion() : generateLocalVersion();
writeVersionFile(versionInfo);
