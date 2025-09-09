import { useState, useEffect } from "react";
import useInterval from "./useInterval";

const useSettings = () => {
  const [settings, setSettings] = useState({
    maxPlayers: null,
    maxRounds: null,
    allowUnlimited: true,
  });

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/player/settings-status");
      if (!response.ok) throw new Error("Failed to fetch settings");
      const result = await response.json();
      if (result.success && result.data) {
        setSettings({
          maxPlayers: result.data.maxPlayers,
          maxRounds: result.data.rounds,
          allowUnlimited: result.data.unlimited,
        });
      }
    } catch (error) {
      setSettings({
        maxPlayers: null,
        maxRounds: null,
        allowUnlimited: true,
      });
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useInterval(fetchSettings);

  return { settings };
};

export default useSettings;
