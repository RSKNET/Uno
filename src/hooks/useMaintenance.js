import { useState, useEffect, useRef } from "react";
import useInterval from "./useInterval";

const useMaintenance = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const previousMaintenanceRef = useRef(false);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch("/api/player/settings-status");

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        const maintenanceStatus = Boolean(result.data.maintenance);
        setIsMaintenance(maintenanceStatus);
        previousMaintenanceRef.current = maintenanceStatus;
      } else {
        setIsMaintenance(false);
      }
    } catch (error) {
      setIsMaintenance(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkMaintenanceStatus();
  }, []);

  useInterval(checkMaintenanceStatus);

  return {
    isMaintenance,
    isLoading,
  };
};

export default useMaintenance;
