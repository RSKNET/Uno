import { useState, useEffect, useRef } from "react";
import useInterval from "./useInterval";

const useMaintenance = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const previousMaintenanceRef = useRef(false);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch("/api/settings-status");
      const result = await response.json();

      if (result.success) {
        const maintenanceStatus = result.data.maintenance;
        setIsMaintenance(maintenanceStatus);
        previousMaintenanceRef.current = maintenanceStatus;
      }
    } catch (error) {
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
