import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const DEFAULT_VERSION = { version: "1.3.3", commitCount: 33 };
const DEFAULT_FALLBACK = {
  version: "1.3.3",
  buildInfo: "dev",
  commitCount: 33,
  branch: "main",
  timestamp: new Date().toISOString(),
};

const GIT_COMMANDS = {
  commitCount: "git rev-list --count HEAD",
  commitHash: "git rev-parse --short HEAD",
  branch: "git rev-parse --abbrev-ref HEAD",
};

const EXEC_OPTIONS = {
  encoding: "utf8",
  cwd: process.cwd(),
};

function executeGitCommand(command) {
  return execSync(command, EXEC_OPTIONS).trim();
}

function calculateVersionFromCommits(commitCount) {
  const count = parseInt(commitCount);
  return {
    major: Math.floor(count / 100) || 1,
    minor: Math.floor((count % 100) / 10),
    patch: count % 10,
  };
}

function isProductionEnvironment() {
  return (
    typeof window === "undefined" &&
    (process.env.VERCEL || process.env.NODE_ENV === "production")
  );
}

function getProductionVersionInfo() {
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) ||
                   process.env.GITHUB_SHA?.substring(0, 7) ||
                   "prod";

  const branch = process.env.VERCEL_GIT_COMMIT_REF?.replace("refs/heads/", "") ||
                process.env.GITHUB_REF_NAME ||
                "main";

  let versionInfo = DEFAULT_VERSION;
  
  try {
    const versionPath = path.join(process.cwd(), "public", "version.json");
    const versionFile = JSON.parse(fs.readFileSync(versionPath, "utf8"));
    
    if (versionFile.version && versionFile.commitCount) {
      versionInfo = {
        version: versionFile.version,
        commitCount: versionFile.commitCount,
      };
    }
  } catch {
    versionInfo = DEFAULT_VERSION;
  }

  return {
    version: versionInfo.version,
    buildInfo: commitSha,
    commitCount: versionInfo.commitCount,
    branch,
    timestamp: new Date().toISOString(),
  };
}

function getLocalVersionInfo() {
  try {
    const commitCount = executeGitCommand(GIT_COMMANDS.commitCount);
    const commitHash = executeGitCommand(GIT_COMMANDS.commitHash);
    const branch = executeGitCommand(GIT_COMMANDS.branch);

    const { major, minor, patch } = calculateVersionFromCommits(commitCount);

    return {
      version: `${major}.${minor}.${patch}`,
      buildInfo: commitHash,
      commitCount: parseInt(commitCount),
      branch,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return DEFAULT_FALLBACK;
  }
}

export function getVersion() {
  return isProductionEnvironment()
    ? getProductionVersionInfo()
    : getLocalVersionInfo();
}

export function getVersionString() {
  const { version, buildInfo } = getVersion();
  return `${version} (${buildInfo})`;
}
