import { execSync } from "child_process";

export function getVersion() {
  try {
    const commitCount = execSync("git rev-list --count HEAD", {
      encoding: "utf8",
      cwd: process.cwd(),
    }).trim();

    const commitHash = execSync("git rev-parse --short HEAD", {
      encoding: "utf8",
      cwd: process.cwd(),
    }).trim();

    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
      cwd: process.cwd(),
    }).trim();

    const major = Math.floor(parseInt(commitCount) / 100) || 1;
    const minor = Math.floor((parseInt(commitCount) % 100) / 10);
    const patch = parseInt(commitCount) % 10;

    const version = `${major}.${minor}.${patch}`;
    const buildInfo = `${commitHash}`;

    return {
      version,
      buildInfo,
      commitCount: parseInt(commitCount),
      branch,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      version: "1.0.0",
      buildInfo: "dev",
      commitCount: 0,
      branch: "unknown",
      timestamp: new Date().toISOString(),
    };
  }
}

export function getVersionString() {
  const { version, buildInfo } = getVersion();
  return `${version} (${buildInfo})`;
}
