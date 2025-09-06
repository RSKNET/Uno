import { useState, useEffect } from "react";

export const useVersion = () => {
  const [versionInfo, setVersionInfo] = useState({
    version: "1.0.0",
    buildInfo: "loading...",
    commitCount: 0,
    branch: "unknown",
    timestamp: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch("/api/version");
        const result = await response.json();

        if (result.success) {
          setVersionInfo(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch version:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersion();
  }, []);

  return { versionInfo, isLoading };
};
