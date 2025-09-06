import { useState, useEffect } from "react";

const INITIAL_VERSION_STATE = {
  version: "1.0.0",
  buildInfo: "loading...",
  commitCount: 0,
  branch: "unknown",
  timestamp: new Date().toISOString(),
};

export const useVersion = () => {
  const [versionInfo, setVersionInfo] = useState(INITIAL_VERSION_STATE);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch("/api/version");
        const result = await response.json();

        if (result.success) {
          setVersionInfo(result.data);
        }
      } catch {
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersion();
  }, []);

  return { versionInfo, isLoading };
};
