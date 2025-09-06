const fs = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const DEFAULT_FALLBACK = {
  version: "1.3.1",
  buildInfo: "unknown",
  commitCount: 31,
  branch: "unknown",
};

const GIT_COMMANDS = {
  commitCount: "git rev-list --count HEAD",
  commitHash: "git rev-parse --short HEAD",
  branch: "git rev-parse --abbrev-ref HEAD",
};

const EXEC_OPTIONS = { encoding: "utf8" };

function executeGitCommand(command) {
  return execSync(command, EXEC_OPTIONS).trim();
}

function calculateVersion(commitCount) {
  const count = parseInt(commitCount);
  return {
    major: Math.floor(count / 100) || 1,
    minor: Math.floor((count % 100) / 10),
    patch: count % 10,
  };
}

function createVersionInfo() {
  const commitCount = executeGitCommand(GIT_COMMANDS.commitCount);
  const commitHash = executeGitCommand(GIT_COMMANDS.commitHash);
  const branch = executeGitCommand(GIT_COMMANDS.branch);

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
}

function createFallbackVersion() {
  const timestamp = new Date().toISOString();

  return {
    ...DEFAULT_FALLBACK,
    version: process.env.npm_package_version || DEFAULT_FALLBACK.version,
    timestamp,
    buildTime: timestamp,
  };
}

function writeVersionFile(versionInfo) {
  const outputPath = path.join(process.cwd(), "public", "version.json");
  fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));
  return outputPath;
}

function generateVersionInfo() {
  try {
    const versionInfo = createVersionInfo();
    writeVersionFile(versionInfo);
  } catch (error) {
    const fallbackVersion = createFallbackVersion();
    writeVersionFile(fallbackVersion);
  }
}

generateVersionInfo();
